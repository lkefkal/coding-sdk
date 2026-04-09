import { Schema } from "effect";

import type { CodingClient, InvokeOptions } from "../../client/types.js";
import { defineActionSpec } from "../../core/actionSpec.js";
import { gitRefInfoSchema } from "../../schemas/git.js";

export const action = "DescribeGitBranchesBySha";

export const requestSchema = Schema.Struct({
  DepotId: Schema.Number,
  DepotPath: Schema.optional(Schema.String),
  Sha: Schema.String,
});

export const responseSchema = Schema.Struct({
  Refs: Schema.Array(gitRefInfoSchema),
  RequestId: Schema.String,
});

export type DescribeGitBranchesByShaRequest = Schema.Schema.Type<typeof requestSchema>;
export type DescribeGitBranchesByShaResponse = Schema.Schema.Type<typeof responseSchema>;

export const describeGitBranchesByShaSpec = defineActionSpec({
  action,
  actionPlacement: "body",
  requestSchema,
  responseSchema,
  summary: "仓库分支-根据sha值查询所在分支",
});

/**
 * 根据 sha 查询所在分支列表。
 *
 * @param client 共享上下文客户端。
 * @param input 当前 action 的请求参数。
 * @param options 本次调用的局部覆盖配置。
 * @returns 解码后的分支引用列表响应。
 */
export async function describeGitBranchesBySha(
  client: CodingClient,
  input: DescribeGitBranchesByShaRequest,
  options?: InvokeOptions,
): Promise<DescribeGitBranchesByShaResponse> {
  return client.invoke(describeGitBranchesByShaSpec, input, options);
}