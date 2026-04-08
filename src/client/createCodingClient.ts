import type {
  AuthorizationValue,
  CodingClient,
  CodingClientOptions,
  RetryOptions,
} from "./types.js";
import { DEFAULT_RETRY_OPTIONS, invokeAction } from "../core/request.js";

/**
 * 解析最终可用的 fetch 实现。
 *
 * @param override 调用方显式传入的 fetch 实现。
 * @returns 可用于发送请求的 fetch 函数。
 * @throws {TypeError} 当运行环境中没有可用 fetch 时抛出。
 */
function resolveFetch(override: typeof fetch | undefined): typeof fetch {
  const candidate = override ?? globalThis.fetch;

  if (typeof candidate !== "function") {
    throw new TypeError(
      "当前运行环境缺少可用的 fetch 实现，请传入 options.fetch 或使用 Node 18+。",
    );
  }

  return candidate;
}

/**
 * 复制鉴权配置，避免 client 创建后受外部对象突变影响。
 *
 * @param auth 调用方传入的鉴权配置。
 * @returns 独立的鉴权配置副本。
 */
function cloneAuthorization(
  auth: AuthorizationValue | undefined,
): AuthorizationValue | undefined {
  if (auth == null) {
    return undefined;
  }

  return {
    scheme: auth.scheme,
    value: auth.value,
  };
}

/**
 * 复制默认请求头，避免外部继续修改原始 headers 对象时污染已创建的 client。
 *
 * @param headers 调用方传入的默认请求头。
 * @returns 独立的请求头实例。
 */
function cloneHeaders(headers: HeadersInit | undefined): Headers | undefined {
  if (headers == null) {
    return undefined;
  }

  return new Headers(headers);
}

/**
 * 归一化并冻结重试配置，确保嵌套数组不会与外部共享引用。
 *
 * @param retry 调用方传入的重试覆盖配置。
 * @returns 独立且只读的重试配置。
 */
function normalizeRetryOptions(
  retry: Partial<RetryOptions> | undefined,
): RetryOptions {
  const retryableStatusCodes = Object.freeze([
    ...(retry?.retryableStatusCodes ?? DEFAULT_RETRY_OPTIONS.retryableStatusCodes),
  ]);
  const retryableTags = Object.freeze([
    ...(retry?.retryableTags ?? DEFAULT_RETRY_OPTIONS.retryableTags),
  ]);

  return Object.freeze({
    ...DEFAULT_RETRY_OPTIONS,
    ...retry,
    retryableStatusCodes,
    retryableTags,
  });
}

/**
 * 创建轻量的 CODING SDK 客户端，并归一化共享调用配置。
 *
 * @param options 客户端初始化配置。
 * @returns 可供各 action 复用的共享客户端。
 */
export function createCodingClient(options: CodingClientOptions): CodingClient {
  const config = Object.freeze({
    auth: cloneAuthorization(options.auth),
    baseUrl: new URL(options.baseUrl.toString()),
    fetch: resolveFetch(options.fetch),
    headers: cloneHeaders(options.headers),
    logger: options.logger,
    retry: normalizeRetryOptions(options.retry),
    timeoutMs: options.timeoutMs ?? 5_000,
    token: options.token,
    tokenProvider: options.tokenProvider,
    tokenType: options.tokenType ?? "Bearer",
  });

  return {
    config,
    invoke: (spec, input, invokeOptions) =>
      invokeAction(config, spec, input, invokeOptions),
  };
}