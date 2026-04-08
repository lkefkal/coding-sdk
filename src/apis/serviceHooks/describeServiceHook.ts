import { Schema } from "effect";

import type { CodingClient, InvokeOptions } from "../../client/types.js";
import { defineActionSpec } from "../../core/actionSpec.js";
import { serviceHookSchema } from "../../schemas/serviceHooks.js";

export const action = "DescribeServiceHook";

export const requestSchema = Schema.Struct({
  Id: Schema.String,
  ProjectId: Schema.Number,
  TargetType: Schema.optional(Schema.Literal("PROJECT", "SPACE_NODE", "PROGRAM")),
});

export const responseSchema = Schema.Struct({
  RequestId: Schema.String,
  ServiceHook: serviceHookSchema,
});

export type DescribeServiceHookRequest = Schema.Schema.Type<typeof requestSchema>;

export type DescribeServiceHookResponse = Schema.Schema.Type<typeof responseSchema>;

export const describeServiceHookSpec = defineActionSpec({
  action,
  actionPlacement: "body",
  requestSchema,
  responseSchema,
  summary: "Service Hook 查询单条",
});

/**
 * 查询单个 Service Hook 详情。
 *
 * @param client 共享上下文客户端。
 * @param input 当前 action 的请求参数。
 * @param options 本次调用的局部覆盖配置。
 * @returns 解码后的 Service Hook 详情响应。
 */
export async function describeServiceHook(
  client: CodingClient,
  input: DescribeServiceHookRequest,
  options?: InvokeOptions,
): Promise<DescribeServiceHookResponse> {
  return client.invoke(describeServiceHookSpec, input, options);
}