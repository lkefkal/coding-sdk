import type {
  InvokeOptions,
  ResolvedCodingClientConfig,
  RetryOptions,
} from "../client/types.js";
import type {
  ActionSpec,
  AnySchema,
  SchemaType,
} from "./actionSpec.js";
import { invokeActionRuntime } from "../internal/effect/invokeEffect.js";

export const DEFAULT_RETRY_OPTIONS: RetryOptions = Object.freeze({
  maxAttempts: 1,
  baseDelayMs: 150,
  maxDelayMs: 1_000,
  retryableStatusCodes: [408, 429, 500, 502, 503, 504],
  retryableTags: ["TimeoutError", "TransportError"],
});

export async function invokeAction<
  TRequestSchema extends AnySchema,
  TResponseSchema extends AnySchema,
>(
  config: ResolvedCodingClientConfig,
  spec: ActionSpec<TRequestSchema, TResponseSchema>,
  input: SchemaType<TRequestSchema>,
  options?: InvokeOptions,
): Promise<SchemaType<TResponseSchema>> {
  return invokeActionRuntime({
    config,
    input,
    options,
    spec,
  });
}