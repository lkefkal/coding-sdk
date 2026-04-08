import { Schema } from "effect";

import type { CodingClient, InvokeOptions } from "../../client/types.js";
import { defineActionSpec } from "../../core/actionSpec.js";

export const action = "DescribeCodingCurrentUser";

export const requestSchema = Schema.Struct({});

export const currentUserSchema = Schema.Struct({
  Avatar: Schema.optional(Schema.String),
  Email: Schema.optional(Schema.String),
  EmailValidation: Schema.optional(Schema.Number),
  GlobalKey: Schema.optional(Schema.String),
  Gravatar: Schema.optional(Schema.String),
  Id: Schema.Number,
  Name: Schema.optional(Schema.String),
  NamePinYin: Schema.optional(Schema.String),
  Phone: Schema.optional(Schema.String),
  PhoneRegionCode: Schema.optional(Schema.String),
  PhoneValidation: Schema.optional(Schema.Number),
  Region: Schema.optional(Schema.String),
  Status: Schema.optional(Schema.Number),
  TeamId: Schema.optional(Schema.Number),
});

export const responseSchema = Schema.Struct({
  RequestId: Schema.String,
  User: currentUserSchema,
});

export type DescribeCodingCurrentUserRequest = Schema.Schema.Type<
  typeof requestSchema
>;

export type DescribeCodingCurrentUserResponse = Schema.Schema.Type<
  typeof responseSchema
>;

export const describeCodingCurrentUserSpec = defineActionSpec({
  action,
  actionPlacement: "both",
  requestSchema,
  responseSchema,
  summary: "当前用户信息查询",
});

export async function describeCodingCurrentUser(
  client: CodingClient,
  input: DescribeCodingCurrentUserRequest,
  options?: InvokeOptions,
): Promise<DescribeCodingCurrentUserResponse> {
  return client.invoke(describeCodingCurrentUserSpec, input, options);
}