import { Schema } from "effect";

import type { CodingClient, InvokeOptions } from "../../client/types.js";
import { defineActionSpec } from "../../core/actionSpec.js";
import { issueDetailSchema } from "../../schemas/issues.js";

export const action = "DescribeIssue";

export const requestSchema = Schema.Struct({
  IssueCode: Schema.Number,
  ProjectName: Schema.String,
  ShowImageOutUrl: Schema.optional(Schema.Boolean),
});

export const responseSchema = Schema.Struct({
  Issue: issueDetailSchema,
  RequestId: Schema.String,
});

export type DescribeIssueRequest = Schema.Schema.Type<typeof requestSchema>;

export type DescribeIssueResponse = Schema.Schema.Type<typeof responseSchema>;

export const describeIssueSpec = defineActionSpec({
  action,
  actionPlacement: "body",
  requestSchema,
  responseSchema,
  summary: "事项详情查询",
});

/**
 * 查询单个事项详情。
 *
 * @param client 共享上下文客户端。
 * @param input 当前 action 的请求参数。
 * @param options 本次调用的局部覆盖配置。
 * @returns 解码后的事项详情响应。
 */
export async function describeIssue(
  client: CodingClient,
  input: DescribeIssueRequest,
  options?: InvokeOptions,
): Promise<DescribeIssueResponse> {
  return client.invoke(describeIssueSpec, input, options);
}