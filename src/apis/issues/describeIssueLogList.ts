import { Schema } from "effect";

import type { CodingClient, InvokeOptions } from "../../client/types.js";
import { defineActionSpec } from "../../core/actionSpec.js";
import { apiIssueLogIssueLogSchema } from "../../schemas/issues.js";

export const action = "DescribeIssueLogList";

export const requestSchema = Schema.Struct({
  ActionType: Schema.String,
  IssueCode: Schema.Number,
  ProjectName: Schema.String,
  Target: Schema.String,
});

export const responseSchema = Schema.Struct({
  IssueLogList: Schema.optional(Schema.Array(apiIssueLogIssueLogSchema)),
  RequestId: Schema.String,
});

export type DescribeIssueLogListRequest = Schema.Schema.Type<typeof requestSchema>;

export type DescribeIssueLogListResponse = Schema.Schema.Type<typeof responseSchema>;

export const describeIssueLogListSpec = defineActionSpec({
  action,
  actionPlacement: "body",
  requestSchema,
  responseSchema,
  summary: "事项活动日志查询",
});

/**
 * 查询事项活动日志列表。
 *
 * @param client 共享上下文客户端。
 * @param input 当前 action 的请求参数。
 * @param options 本次调用的局部覆盖配置。
 * @returns 解码后的事项活动日志响应。
 */
export async function describeIssueLogList(
  client: CodingClient,
  input: DescribeIssueLogListRequest,
  options?: InvokeOptions,
): Promise<DescribeIssueLogListResponse> {
  return client.invoke(describeIssueLogListSpec, input, options);
}