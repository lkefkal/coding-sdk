import { Schema } from "effect";

export type AnySchema = Schema.Schema<any, any, never>;

export type SchemaType<TSchema extends AnySchema> = Schema.Schema.Type<TSchema>;

export type SchemaEncoded<TSchema extends AnySchema> = Schema.Schema.Encoded<TSchema>;

export type ActionPlacement = "body" | "query" | "both";

export interface ActionSpec<
  TRequestSchema extends AnySchema,
  TResponseSchema extends AnySchema,
> {
  readonly action: string;
  readonly requestSchema: TRequestSchema;
  readonly responseSchema: TResponseSchema;
  readonly actionPlacement?: ActionPlacement;
  readonly actionBodyName?: string;
  readonly actionQueryName?: string;
  readonly method?: "POST";
  readonly path?: string;
  readonly summary?: string;
}

export type InferActionRequest<TSpec extends ActionSpec<AnySchema, AnySchema>> =
  SchemaType<TSpec["requestSchema"]>;

export type InferActionResponse<TSpec extends ActionSpec<AnySchema, AnySchema>> =
  SchemaType<TSpec["responseSchema"]>;

/**
 * 定义并冻结 action 规格，同时补齐稳定默认值。
 *
 * @param spec 当前 action 的规格定义。
 * @returns 带默认值且已冻结的 action 规格。
 */
export function defineActionSpec<
  TRequestSchema extends AnySchema,
  TResponseSchema extends AnySchema,
>(
  spec: ActionSpec<TRequestSchema, TResponseSchema>,
): ActionSpec<TRequestSchema, TResponseSchema> {
  return Object.freeze({
    method: "POST",
    path: "",
    actionPlacement: "body",
    actionBodyName: "Action",
    actionQueryName: "Action",
    ...spec,
  });
}