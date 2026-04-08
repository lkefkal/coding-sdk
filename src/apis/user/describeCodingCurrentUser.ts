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

/**
 * 查询当前登录用户信息。
 *
 * @param client 共享上下文客户端。
 * @param input 当前 action 的请求参数。
 * @param options 本次调用的局部覆盖配置。
 * @returns 解码后的当前用户响应结果。
 */
export async function describeCodingCurrentUser(
  client: CodingClient,
  input: DescribeCodingCurrentUserRequest,
  options?: InvokeOptions,
): Promise<DescribeCodingCurrentUserResponse> {
  return client.invoke(describeCodingCurrentUserSpec, input, options);
}