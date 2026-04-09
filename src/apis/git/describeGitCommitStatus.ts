import { Schema } from "effect";

import type { CodingClient, InvokeOptions } from "../../client/types.js";
import { defineActionSpec } from "../../core/actionSpec.js";
import { gitStatusCheckResultSchema } from "../../schemas/git.js";

export const action = "DescribeGitCommitStatus";

export const requestSchema = Schema.Struct({
  CommitSha: Schema.String,
  DepotId: Schema.Number,
  DepotPath: Schema.optional(Schema.String),
});

export const responseSchema = Schema.Struct({
  RequestId: Schema.String,
  StatusCheckResults: Schema.NullOr(Schema.Array(gitStatusCheckResultSchema)),
});

export type DescribeGitCommitStatusRequest = Schema.Schema.Type<typeof requestSchema>;
export type DescribeGitCommitStatusResponse = Schema.Schema.Type<typeof responseSchema>;

export const describeGitCommitStatusSpec = defineActionSpec({
  action,
  actionPlacement: "body",
  requestSchema,
  responseSchema,
  summary: "Git提交-查询提交对应的流水线状态",
});

/**
 * 查询指定提交关联的流水线状态。
 *
 * @param client 共享上下文客户端。
 * @param input 当前 action 的请求参数。
 * @param options 本次调用的局部覆盖配置。
 * @returns 解码后的提交状态列表响应。
 */
export async function describeGitCommitStatus(
  client: CodingClient,
  input: DescribeGitCommitStatusRequest,
  options?: InvokeOptions,
): Promise<DescribeGitCommitStatusResponse> {
  return client.invoke(describeGitCommitStatusSpec, input, options);
}