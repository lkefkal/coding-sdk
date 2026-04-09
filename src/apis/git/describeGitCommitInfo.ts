import { Schema } from "effect";

import type { CodingClient, InvokeOptions } from "../../client/types.js";
import { defineActionSpec } from "../../core/actionSpec.js";
import { gitCommitSchema } from "../../schemas/git.js";

export const action = "DescribeGitCommitInfo";

export const requestSchema = Schema.Struct({
  DepotId: Schema.Number,
  DepotPath: Schema.optional(Schema.String),
  Sha: Schema.String,
});

export const responseSchema = Schema.Struct({
  GitCommit: gitCommitSchema,
  RequestId: Schema.String,
});

export type DescribeGitCommitInfoRequest = Schema.Schema.Type<typeof requestSchema>;
export type DescribeGitCommitInfoResponse = Schema.Schema.Type<typeof responseSchema>;

export const describeGitCommitInfoSpec = defineActionSpec({
  action,
  actionPlacement: "body",
  requestSchema,
  responseSchema,
  summary: "Git提交-查询单个请求详情信息",
});

/**
 * 查询单个提交详情。
 *
 * @param client 共享上下文客户端。
 * @param input 当前 action 的请求参数。
 * @param options 本次调用的局部覆盖配置。
 * @returns 解码后的提交详情响应。
 */
export async function describeGitCommitInfo(
  client: CodingClient,
  input: DescribeGitCommitInfoRequest,
  options?: InvokeOptions,
): Promise<DescribeGitCommitInfoResponse> {
  return client.invoke(describeGitCommitInfoSpec, input, options);
}