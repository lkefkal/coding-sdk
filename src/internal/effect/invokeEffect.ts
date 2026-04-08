import { Cause, Effect, Exit, Option, Schema } from "effect";

import type {
  InvokeOptions,
  ResolvedCodingClientConfig,
  RetryOptions,
} from "../../client/types.js";
import { mergeHeaders, resolveAuthorization } from "../../core/auth.js";
import type {
  ActionSpec,
  AnySchema,
  SchemaType,
} from "../../core/actionSpec.js";
import {
  DecodeError,
  HttpError,
  TimeoutError,
  TransportError,
  UnauthorizedError,
  isCodingSdkError,
  toErrorMessage,
} from "../../core/errors.js";
import { unwrapCodingResponseEffect } from "../../core/response.js";

type JsonRecord = Record<string, unknown>;

interface AbortState {
  readonly signal: AbortSignal;
  readonly didTimeout: () => boolean;
  readonly cleanup: () => void;
}

export interface InvokeActionEffectArgs<
  TRequestSchema extends AnySchema,
  TResponseSchema extends AnySchema,
> {
  readonly config: ResolvedCodingClientConfig;
  readonly spec: ActionSpec<TRequestSchema, TResponseSchema>;
  readonly input: SchemaType<TRequestSchema>;
  readonly options: InvokeOptions | undefined;
}

