import { Schema } from "effect";

import type { CodingClient, InvokeOptions } from "../../client/types.js";
import { defineActionSpec } from "../../core/actionSpec.js";
import { serviceHookLogPageSchema } from "../../schemas/serviceHooks.js";

export const action = "DescribeServiceHookLogs";

export const requestSchema = Schema.Struct({
  Id: Schema.String,
  PageNumber: Schema.Number,
  PageSize: Schema.Number,
  ProjectId: Schema.Number,
  TargetType: Schema.optional(Schema.Literal("PROJECT", "SPACE_NODE", "PROGRAM")),
});

export const responseSchema = Schema.Struct({
  Data: serviceHookLogPageSchema,
  RequestId: Schema.String,
});

export type DescribeServiceHookLogsRequest = Schema.Schema.Type<typeof requestSchema>;

export type DescribeServiceHookLogsResponse = Schema.Schema.Type<typeof responseSchema>;

export const describeServiceHookLogsSpec = defineActionSpec({
  action,
  actionPlacement: "body",
  requestSchema,
  responseSchema,
  summary: "Service Hook 发送记录分页查询",
});

/**
 * 查询 Service Hook 发送记录分页数据。
 *
 * @param client 共享上下文客户端。
 * @param input 当前 action 的请求参数。
 * @param options 本次调用的局部覆盖配置。
 * @returns 解码后的发送记录分页响应。
 */
export async function describeServiceHookLogs(
  client: CodingClient,
  input: DescribeServiceHookLogsRequest,
  options?: InvokeOptions,
): Promise<DescribeServiceHookLogsResponse> {
  return client.invoke(describeServiceHookLogsSpec, input, options);
}