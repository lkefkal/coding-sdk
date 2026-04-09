import { Schema } from "effect";

import type { CodingClient, InvokeOptions } from "../../client/types.js";
import { defineActionSpec } from "../../core/actionSpec.js";
import { gitCommitSchema } from "../../schemas/git.js";

export const action = "DescribeGitCommitInfos";

export const requestSchema = Schema.Struct({
  DepotId: Schema.Number,
  DepotPath: Schema.optional(Schema.String),
  EndDate: Schema.optional(Schema.String),
  KeyWord: Schema.optional(Schema.String),
  PageNumber: Schema.optional(Schema.Number),
  PageSize: Schema.optional(Schema.Number),
  Path: Schema.optional(Schema.String),
  Ref: Schema.String,
  StartDate: Schema.optional(Schema.String),
});

export const responseSchema = Schema.Struct({
  Commits: Schema.Array(gitCommitSchema),
  RequestId: Schema.String,
});

export type DescribeGitCommitInfosRequest = Schema.Schema.Type<typeof requestSchema>;
export type DescribeGitCommitInfosResponse = Schema.Schema.Type<typeof responseSchema>;

export const describeGitCommitInfosSpec = defineActionSpec({
  action,
  actionPlacement: "body",
  requestSchema,
  responseSchema,
  summary: "Git提交-查询仓库分支下提交列表",
});

/**
 * 查询仓库分支下的提交列表。
 *
 * @param client 共享上下文客户端。
 * @param input 当前 action 的请求参数。
 * @param options 本次调用的局部覆盖配置。
 * @returns 解码后的提交列表响应。
 */
export async function describeGitCommitInfos(
  client: CodingClient,
  input: DescribeGitCommitInfosRequest,
  options?: InvokeOptions,
): Promise<DescribeGitCommitInfosResponse> {
  return client.invoke(describeGitCommitInfosSpec, input, options);
}