import { Schema } from "effect";

import type { CodingClient, InvokeOptions } from "../../client/types.js";
import { defineActionSpec } from "../../core/actionSpec.js";
import { issueStatusChangeLogListSchema } from "../../schemas/issues.js";

export const action = "DescribeIssueStatusChangeLogList";

export const requestSchema = Schema.Struct({
  IssueCode: Schema.Array(Schema.Number),
  ProjectName: Schema.String,
});

export const responseSchema = Schema.Struct({
  Logs: Schema.optional(issueStatusChangeLogListSchema),
  RequestId: Schema.String,
});

export type DescribeIssueStatusChangeLogListRequest = Schema.Schema.Type<typeof requestSchema>;

export type DescribeIssueStatusChangeLogListResponse = Schema.Schema.Type<typeof responseSchema>;

export const describeIssueStatusChangeLogListSpec = defineActionSpec({
  action,
  actionPlacement: "body",
  requestSchema,
  responseSchema,
  summary: "事项的状态变更记录查询",
});

/**
 * 查询事项状态变更记录列表。
 *
 * @param client 共享上下文客户端。
 * @param input 当前 action 的请求参数。
 * @param options 本次调用的局部覆盖配置。
 * @returns 解码后的事项状态变更记录响应。
 */
export async function describeIssueStatusChangeLogList(
  client: CodingClient,
  input: DescribeIssueStatusChangeLogListRequest,
  options?: InvokeOptions,
): Promise<DescribeIssueStatusChangeLogListResponse> {
  return client.invoke(describeIssueStatusChangeLogListSpec, input, options);
}