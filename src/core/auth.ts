import type {
  AuthorizationValue,
  ResolvedCodingClientConfig,
  TokenProviderResult,
} from "../client/types.js";

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

export function formatAuthorizationHeader(auth: AuthorizationValue): string {
  return `${auth.scheme} ${auth.value}`.trim();
}

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