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

function wait(ms: number): Promise<void> {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
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

  for (let attempt = 1; ; attempt += 1) {
    try {
      return await executeAttempt(args);
    } catch (error) {
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

      await wait(delayMs);
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