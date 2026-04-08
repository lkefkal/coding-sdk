import { Schema } from "effect";

import type { CodingClient, InvokeOptions } from "../../client/types.js";
import { defineActionSpec } from "../../core/actionSpec.js";
import { issueWorkLogSchema } from "../../schemas/issues.js";

export const action = "DescribeIssueWorkLogList";

export const requestSchema = Schema.Struct({
  IssueCode: Schema.Number,
  ProjectName: Schema.String,
});

export const responseSchema = Schema.Struct({
  RequestId: Schema.String,
  WorkLogs: Schema.Array(issueWorkLogSchema),
});

export type DescribeIssueWorkLogListRequest = Schema.Schema.Type<typeof requestSchema>;

export type DescribeIssueWorkLogListResponse = Schema.Schema.Type<typeof responseSchema>;

export const describeIssueWorkLogListSpec = defineActionSpec({
  action,
  actionPlacement: "body",
  requestSchema,
  responseSchema,
  summary: "事项的工时日志查询",
});

/**
 * 查询事项工时日志列表。
 *
 * @param client 共享上下文客户端。
 * @param input 当前 action 的请求参数。
 * @param options 本次调用的局部覆盖配置。
 * @returns 解码后的事项工时日志响应。
 */
export async function describeIssueWorkLogList(
  client: CodingClient,
  input: DescribeIssueWorkLogListRequest,
  options?: InvokeOptions,
): Promise<DescribeIssueWorkLogListResponse> {
  return client.invoke(describeIssueWorkLogListSpec, input, options);
}