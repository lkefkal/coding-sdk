import { Schema } from "effect";

import type { CodingClient, InvokeOptions } from "../../client/types.js";
import { defineActionSpec } from "../../core/actionSpec.js";
import { gitBranchesDataSchema } from "../../schemas/git.js";

export const action = "DescribeGitBranchList";

export const requestSchema = Schema.Struct({
  DepotPath: Schema.String,
  KeyWord: Schema.optional(Schema.String),
  PageNumber: Schema.Number,
  PageSize: Schema.Number,
});

export const responseSchema = Schema.Struct({
  GitBranchesData: gitBranchesDataSchema,
  RequestId: Schema.String,
});

export type DescribeGitBranchListRequest = Schema.Schema.Type<typeof requestSchema>;
export type DescribeGitBranchListResponse = Schema.Schema.Type<typeof responseSchema>;

export const describeGitBranchListSpec = defineActionSpec({
  action,
  actionPlacement: "both",
  requestSchema,
  responseSchema,
  summary: "仓库分支-查询仓库分支列表",
});

/**
 * 查询仓库分支列表。
 *
 * @param client 共享上下文客户端。
 * @param input 当前 action 的请求参数。
 * @param options 本次调用的局部覆盖配置。
 * @returns 解码后的仓库分支列表响应。
 */
export async function describeGitBranchList(
  client: CodingClient,
  input: DescribeGitBranchListRequest,
  options?: InvokeOptions,
): Promise<DescribeGitBranchListResponse> {
  return client.invoke(describeGitBranchListSpec, input, options);
}