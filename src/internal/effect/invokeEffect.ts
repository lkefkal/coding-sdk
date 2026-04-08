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

function toJsonRecord(value: unknown, action: string): JsonRecord {
  if (!isRecord(value)) {
    throw new DecodeError(
      `Request schema for ${action} must decode to an object`,
      {
        action,
        phase: "request",
      },
    );
  }

  return value;
}

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

  throw new TransportError(`Request aborted while invoking ${action}`, {
    action,
    cause: signal.reason,
  });
}

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

function backoffDelayMs(retry: RetryOptions, attempt: number): number {
  const rawDelay = retry.baseDelayMs * 2 ** Math.max(0, attempt - 1);
  return Math.min(rawDelay, retry.maxDelayMs);
}

function toCodingSdkError(action: string, error: unknown): Error {
  if (isCodingSdkError(error)) {
    return error;
  }

  return new TransportError(
    `Unexpected failure while invoking ${action}: ${toErrorMessage(error)}`,
    {
      action,
      cause: error,
    },
  );
}

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
      `Failed to decode ${phase} payload for ${action}: ${toErrorMessage(error)}`,
      {
        action,
        cause: error,
        phase,
        requestId,
      },
    );
  }
}

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

  config.logger?.debug?.("coding-sdk request start", {
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
        `Unauthorized while invoking ${spec.action}`,
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
        `Failed to parse JSON response for ${spec.action}: ${toErrorMessage(error)}`,
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
      throw new TimeoutError(`Request timed out while invoking ${spec.action}`, {
        action: spec.action,
        cause: error,
      });
    }

    if (isAbortError(error)) {
      throw new TransportError(`Request aborted while invoking ${spec.action}`, {
        action: spec.action,
        cause: error,
      });
    }

    if (!isCodingSdkError(error)) {
      throw new TransportError(
        `Unexpected failure while invoking ${spec.action}: ${toErrorMessage(error)}`,
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

      args.config.logger?.warn?.("coding-sdk request retry", {
        action: args.spec.action,
        attempt,
        delayMs,
        error: toErrorMessage(error),
      });

      await wait(delayMs, callerSignal).catch((waitError) => {
        if (waitError instanceof TransportError) {
          throw new TransportError(
            `Request aborted while invoking ${args.spec.action}`,
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

export async function invokeActionRuntime<
  TRequestSchema extends AnySchema,
  TResponseSchema extends AnySchema,
>(
  args: InvokeActionEffectArgs<TRequestSchema, TResponseSchema>,
): Promise<SchemaType<TResponseSchema>> {
  return invokeWithRetry(args);
}

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