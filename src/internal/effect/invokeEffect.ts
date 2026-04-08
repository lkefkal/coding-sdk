import { Effect, Schema } from "effect";

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
import { unwrapCodingResponse } from "../../core/response.js";

type JsonRecord = Record<string, unknown>;

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
 * @returns 可直接用于构造请求体的对象记录。
 * @throws {DecodeError} 当请求 schema 没有解码为对象时抛出。
 */
function toJsonRecord(value: unknown, action: string): JsonRecord {
  if (!isRecord(value)) {
    throw new DecodeError(
      `${action} 的请求 schema 必须解码为对象`,
      {
        action,
        phase: "request",
      },
    );
  }

  return value;
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
function createAbortState(parentSignal: AbortSignal | undefined, timeoutMs: number) {
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
 * @throws {TransportError} 当调用方已经取消时抛出。
 */
function throwIfAborted(action: string, signal: AbortSignal | undefined): void {
  if (signal?.aborted !== true) {
    return;
  }

  throw new TransportError(`调用 ${action} 时请求已被取消`, {
    action,
    cause: signal.reason,
  });
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
 * @returns 等待完成后的 Promise。
 * @throws {TransportError} 当等待期间被调用方取消时抛出。
 */
function wait(ms: number, signal: AbortSignal | undefined): Promise<void> {
  return new Promise((resolve, reject) => {
    if (signal?.aborted === true) {
      reject(
        new TransportError("请求在重试等待期间已被调用方取消", {
          cause: signal.reason,
        }),
      );
      return;
    }

    let timeoutId: ReturnType<typeof setTimeout> | undefined;

    const handleAbort = () => {
      if (timeoutId != null) {
        clearTimeout(timeoutId);
      }

      signal?.removeEventListener("abort", handleAbort);
      reject(
        new TransportError("请求在重试等待期间已被调用方取消", {
          cause: signal?.reason,
        }),
      );
    };

    timeoutId = setTimeout(() => {
      signal?.removeEventListener("abort", handleAbort);
      resolve();
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
 * 使用 effect schema 对输入值执行运行时解码。
 *
 * @param schema 当前阶段使用的 schema。
 * @param value 待解码的原始值。
 * @param action 当前调用的 action 名称。
 * @param phase 当前解码阶段。
 * @param requestId 可选的请求 ID，用于补充错误上下文。
 * @returns 解码后的强类型结果。
 * @throws {DecodeError} 当值与 schema 不匹配时抛出。
 */
async function decodeWithSchema<TSchema extends AnySchema>(
  schema: TSchema,
  value: unknown,
  action: string,
  phase: "request" | "response",
  requestId?: string,
): Promise<SchemaType<TSchema>> {
  try {
    return await Schema.decodeUnknownPromise(schema)(value);
  } catch (error) {
    throw new DecodeError(
      `${action} 的${phase === "request" ? "请求" : "响应"}负载解码失败：${toErrorMessage(error)}`,
      {
        action,
        cause: error,
        phase,
        requestId,
      },
    );
  }
}

/**
 * 执行一次实际的 HTTP 请求尝试，并完成鉴权、解包与解码。
 *
 * @param args 单次调用所需的完整参数。
 * @returns 解码后的 action 响应结果。
 * @throws {DecodeError} 当请求或响应结构不匹配 schema 时抛出。
 * @throws {UnauthorizedError} 当 HTTP 或业务层返回鉴权失败时抛出。
 * @throws {HttpError} 当响应状态码不是成功状态时抛出。
 * @throws {TimeoutError} 当请求超时时抛出。
 * @throws {TransportError} 当请求被取消或发生底层传输异常时抛出。
 */
async function executeAttempt<
  TRequestSchema extends AnySchema,
  TResponseSchema extends AnySchema,
>({
  config,
  spec,
  input,
  options,
}: InvokeActionEffectArgs<TRequestSchema, TResponseSchema>): Promise<
  SchemaType<TResponseSchema>
> {
  const validatedInput = await decodeWithSchema(
    spec.requestSchema,
    input,
    spec.action,
    "request",
  );
  const requestBody = toJsonRecord(validatedInput, spec.action);
  const placement = options?.actionPlacementOverride ?? spec.actionPlacement ?? "body";
  const authorization = await resolveAuthorization(config);
  const headers = mergeHeaders(config.headers, options?.headers, authorization);
  const url = buildUrl(config.baseUrl, spec, placement, options?.query);
  const body = buildBody(requestBody, spec, placement);
  const timeoutMs = options?.timeoutMs ?? config.timeoutMs;
  const abortState = createAbortState(options?.signal, timeoutMs);

  config.logger?.debug?.("coding-sdk 请求开始", {
    action: spec.action,
    method: spec.method ?? "POST",
    url: url.toString(),
  });

  try {
    const response = await config.fetch(url, {
      method: spec.method ?? "POST",
      headers,
      body: JSON.stringify(body),
      signal: abortState.signal,
    });

    if (response.status === 401 || response.status === 403) {
      const responseBody = await response.text().catch(() => undefined);

      throw new UnauthorizedError(
        `调用 ${spec.action} 时鉴权失败`,
        {
          action: spec.action,
          statusCode: response.status,
        },
      );
    }

    if (!response.ok) {
      const responseBody = await response.text().catch(() => undefined);

      throw new HttpError(
        `HTTP ${response.status} while invoking ${spec.action}`,
        {
          action: spec.action,
          responseBody,
          statusCode: response.status,
          statusText: response.statusText,
        },
      );
    }

    let payload: unknown;

    try {
      payload = await response.json();
    } catch (error) {
      throw new DecodeError(
        `${spec.action} 的 JSON 响应解析失败：${toErrorMessage(error)}`,
        {
          action: spec.action,
          cause: error,
          phase: "json",
        },
      );
    }

    const unwrapped = unwrapCodingResponse(payload, spec.action);

    return await decodeWithSchema(
      spec.responseSchema,
      unwrapped.payload,
      spec.action,
      "response",
      unwrapped.requestId,
    );
  } catch (error) {
    if (abortState.didTimeout()) {
      throw new TimeoutError(`调用 ${spec.action} 超时`, {
        action: spec.action,
        cause: error,
      });
    }

    if (isAbortError(error)) {
      throw new TransportError(`调用 ${spec.action} 时请求已被取消`, {
        action: spec.action,
        cause: error,
      });
    }

    if (!isCodingSdkError(error)) {
      throw new TransportError(
        `调用 ${spec.action} 时发生未预期异常：${toErrorMessage(error)}`,
        {
          action: spec.action,
          cause: error,
        },
      );
    }

    throw error;
  } finally {
    abortState.cleanup();
  }
}

/**
 * 按照重试配置执行 action 调用，直到成功或达到终止条件。
 *
 * @param args 单次调用所需的完整参数。
 * @returns 解码后的 action 响应结果。
 * @throws {Error} 当达到最大重试次数或遇到不可重试错误时抛出。
 */
async function invokeWithRetry<
  TRequestSchema extends AnySchema,
  TResponseSchema extends AnySchema,
>(
  args: InvokeActionEffectArgs<TRequestSchema, TResponseSchema>,
): Promise<SchemaType<TResponseSchema>> {
  const retry = mergeRetryOptions(args.config.retry, args.options?.retry);
  const callerSignal = args.options?.signal;

  for (let attempt = 1; ; attempt += 1) {
    throwIfAborted(args.spec.action, callerSignal);

    try {
      return await executeAttempt(args);
    } catch (error) {
      if (isCallerAbort(error, callerSignal)) {
        throw error;
      }

      if (!shouldRetry(error, retry, attempt)) {
        throw error;
      }

      const delayMs = backoffDelayMs(retry, attempt);

      args.config.logger?.warn?.("coding-sdk 请求重试", {
        action: args.spec.action,
        attempt,
        delayMs,
        error: toErrorMessage(error),
      });

      await wait(delayMs, callerSignal).catch((waitError) => {
        if (waitError instanceof TransportError) {
          throw new TransportError(
            `调用 ${args.spec.action} 时请求已被取消`,
            {
              action: args.spec.action,
              cause: waitError.cause,
            },
          );
        }

        throw waitError;
      });
    }
  }
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
  return invokeWithRetry(args);
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
  return Effect.tryPromise({
    try: () => invokeActionRuntime(args),
    catch: (error) => toCodingSdkError(args.spec.action, error),
  });
}