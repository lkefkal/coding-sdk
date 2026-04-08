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

/**
 * 调用指定 action，并返回经过 schema 解码后的响应结果。
 *
 * @param config 已归一化的客户端配置。
 * @param spec 当前 action 的规格定义。
 * @param input 当前 action 的请求参数。
 * @param options 本次调用的局部覆盖配置。
 * @returns 解码后的 action 响应数据。
 */
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