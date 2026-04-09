import { Schema } from "effect";

import type { CodingClient, InvokeOptions } from "../../client/types.js";
import { defineActionSpec } from "../../core/actionSpec.js";
import { gitBranchSchema } from "../../schemas/git.js";

export const action = "DescribeGitBranch";

export const requestSchema = Schema.Struct({
  BranchName: Schema.String,
  DepotId: Schema.Number,
  DepotPath: Schema.optional(Schema.String),
});

export const responseSchema = Schema.Struct({
  GitBranch: gitBranchSchema,
  RequestId: Schema.String,
});

export type DescribeGitBranchRequest = Schema.Schema.Type<typeof requestSchema>;
export type DescribeGitBranchResponse = Schema.Schema.Type<typeof responseSchema>;

export const describeGitBranchSpec = defineActionSpec({
  action,
  actionPlacement: "body",
  requestSchema,
  responseSchema,
  summary: "仓库分支-查询代码仓库单个分支",
});

/**
 * 查询代码仓库单个分支。
 *
 * @param client 共享上下文客户端。
 * @param input 当前 action 的请求参数。
 * @param options 本次调用的局部覆盖配置。
 * @returns 解码后的单个分支详情响应。
 */
export async function describeGitBranch(
  client: CodingClient,
  input: DescribeGitBranchRequest,
  options?: InvokeOptions,
): Promise<DescribeGitBranchResponse> {
  return client.invoke(describeGitBranchSpec, input, options);
}