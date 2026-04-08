import type {
  ActionPlacement,
  ActionSpec,
  AnySchema,
  SchemaType,
} from "../core/actionSpec.js";

export type MaybePromise<TValue> = TValue | Promise<TValue>;

export interface AuthorizationValue {
  readonly scheme: string;
  readonly value: string;
}

export type TokenProviderResult = string | AuthorizationValue | null | undefined;

export type TokenProvider = () => MaybePromise<TokenProviderResult>;

export interface RetryOptions {
  readonly maxAttempts: number;
  readonly baseDelayMs: number;
  readonly maxDelayMs: number;
  readonly retryableStatusCodes: readonly number[];
  readonly retryableTags: readonly string[];
}

export interface CodingLogger {
  debug?(message: string, meta?: Record<string, unknown>): void;
  info?(message: string, meta?: Record<string, unknown>): void;
  warn?(message: string, meta?: Record<string, unknown>): void;
  error?(message: string, meta?: Record<string, unknown>): void;
}

export type FetchLike = typeof fetch;

export interface InvokeOptions {
  readonly headers?: HeadersInit;
  readonly signal?: AbortSignal;
  readonly timeoutMs?: number;
  readonly retry?: Partial<RetryOptions>;
  readonly actionPlacementOverride?: ActionPlacement;
  readonly query?: Record<string, string | number | boolean | null | undefined>;
}

export interface CodingClientOptions {
  readonly baseUrl: string | URL;
  readonly token?: string;
  readonly tokenType?: string;
  readonly tokenProvider?: TokenProvider;
  readonly auth?: AuthorizationValue;
  readonly headers?: HeadersInit;
  readonly timeoutMs?: number;
  readonly retry?: Partial<RetryOptions>;
  readonly logger?: CodingLogger;
  readonly fetch?: FetchLike;
}

export interface ResolvedCodingClientConfig {
  readonly baseUrl: URL;
  readonly token: string | undefined;
  readonly tokenType: string;
  readonly tokenProvider: TokenProvider | undefined;
  readonly auth: AuthorizationValue | undefined;
  readonly headers: HeadersInit | undefined;
  readonly timeoutMs: number;
  readonly retry: RetryOptions;
  readonly logger: CodingLogger | undefined;
  readonly fetch: FetchLike;
}

export interface CodingClient {
  readonly config: ResolvedCodingClientConfig;
  invoke<TRequestSchema extends AnySchema, TResponseSchema extends AnySchema>(
    spec: ActionSpec<TRequestSchema, TResponseSchema>,
    input: SchemaType<TRequestSchema>,
    options?: InvokeOptions,
  ): Promise<SchemaType<TResponseSchema>>;
}