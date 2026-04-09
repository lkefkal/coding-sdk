import { Schema } from "effect";

import type { CodingClient, InvokeOptions } from "../../client/types.js";
import { defineActionSpec } from "../../core/actionSpec.js";
import { gitDiffSchema } from "../../schemas/mergeRequests.js";

export const action = "DescribeGitCommitDiff";

export const requestSchema = Schema.Struct({
  DepotId: Schema.Number,
  DepotPath: Schema.optional(Schema.String),
  Path: Schema.optional(Schema.String),
  Sha: Schema.String,
});

export const responseSchema = Schema.Struct({
  Diffs: Schema.NullOr(Schema.Array(gitDiffSchema)),
  RequestId: Schema.String,
});

export type DescribeGitCommitDiffRequest = Schema.Schema.Type<typeof requestSchema>;
export type DescribeGitCommitDiffResponse = Schema.Schema.Type<typeof responseSchema>;

export const describeGitCommitDiffSpec = defineActionSpec({
  action,
  actionPlacement: "body",
  requestSchema,
  responseSchema,
  summary: "Git提交-查询某次提交的 diff 信息",
});

/**
 * 查询指定提交的 diff 明细。
 *
 * @param client 共享上下文客户端。
 * @param input 当前 action 的请求参数。
 * @param options 本次调用的局部覆盖配置。
 * @returns 解码后的提交 diff 响应。
 */
export async function describeGitCommitDiff(
  client: CodingClient,
  input: DescribeGitCommitDiffRequest,
  options?: InvokeOptions,
): Promise<DescribeGitCommitDiffResponse> {
  return client.invoke(describeGitCommitDiffSpec, input, options);
}