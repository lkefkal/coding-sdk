import type {
  AuthorizationValue,
  ResolvedCodingClientConfig,
  TokenProviderResult,
} from "../client/types.js";

/**
 * 将 token 提供器返回值标准化为统一的鉴权结构。
 *
 * @param value token 提供器返回值。
 * @param defaultScheme 默认鉴权方案。
 * @returns 统一的鉴权配置；当未提供鉴权值时返回 undefined。
 */
function normalizeAuthorization(
  value: TokenProviderResult,
  defaultScheme: string,
): AuthorizationValue | undefined {
  if (value == null) {
    return undefined;
  }

  if (typeof value === "string") {
    return {
      scheme: defaultScheme,
      value,
    };
  }

  return value;
}

/**
 * 解析当前请求应使用的鉴权配置。
 *
 * @param config 已归一化的客户端配置。
 * @returns 最终生效的鉴权配置；当未配置鉴权时返回 undefined。
 */
export async function resolveAuthorization(
  config: ResolvedCodingClientConfig,
): Promise<AuthorizationValue | undefined> {
  const direct =
    config.auth ??
    normalizeAuthorization(config.token, config.tokenType);

  if (direct != null) {
    return direct;
  }

  if (config.tokenProvider == null) {
    return undefined;
  }

  return normalizeAuthorization(await config.tokenProvider(), config.tokenType);
}

/**
 * 将鉴权结构格式化为 HTTP Authorization 头值。
 *
 * @param auth 鉴权配置。
 * @returns 可直接写入 Authorization 请求头的字符串。
 */
export function formatAuthorizationHeader(auth: AuthorizationValue): string {
  return `${auth.scheme} ${auth.value}`.trim();
}

/**
 * 合并默认请求头、局部覆盖请求头与鉴权头，并补齐 JSON 默认头。
 *
 * @param defaults 客户端默认请求头。
 * @param overrides 当前调用的局部请求头覆盖。
 * @param authorization 当前请求解析出的鉴权配置。
 * @returns 最终要发送的请求头集合。
 */
export function mergeHeaders(
  defaults: HeadersInit | undefined,
  overrides: HeadersInit | undefined,
  authorization: AuthorizationValue | undefined,
): Headers {
  const headers = new Headers(defaults);

  new Headers(overrides).forEach((value, key) => {
    headers.set(key, value);
  });

  if (authorization != null && !headers.has("Authorization")) {
    headers.set("Authorization", formatAuthorizationHeader(authorization));
  }

  if (!headers.has("Accept")) {
    headers.set("Accept", "application/json");
  }

  if (!headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }

  return headers;
}