import { Schema } from "effect";

import type { CodingClient, InvokeOptions } from "../../client/types.js";
import { defineActionSpec } from "../../core/actionSpec.js";
import { issueCommentSchema } from "../../schemas/issues.js";

export const action = "DescribeIssueCommentList";

export const requestSchema = Schema.Struct({
  IssueCode: Schema.Number,
  ProjectName: Schema.String,
  ShowFileId: Schema.optional(Schema.Boolean),
});

export const responseSchema = Schema.Struct({
  CommentList: Schema.Array(issueCommentSchema),
  RequestId: Schema.String,
});

export type DescribeIssueCommentListRequest = Schema.Schema.Type<typeof requestSchema>;

export type DescribeIssueCommentListResponse = Schema.Schema.Type<typeof responseSchema>;

export const describeIssueCommentListSpec = defineActionSpec({
  action,
  actionPlacement: "body",
  requestSchema,
  responseSchema,
  summary: "事项评论列表查询",
});

/**
 * 查询事项评论列表。
 *
 * @param client 共享上下文客户端。
 * @param input 当前 action 的请求参数。
 * @param options 本次调用的局部覆盖配置。
 * @returns 解码后的事项评论列表响应。
 */
export async function describeIssueCommentList(
  client: CodingClient,
  input: DescribeIssueCommentListRequest,
  options?: InvokeOptions,
): Promise<DescribeIssueCommentListResponse> {
  return client.invoke(describeIssueCommentListSpec, input, options);
}