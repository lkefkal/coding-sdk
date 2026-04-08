import { Schema } from "effect";

import type { CodingClient, InvokeOptions } from "../../client/types.js";
import { defineActionSpec } from "../../core/actionSpec.js";
import { gitDiffSchema } from "../../schemas/mergeRequests.js";

export const action = "DescribeGitMergeRequestDiffDetail";

export const requestSchema = Schema.Struct({
  DepotId: Schema.Number,
  DepotPath: Schema.optional(Schema.String),
  MergeId: Schema.Number,
  Path: Schema.String,
});

export const responseSchema = Schema.Struct({
  Detail: gitDiffSchema,
  RequestId: Schema.String,
});

export type DescribeGitMergeRequestDiffDetailRequest = Schema.Schema.Type<typeof requestSchema>;

export type DescribeGitMergeRequestDiffDetailResponse = Schema.Schema.Type<typeof responseSchema>;

export const describeGitMergeRequestDiffDetailSpec = defineActionSpec({
  action,
  actionPlacement: "body",
  requestSchema,
  responseSchema,
  summary: "合并请求-查询合并请求文件的 diff 详情",
});

/**
 * 查询合并请求单文件 diff 详情。
 *
 * @param client 共享上下文客户端。
 * @param input 当前 action 的请求参数。
 * @param options 本次调用的局部覆盖配置。
 * @returns 解码后的合并请求单文件 diff 详情响应。
 */
export async function describeGitMergeRequestDiffDetail(
  client: CodingClient,
  input: DescribeGitMergeRequestDiffDetailRequest,
  options?: InvokeOptions,
): Promise<DescribeGitMergeRequestDiffDetailResponse> {
  return client.invoke(describeGitMergeRequestDiffDetailSpec, input, options);
}