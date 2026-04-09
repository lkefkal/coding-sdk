import { Schema } from "effect";

import type { CodingClient, InvokeOptions } from "../../client/types.js";
import { defineActionSpec } from "../../core/actionSpec.js";
import { gitCommitDataSchema } from "../../schemas/git.js";

export const action = "DescribeGitCommitsInPage";

export const requestSchema = Schema.Struct({
  DepotId: Schema.Number,
  DepotPath: Schema.optional(Schema.String),
  EndDate: Schema.optional(Schema.String),
  KeyWord: Schema.optional(Schema.Array(Schema.String)),
  PageNumber: Schema.optional(Schema.Number),
  PageSize: Schema.optional(Schema.Number),
  Path: Schema.optional(Schema.String),
  Ref: Schema.String,
  StartDate: Schema.optional(Schema.String),
});

export const responseSchema = Schema.Struct({
  Data: gitCommitDataSchema,
  RequestId: Schema.String,
});

export type DescribeGitCommitsInPageRequest = Schema.Schema.Type<typeof requestSchema>;
export type DescribeGitCommitsInPageResponse = Schema.Schema.Type<typeof responseSchema>;

export const describeGitCommitsInPageSpec = defineActionSpec({
  action,
  actionPlacement: "body",
  requestSchema,
  responseSchema,
  summary: "Git提交-查询仓库分支下提交列表",
});

/**
 * 查询仓库分支下的提交列表，并返回分页信息。
 *
 * @param client 共享上下文客户端。
 * @param input 当前 action 的请求参数。
 * @param options 本次调用的局部覆盖配置。
 * @returns 解码后的提交分页响应。
 */
export async function describeGitCommitsInPage(
  client: CodingClient,
  input: DescribeGitCommitsInPageRequest,
  options?: InvokeOptions,
): Promise<DescribeGitCommitsInPageResponse> {
  return client.invoke(describeGitCommitsInPageSpec, input, options);
}