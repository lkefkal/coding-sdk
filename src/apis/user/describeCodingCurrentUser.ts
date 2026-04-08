import { Schema } from "effect";

import type { CodingClient, InvokeOptions } from "../../client/types.js";
import { defineActionSpec } from "../../core/actionSpec.js";
import { currentUserSchema } from "../../schemas/user.js";

export const action = "DescribeCodingCurrentUser";

export const requestSchema = Schema.Struct({});
export { currentUserSchema };

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