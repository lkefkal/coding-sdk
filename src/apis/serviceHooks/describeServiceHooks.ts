import { Schema } from "effect";

import type { CodingClient, InvokeOptions } from "../../client/types.js";
import { defineActionSpec } from "../../core/actionSpec.js";
import {
  serviceHookEventNameSchema,
  serviceHookPageSchema,
  serviceHookServiceSchema,
  serviceHookTargetTypeSchema,
} from "../../schemas/serviceHooks.js";

export const action = "DescribeServiceHooks";

export const requestSchema = Schema.Struct({
  CreatorBy: Schema.optional(Schema.Array(Schema.Number)),
  Enabled: Schema.optional(Schema.String),
  Event: Schema.optional(serviceHookEventNameSchema),
  Name: Schema.optional(Schema.String),
  PageNumber: Schema.Number,
  PageSize: Schema.Number,
  ProjectId: Schema.Number,
  Service: Schema.optional(serviceHookServiceSchema),
  Status: Schema.optional(Schema.Literal("SUCCESS", "FAILURE")),
  TargetType: serviceHookTargetTypeSchema,
});

export const responseSchema = Schema.Struct({
  Data: serviceHookPageSchema,
  RequestId: Schema.String,
});

export type DescribeServiceHooksRequest = Schema.Schema.Type<typeof requestSchema>;

export type DescribeServiceHooksResponse = Schema.Schema.Type<typeof responseSchema>;

export const describeServiceHooksSpec = defineActionSpec({
  action,
  actionPlacement: "body",
  requestSchema,
  responseSchema,
  summary: "Service Hook 列表分页查询",
});

/**
 * 查询 Service Hook 列表，并返回经过 schema 解码后的分页结果。
 *
 * @param client 共享上下文客户端。
 * @param input 当前 action 的请求参数。
 * @param options 本次调用的局部覆盖配置。
 * @returns 解码后的 Service Hook 列表响应。
 */
export async function describeServiceHooks(
  client: CodingClient,
  input: DescribeServiceHooksRequest,
  options?: InvokeOptions,
): Promise<DescribeServiceHooksResponse> {
  return client.invoke(describeServiceHooksSpec, input, options);
}