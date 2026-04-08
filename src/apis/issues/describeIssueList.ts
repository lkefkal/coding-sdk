import { Schema } from "effect";

import type { CodingClient, InvokeOptions } from "../../client/types.js";
import { defineActionSpec } from "../../core/actionSpec.js";
import {
  issueConditionSchema,
  issueIterationSchema,
  issueListItemSchema,
  issueTypeSchema,
  issueTypeDetailSchema,
  issueCustomFieldSchema,
  sortDirectionSchema,
} from "../../schemas/issues.js";

export const action = "DescribeIssueList";
export {
  issueConditionSchema,
  issueCustomFieldSchema,
  issueIterationSchema,
  issueListItemSchema,
  issueTypeSchema,
  issueTypeDetailSchema,
  sortDirectionSchema,
};

export const requestSchema = Schema.Struct({
  Conditions: Schema.optional(Schema.Array(issueConditionSchema)),
  IssueType: issueTypeSchema,
  Limit: Schema.optional(Schema.Number),
  Offset: Schema.optional(Schema.Number),
  ProjectName: Schema.String,
  ShowImageOutUrl: Schema.optional(Schema.Boolean),
  SortKey: Schema.optional(Schema.String),
  SortValue: Schema.optional(sortDirectionSchema),
});

export const responseSchema = Schema.Struct({
  IssueList: Schema.Array(issueListItemSchema),
  RequestId: Schema.String,
});

export type DescribeIssueListRequest = Schema.Schema.Type<typeof requestSchema>;

export type DescribeIssueListResponse = Schema.Schema.Type<typeof responseSchema>;

export const describeIssueListSpec = defineActionSpec({
  action,
  actionPlacement: "body",
  requestSchema,
  responseSchema,
  summary: "查询事项列表",
});

/**
 * 查询事项列表，并返回经过 schema 解码后的结果。
 *
 * @param client 共享上下文客户端。
 * @param input 当前 action 的请求参数。
 * @param options 本次调用的局部覆盖配置。
 * @returns 解码后的事项列表响应结果。
 */
export async function describeIssueList(
  client: CodingClient,
  input: DescribeIssueListRequest,
  options?: InvokeOptions,
): Promise<DescribeIssueListResponse> {
  return client.invoke(describeIssueListSpec, input, options);
}