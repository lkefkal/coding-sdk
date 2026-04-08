import type {
  ActionPlacement,
  ActionSpec,
  AnySchema,
  SchemaType,
} from "../core/actionSpec.js";

/**
 * 表示同步值或 Promise 值的通用联合类型。
 */
export type MaybePromise<TValue> = TValue | Promise<TValue>;

/**
 * 统一的鉴权结构，映射为 HTTP Authorization 头。
 */
export interface AuthorizationValue {
  readonly scheme: string;
  readonly value: string;
}

/**
 * token 提供器允许返回的结果类型。
 */
export type TokenProviderResult = string | AuthorizationValue | null | undefined;

/**
 * 延迟提供 token 或完整鉴权结构的函数类型。
 */
export type TokenProvider = () => MaybePromise<TokenProviderResult>;

/**
 * 请求重试配置。
 */
export interface RetryOptions {
  readonly maxAttempts: number;
  readonly baseDelayMs: number;
  readonly maxDelayMs: number;
  readonly retryableStatusCodes: readonly number[];
  readonly retryableTags: readonly string[];
}

/**
 * SDK 日志接口，供调用方接入自身日志系统。
 */
export interface CodingLogger {
  debug?(message: string, meta?: Record<string, unknown>): void;
  info?(message: string, meta?: Record<string, unknown>): void;
  warn?(message: string, meta?: Record<string, unknown>): void;
  error?(message: string, meta?: Record<string, unknown>): void;
}

/**
 * SDK 使用的 fetch 函数类型。
 */
export type FetchLike = typeof fetch;

/**
 * 单次 action 调用的局部覆盖配置。
 */
export interface InvokeOptions {
  readonly headers?: HeadersInit;
  readonly signal?: AbortSignal;
  readonly timeoutMs?: number;
  readonly retry?: Partial<RetryOptions>;
  readonly actionPlacementOverride?: ActionPlacement;
  readonly query?: Record<string, string | number | boolean | null | undefined>;
}

/**
 * 创建共享客户端时可传入的初始化配置。
 */
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

/**
 * 经过归一化后的客户端内部配置。
 */
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

/**
 * 可供各 action 复用的共享客户端接口。
 */
export interface CodingClient {
  readonly config: ResolvedCodingClientConfig;

  /**
   * 调用指定 action，并返回经过 schema 解码后的响应结果。
   *
   * @param spec 当前 action 的规格定义。
   * @param input 当前 action 的请求参数。
   * @param options 本次调用的局部覆盖配置。
   * @returns 解码后的 action 响应数据。
   */
  invoke<TRequestSchema extends AnySchema, TResponseSchema extends AnySchema>(
    spec: ActionSpec<TRequestSchema, TResponseSchema>,
    input: SchemaType<TRequestSchema>,
    options?: InvokeOptions,
  ): Promise<SchemaType<TResponseSchema>>;
}