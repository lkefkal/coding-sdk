import type { CodingClient, CodingClientOptions } from "./types.js";
import { DEFAULT_RETRY_OPTIONS, invokeAction } from "../core/request.js";

function resolveFetch(override: typeof fetch | undefined): typeof fetch {
  const candidate = override ?? globalThis.fetch;

  if (typeof candidate !== "function") {
    throw new TypeError(
      "A fetch implementation is required. Pass options.fetch or use Node 18+.",
    );
  }

  return candidate;
}

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