function isRecord(value: unknown): value is JsonRecord {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

/**
 * 将解码后的请求值收窄为可序列化的对象记录。
 *
 * @param value 已经通过 schema 解码的请求值。
 * @param action 当前调用的 action 名称。
 * @returns 包含对象记录或 DecodeError 的 Effect。
 */
function toJsonRecord(
  value: unknown,
  action: string,
): Effect.Effect<JsonRecord, DecodeError> {
  if (!isRecord(value)) {
    return Effect.fail(
      new DecodeError(`${action} 的请求 schema 必须解码为对象`, {
        action,
        phase: "request",
      }),
    );
  }

  return Effect.succeed(value);
}

/**
 * 合并默认重试配置与本次调用的局部覆盖配置。
 *
 * @param defaults 客户端级默认重试配置。
 * @param overrides 当前调用的重试覆盖配置。
 * @returns 最终生效的重试配置。
 */
function mergeRetryOptions(
  defaults: RetryOptions,
  overrides: Partial<RetryOptions> | undefined,
): RetryOptions {
  return {
    ...defaults,
    ...overrides,
    retryableStatusCodes:
      overrides?.retryableStatusCodes ?? defaults.retryableStatusCodes,
    retryableTags: overrides?.retryableTags ?? defaults.retryableTags,
  };
}

/**
 * 根据 action 规格与调用选项构造最终请求 URL。
 *
 * @param baseUrl 客户端基础 URL。
 * @param spec 当前 action 规格。
 * @param placement Action 参数放置位置。
 * @param query 调用方附加的查询参数。
 * @returns 包含最终查询参数的请求 URL。
 */
function buildUrl(
  baseUrl: URL,
  spec: ActionSpec<AnySchema, AnySchema>,
  placement: "body" | "query" | "both",
  query: InvokeOptions["query"],
): URL {
  const url = new URL(spec.path ?? "", baseUrl);

  if (query != null) {
    for (const [key, value] of Object.entries(query)) {
      if (value == null) {
        continue;
      }

      url.searchParams.set(key, String(value));
    }
  }

  if (placement === "query" || placement === "both") {
    url.searchParams.set(spec.actionQueryName ?? "Action", spec.action);
  }

  return url;
}

/**
 * 根据 action 放置策略构造最终请求体。
 *
 * @param requestBody 解码后的业务请求体。
 * @param spec 当前 action 规格。
 * @param placement Action 参数放置位置。
 * @returns 最终要发送的 JSON 请求体。
 */
function buildBody(
  requestBody: JsonRecord,
  spec: ActionSpec<AnySchema, AnySchema>,
  placement: "body" | "query" | "both",
): JsonRecord {
  if (placement === "body" || placement === "both") {
    return {
      ...requestBody,
      [spec.actionBodyName ?? "Action"]: spec.action,
    };
  }

  return requestBody;
}

/**
 * 为单次请求创建超时与父级取消信号的桥接状态。
 *
 * @param parentSignal 调用方传入的取消信号。
 * @param timeoutMs 本次请求的超时时间。
 * @returns 包含实际请求 signal、超时标记与清理函数的状态对象。
 */
function createAbortState(
  parentSignal: AbortSignal | undefined,
  timeoutMs: number,
): AbortState {
  const controller = new AbortController();
  let timedOut = false;
  let timeoutId: ReturnType<typeof setTimeout> | undefined;

  const handleParentAbort = () => {
    controller.abort(parentSignal?.reason);
  };

  if (parentSignal != null) {
    if (parentSignal.aborted) {
      controller.abort(parentSignal.reason);
    } else {
      parentSignal.addEventListener("abort", handleParentAbort, {
        once: true,
      });
    }
  }

  if (timeoutMs > 0) {
    timeoutId = setTimeout(() => {
      timedOut = true;
      controller.abort(new Error(`Request timed out after ${timeoutMs}ms`));
    }, timeoutMs);
  }

  return {
    signal: controller.signal,
    didTimeout: () => timedOut,
    cleanup: () => {
      if (timeoutId != null) {
        clearTimeout(timeoutId);
      }

      if (parentSignal != null) {
        parentSignal.removeEventListener("abort", handleParentAbort);
      }
    },
  };
}

/**
 * 判断错误是否为标准 AbortError。
 *
 * @param error 待判断的错误对象。
 * @returns 如果是 AbortError，则返回 true。
 */
function isAbortError(error: unknown): boolean {
  return error instanceof Error && error.name === "AbortError";
}

/**
 * 判断当前失败是否源自调用方主动取消。
 *
 * @param error 当前捕获到的错误。
 * @param signal 调用方传入的取消信号。
 * @returns 如果是调用方主动取消，则返回 true。
 */
function isCallerAbort(error: unknown, signal: AbortSignal | undefined): boolean {
  return (
    signal?.aborted === true &&
    error instanceof TransportError &&
    isAbortError(error.cause)
  );
}

/**
 * 在重试边界上优先响应调用方取消，避免继续发送额外请求。
 *
 * @param action 当前调用的 action 名称。
 * @param signal 调用方传入的取消信号。
 * @returns 当调用方未取消时返回成功，否则返回 TransportError。
 */
function throwIfAborted(
  action: string,
  signal: AbortSignal | undefined,
): Effect.Effect<void, TransportError> {
  if (signal?.aborted !== true) {
    return Effect.succeed(undefined);
  }

  return Effect.fail(
    new TransportError(`调用 ${action} 时请求已被取消`, {
      action,
      cause: signal.reason,
    }),
  );
}

/**
 * 判断当前错误在本次尝试后是否应继续重试。
 *
 * @param error 当前捕获到的错误。
 * @param retry 当前生效的重试配置。
 * @param attempt 当前尝试次数，从 1 开始。
 * @returns 如果应继续重试，则返回 true。
 */
function shouldRetry(error: unknown, retry: RetryOptions, attempt: number): boolean {
  if (attempt >= retry.maxAttempts) {
    return false;
  }

  if (error instanceof TimeoutError || error instanceof TransportError) {
    return true;
  }

  if (error instanceof HttpError) {
    return retry.retryableStatusCodes.includes(error.statusCode);
  }

  if (isCodingSdkError(error)) {
    return retry.retryableTags.includes(error._tag);
  }

  return false;
}

/**
 * 等待下一次重试，并在等待期间响应调用方取消。
 *
 * @param ms 等待的毫秒数。
 * @param signal 调用方传入的取消信号。
 * @param action 当前调用的 action 名称。
 * @returns 等待完成后的 Effect。
 */
function wait(
  action: string,
  ms: number,
  signal: AbortSignal | undefined,
): Effect.Effect<void, TransportError> {
  return Effect.async<void, TransportError>((resume) => {
    if (signal?.aborted === true) {
      resume(
        Effect.fail(new TransportError("请求在重试等待期间已被调用方取消", {
          action,
          cause: signal.reason,
        })),
      );
      return;
    }

    let timeoutId: ReturnType<typeof setTimeout> | undefined;

    const handleAbort = () => {
      if (timeoutId != null) {
        clearTimeout(timeoutId);
      }

      signal?.removeEventListener("abort", handleAbort);
      resume(
        Effect.fail(new TransportError("请求在重试等待期间已被调用方取消", {
          action,
          cause: signal?.reason,
        })),
      );
    };

    timeoutId = setTimeout(() => {
      signal?.removeEventListener("abort", handleAbort);
      resume(Effect.succeed(undefined));
    }, ms);

    signal?.addEventListener("abort", handleAbort, { once: true });
  });
}

/**
 * 计算当前重试尝试对应的指数退避时长。
 *
 * @param retry 当前生效的重试配置。
 * @param attempt 当前尝试次数，从 1 开始。
 * @returns 本次重试前需要等待的毫秒数。
 */
function backoffDelayMs(retry: RetryOptions, attempt: number): number {
  const rawDelay = retry.baseDelayMs * 2 ** Math.max(0, attempt - 1);
  return Math.min(rawDelay, retry.maxDelayMs);
}

/**
 * 将未知错误规范化为 SDK 可识别的错误类型。
 *
 * @param action 当前调用的 action 名称。
 * @param error 原始错误对象。
 * @returns SDK 稳定错误类型。
 */
function toCodingSdkError(action: string, error: unknown): Error {
  if (isCodingSdkError(error)) {
    return error;
  }

  return new TransportError(
    `调用 ${action} 时发生未预期异常：${toErrorMessage(error)}`,
    {
      action,
      cause: error,
    },
  );
}

/**
 * 将请求执行阶段捕获到的异常收敛为稳定错误类型。
 *
 * @param action 当前调用的 action 名称。
 * @param error 原始错误对象。
 * @param didTimeout 当前失败是否由超时触发。
 * @returns 规范化后的 SDK 错误。
 */
function toAttemptError(action: string, error: unknown, didTimeout: boolean): Error {
  if (didTimeout) {
    return new TimeoutError(`调用 ${action} 超时`, {
      action,
      cause: error,
    });
  }

  if (isAbortError(error)) {
    return new TransportError(`调用 ${action} 时请求已被取消`, {
      action,
      cause: error,
    });
  }

  return toCodingSdkError(action, error);
}

/**
 * 以 Effect 形式解析当前请求应使用的鉴权配置。
 *
 * @param config 已归一化的客户端配置。
 * @param action 当前调用的 action 名称。
 * @returns 包含鉴权配置或稳定错误类型的 Effect。
 */
function resolveAuthorizationEffect(
  config: ResolvedCodingClientConfig,
  action: string,
): Effect.Effect<Awaited<ReturnType<typeof resolveAuthorization>>, Error> {
  return Effect.tryPromise({
    try: () => resolveAuthorization(config),
    catch: (error) => toCodingSdkError(action, error),
  });
}

/**
 * 读取响应文本；如果响应体已经不可再读，则返回 undefined。
 *
 * @param response 当前 HTTP 响应。
 * @returns 包含响应文本或 undefined 的 Effect。
 */
function readResponseText(response: Response): Effect.Effect<string | undefined> {
  return Effect.catchAll(
    Effect.tryPromise(() => response.text()),
    () => Effect.succeed(undefined),
  );
}

/**
 * 以 Effect 形式解析 JSON 响应体。
 *
 * @param response 当前 HTTP 响应。
 * @param action 当前调用的 action 名称。
 * @returns 包含 JSON 负载或 DecodeError 的 Effect。
 */
function parseResponseJson(
  response: Response,
  action: string,
): Effect.Effect<unknown, DecodeError> {
  return Effect.tryPromise({
    try: () => response.json(),
    catch: (error) =>
      new DecodeError(`${action} 的 JSON 响应解析失败：${toErrorMessage(error)}`, {
        action,
        cause: error,
        phase: "json",
      }),
  });
}

/**
 * 从 Effect 失败原因中尽量还原原始 SDK 错误。
 *
 * @param action 当前调用的 action 名称。
 * @param cause Effect 失败原因。
 * @returns 优先返回失败通道中的 typed error，兜底时再压缩 cause。
 */
function toRuntimeError(action: string, cause: Cause.Cause<Error>): Error {
  const failure = Cause.failureOption(cause);

  if (Option.isSome(failure)) {
    return failure.value;
  }

  return toCodingSdkError(action, Cause.squash(cause));
}

/**
 * 以 Effect 形式发起 HTTP 请求。
 *
 * @param config 已归一化的客户端配置。
 * @param spec 当前 action 规格。
 * @param url 最终请求 URL。
 * @param headers 最终请求头。
 * @param body 最终请求体。
 * @param abortState 当前请求的取消与超时状态。
 * @returns 包含 HTTP 响应或稳定错误类型的 Effect。
 */
function fetchResponseEffect(
  config: ResolvedCodingClientConfig,
  spec: ActionSpec<AnySchema, AnySchema>,
  url: URL,
  headers: Headers,
  body: JsonRecord,
  abortState: AbortState,
): Effect.Effect<Response, Error> {
  return Effect.tryPromise({
    try: () =>
      config.fetch(url, {
        method: spec.method ?? "POST",
        headers,
        body: JSON.stringify(body),
        signal: abortState.signal,
      }),
    catch: (error) => toAttemptError(spec.action, error, abortState.didTimeout()),
  });
}

/**
 * 使用 effect schema 对输入值执行运行时解码。
 *
 * @param schema 当前阶段使用的 schema。
 * @param value 待解码的原始值。
 * @param action 当前调用的 action 名称。
 * @param phase 当前解码阶段。
 * @param requestId 可选的请求 ID，用于补充错误上下文。
 * @returns 包含解码结果或 DecodeError 的 Effect。
 */
function decodeWithSchema<TSchema extends AnySchema>(
  schema: TSchema,
  value: unknown,
  action: string,
  phase: "request" | "response",
  requestId?: string,
): Effect.Effect<SchemaType<TSchema>, DecodeError> {
  return Effect.tryPromise({
    try: () => Schema.decodeUnknownPromise(schema)(value),
    catch: (error) =>
      new DecodeError(
        `${action} 的${phase === "request" ? "请求" : "响应"}负载解码失败：${toErrorMessage(error)}`,
        {
          action,
          cause: error,
          phase,
          requestId,
        },
      ),
  });
}

/**
 * 执行一次实际的 HTTP 请求尝试，并完成鉴权、解包与解码。
 *
 * @param args 单次调用所需的完整参数。
 * @returns 包含解码结果或稳定错误类型的 Effect。
 */
function executeAttempt<
  TRequestSchema extends AnySchema,
  TResponseSchema extends AnySchema,
>({
  config,
  spec,
  input,
  options,
}: InvokeActionEffectArgs<TRequestSchema, TResponseSchema>): Effect.Effect<
  SchemaType<TResponseSchema>,
  Error
> {
  const placement = options?.actionPlacementOverride ?? spec.actionPlacement ?? "body";
  const timeoutMs = options?.timeoutMs ?? config.timeoutMs;

  return Effect.acquireUseRelease(
    Effect.sync(() => createAbortState(options?.signal, timeoutMs)),
    (abortState) =>
      Effect.gen(function* () {
        const validatedInput = yield* decodeWithSchema(
          spec.requestSchema,
          input,
          spec.action,
          "request",
        );
        const requestBody = yield* toJsonRecord(validatedInput, spec.action);
        const authorization = yield* resolveAuthorizationEffect(config, spec.action);
        const headers = mergeHeaders(config.headers, options?.headers, authorization);
        const url = buildUrl(config.baseUrl, spec, placement, options?.query);
        const body = buildBody(requestBody, spec, placement);

        config.logger?.debug?.("coding-sdk 请求开始", {
          action: spec.action,
          method: spec.method ?? "POST",
          url: url.toString(),
        });

        const response = yield* fetchResponseEffect(
          config,
          spec,
          url,
          headers,
          body,
          abortState,
        );

        if (response.status === 401 || response.status === 403) {
          const responseBody = yield* readResponseText(response);

          yield* Effect.fail(
            new UnauthorizedError(`调用 ${spec.action} 时鉴权失败`, {
              action: spec.action,
              code: undefined,
              requestId: undefined,
              statusCode: response.status,
              cause: responseBody,
            }),
          );
        }

        if (!response.ok) {
          const responseBody = yield* readResponseText(response);

          yield* Effect.fail(
            new HttpError(`HTTP ${response.status} while invoking ${spec.action}`, {
              action: spec.action,
              responseBody,
              statusCode: response.status,
              statusText: response.statusText,
            }),
          );
        }

        const payload = yield* parseResponseJson(response, spec.action);

        const unwrapped = yield* unwrapCodingResponseEffect(payload, spec.action);

        return yield* decodeWithSchema(
          spec.responseSchema,
          unwrapped.payload,
          spec.action,
          "response",
          unwrapped.requestId,
        );
      }),
    (abortState) => Effect.sync(() => abortState.cleanup()),
  );
}

/**
 * 按照重试配置执行 action 调用，直到成功或达到终止条件。
 *
 * @param args 单次调用所需的完整参数。
 * @returns 包含解码结果或稳定错误类型的 Effect。
 */
function invokeWithRetry<
  TRequestSchema extends AnySchema,
  TResponseSchema extends AnySchema,
>(
  args: InvokeActionEffectArgs<TRequestSchema, TResponseSchema>,
): Effect.Effect<SchemaType<TResponseSchema>, Error> {
  const retry = mergeRetryOptions(args.config.retry, args.options?.retry);
  const callerSignal = args.options?.signal;

  const loop = (attempt: number): Effect.Effect<SchemaType<TResponseSchema>, Error> =>
    Effect.flatMap(throwIfAborted(args.spec.action, callerSignal), () =>
      Effect.catchAll(executeAttempt(args), (error) => {
        if (isCallerAbort(error, callerSignal)) {
          return Effect.fail(error);
        }

        if (!shouldRetry(error, retry, attempt)) {
          return Effect.fail(error);
        }

        const delayMs = backoffDelayMs(retry, attempt);

        args.config.logger?.warn?.("coding-sdk 请求重试", {
          action: args.spec.action,
          attempt,
          delayMs,
          error: toErrorMessage(error),
        });

        return Effect.flatMap(
          wait(args.spec.action, delayMs, callerSignal),
          () => loop(attempt + 1),
        );
      }),
    );

  return loop(1);
}

/**
 * 以 Promise 形式执行 action 调用运行时。
 *
 * @param args 单次调用所需的完整参数。
 * @returns 解码后的 action 响应结果。
 */
export async function invokeActionRuntime<
  TRequestSchema extends AnySchema,
  TResponseSchema extends AnySchema,
>(
  args: InvokeActionEffectArgs<TRequestSchema, TResponseSchema>,
): Promise<SchemaType<TResponseSchema>> {
  const exit = await Effect.runPromiseExit(invokeActionEffect(args));

  if (Exit.isSuccess(exit)) {
    return exit.value;
  }

  throw toRuntimeError(args.spec.action, exit.cause);
}

/**
 * 以 Effect 形式包装 action 调用运行时，供内部组合式实现复用。
 *
 * @param args 单次调用所需的完整参数。
 * @returns 包含解码结果或稳定错误类型的 Effect。
 */
export function invokeActionEffect<
  TRequestSchema extends AnySchema,
  TResponseSchema extends AnySchema,
>(
  args: InvokeActionEffectArgs<TRequestSchema, TResponseSchema>,
): Effect.Effect<SchemaType<TResponseSchema>, Error> {
  return Effect.mapError(
    invokeWithRetry(args),
    (error) => toCodingSdkError(args.spec.action, error),
  );
}