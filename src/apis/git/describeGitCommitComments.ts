import { Schema } from "effect";

import type { CodingClient, InvokeOptions } from "../../client/types.js";
import { defineActionSpec } from "../../core/actionSpec.js";
import { gitCommitCommentsSchema } from "../../schemas/git.js";

export const action = "DescribeGitCommitComments";

export const requestSchema = Schema.Struct({
  DepotPath: Schema.String,
  PageNumber: Schema.Number,
  PageSize: Schema.Number,
  Sha: Schema.String,
});

export const responseSchema = Schema.Struct({
  GitCommitComments: gitCommitCommentsSchema,
  RequestId: Schema.String,
});

export type DescribeGitCommitCommentsRequest = Schema.Schema.Type<typeof requestSchema>;
export type DescribeGitCommitCommentsResponse = Schema.Schema.Type<typeof responseSchema>;

export const describeGitCommitCommentsSpec = defineActionSpec({
  action,
  actionPlacement: "body",
  requestSchema,
  responseSchema,
  summary: "Git提交-获取 commit 评论",
});

/**
 * 获取指定提交的评论列表。
 *
 * @param client 共享上下文客户端。
 * @param input 当前 action 的请求参数。
 * @param options 本次调用的局部覆盖配置。
 * @returns 解码后的提交评论分页响应。
 */
export async function describeGitCommitComments(
  client: CodingClient,
  input: DescribeGitCommitCommentsRequest,
  options?: InvokeOptions,
): Promise<DescribeGitCommitCommentsResponse> {
  return client.invoke(describeGitCommitCommentsSpec, input, options);
}