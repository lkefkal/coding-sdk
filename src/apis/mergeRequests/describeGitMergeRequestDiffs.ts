import { Schema } from "effect";

import type { CodingClient, InvokeOptions } from "../../client/types.js";
import { defineActionSpec } from "../../core/actionSpec.js";
import { mergeRequestDiffSchema } from "../../schemas/mergeRequests.js";

export const action = "DescribeGitMergeRequestDiffs";

export const requestSchema = Schema.Struct({
  DepotId: Schema.Number,
  DepotPath: Schema.optional(Schema.String),
  MergeId: Schema.Number,
});

export const responseSchema = Schema.Struct({
  Diff: Schema.NullOr(mergeRequestDiffSchema),
  RequestId: Schema.String,
});

export type DescribeGitMergeRequestDiffsRequest = Schema.Schema.Type<typeof requestSchema>;

export type DescribeGitMergeRequestDiffsResponse = Schema.Schema.Type<typeof responseSchema>;

export const describeGitMergeRequestDiffsSpec = defineActionSpec({
  action,
  actionPlacement: "body",
  requestSchema,
  responseSchema,
  summary: "合并请求-查询合并请求diff信息的文件列表",
});

/**
 * 查询合并请求 diff 文件列表。
 *
 * @param client 共享上下文客户端。
 * @param input 当前 action 的请求参数。
 * @param options 本次调用的局部覆盖配置。
 * @returns 解码后的合并请求 diff 概览响应。
 */
export async function describeGitMergeRequestDiffs(
  client: CodingClient,
  input: DescribeGitMergeRequestDiffsRequest,
  options?: InvokeOptions,
): Promise<DescribeGitMergeRequestDiffsResponse> {
  return client.invoke(describeGitMergeRequestDiffsSpec, input, options);
}