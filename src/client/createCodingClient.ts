import type { CodingClient, CodingClientOptions } from "./types.js";
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
      "A fetch implementation is required. Pass options.fetch or use Node 18+.",
    );
  }

  return candidate;
}

/**
 * 创建轻量的 CODING SDK 客户端，并归一化共享调用配置。
 *
 * @param options 客户端初始化配置。
 * @returns 可供各 action 复用的共享客户端。
 */
export function createCodingClient(options: CodingClientOptions): CodingClient {
  const config = Object.freeze({
    auth: options.auth,
    baseUrl: new URL(options.baseUrl.toString()),
    fetch: resolveFetch(options.fetch),
    headers: options.headers,
    logger: options.logger,
    retry: {
      ...DEFAULT_RETRY_OPTIONS,
      ...options.retry,
      retryableStatusCodes:
        options.retry?.retryableStatusCodes ??
        DEFAULT_RETRY_OPTIONS.retryableStatusCodes,
      retryableTags:
        options.retry?.retryableTags ?? DEFAULT_RETRY_OPTIONS.retryableTags,
    },
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