import { Schema } from "effect";

import type { CodingClient, InvokeOptions } from "../../client/types.js";
import { defineActionSpec } from "../../core/actionSpec.js";
import { gitTagSchema } from "../../schemas/git.js";

export const action = "DescribeGitTagsBySha";

export const requestSchema = Schema.Struct({
  DepotId: Schema.Number,
  DepotPath: Schema.optional(Schema.String),
  Sha: Schema.String,
});

export const responseSchema = Schema.Struct({
  GitTags: Schema.NullOr(Schema.Array(gitTagSchema)),
  RequestId: Schema.String,
});

export type DescribeGitTagsByShaRequest = Schema.Schema.Type<typeof requestSchema>;
export type DescribeGitTagsByShaResponse = Schema.Schema.Type<typeof responseSchema>;

export const describeGitTagsByShaSpec = defineActionSpec({
  action,
  actionPlacement: "body",
  requestSchema,
  responseSchema,
  summary: "标签信息-查询含有某次提交的标签列表",
});

/**
 * 查询包含指定提交的标签列表。
 *
 * @param client 共享上下文客户端。
 * @param input 当前 action 的请求参数。
 * @param options 本次调用的局部覆盖配置。
 * @returns 解码后的标签列表响应。
 */
export async function describeGitTagsBySha(
  client: CodingClient,
  input: DescribeGitTagsByShaRequest,
  options?: InvokeOptions,
): Promise<DescribeGitTagsByShaResponse> {
  return client.invoke(describeGitTagsByShaSpec, input, options);
}