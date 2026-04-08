import { Schema } from "effect";

import type { CodingClient, InvokeOptions } from "../../client/types.js";
import { defineActionSpec } from "../../core/actionSpec.js";
import { resourceReferenceSchema } from "../../schemas/issues.js";

export const action = "DescribeIssueReferenceResources";

export const requestSchema = Schema.Struct({
  IssueCode: Schema.Number,
  ProjectId: Schema.Number,
  ProjectName: Schema.String,
});

export const responseSchema = Schema.Struct({
  Data: Schema.optional(Schema.Array(resourceReferenceSchema)),
  RequestId: Schema.String,
});

export type DescribeIssueReferenceResourcesRequest = Schema.Schema.Type<typeof requestSchema>;

export type DescribeIssueReferenceResourcesResponse = Schema.Schema.Type<typeof responseSchema>;

export const describeIssueReferenceResourcesSpec = defineActionSpec({
  action,
  actionPlacement: "body",
  requestSchema,
  responseSchema,
  summary: "事项的引用资源列表查询",
});

/**
 * 查询事项引用资源列表。
 *
 * @param client 共享上下文客户端。
 * @param input 当前 action 的请求参数。
 * @param options 本次调用的局部覆盖配置。
 * @returns 解码后的事项引用资源响应。
 */
export async function describeIssueReferenceResources(
  client: CodingClient,
  input: DescribeIssueReferenceResourcesRequest,
  options?: InvokeOptions,
): Promise<DescribeIssueReferenceResourcesResponse> {
  return client.invoke(describeIssueReferenceResourcesSpec, input, options);
}