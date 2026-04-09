import { Schema } from "effect";

import type { CodingClient, InvokeOptions } from "../../client/types.js";
import { defineActionSpec } from "../../core/actionSpec.js";
import { gitBranchInfoSchema } from "../../schemas/git.js";

export const action = "DescribeGitBranches";

export const requestSchema = Schema.Struct({
  DepotId: Schema.Number,
  DepotPath: Schema.optional(Schema.String),
  KeyWord: Schema.optional(Schema.String),
  PageNumber: Schema.optional(Schema.Number),
  PageSize: Schema.optional(Schema.Number),
});

export const responseSchema = Schema.Struct({
  Branches: Schema.NullOr(Schema.Array(gitBranchInfoSchema)),
  RequestId: Schema.String,
  TotalCount: Schema.NullOr(Schema.Number),
});

export type DescribeGitBranchesRequest = Schema.Schema.Type<typeof requestSchema>;
export type DescribeGitBranchesResponse = Schema.Schema.Type<typeof responseSchema>;

export const describeGitBranchesSpec = defineActionSpec({
  action,
  actionPlacement: "body",
  requestSchema,
  responseSchema,
  summary: "仓库分支-查询仓库下所有分支列表",
});

/**
 * 查询仓库下所有分支列表。
 *
 * @param client 共享上下文客户端。
 * @param input 当前 action 的请求参数。
 * @param options 本次调用的局部覆盖配置。
 * @returns 解码后的仓库分支列表响应。
 */
export async function describeGitBranches(
  client: CodingClient,
  input: DescribeGitBranchesRequest,
  options?: InvokeOptions,
): Promise<DescribeGitBranchesResponse> {
  return client.invoke(describeGitBranchesSpec, input, options);
}