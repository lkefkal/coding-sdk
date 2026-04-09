import { Schema } from "effect";

import type { CodingClient, InvokeOptions } from "../../client/types.js";
import { defineActionSpec } from "../../core/actionSpec.js";
import { gitTagSchema } from "../../schemas/git.js";

export const action = "DescribeGitTags";

export const requestSchema = Schema.Struct({
  DepotId: Schema.Number,
  DepotPath: Schema.optional(Schema.String),
  KeyWord: Schema.optional(Schema.String),
  Page: Schema.optional(Schema.Number),
  PageSize: Schema.optional(Schema.Number),
});

export const responseSchema = Schema.Struct({
  GitTags: Schema.Array(gitTagSchema),
  RequestId: Schema.String,
});

export type DescribeGitTagsRequest = Schema.Schema.Type<typeof requestSchema>;
export type DescribeGitTagsResponse = Schema.Schema.Type<typeof responseSchema>;

export const describeGitTagsSpec = defineActionSpec({
  action,
  actionPlacement: "body",
  requestSchema,
  responseSchema,
  summary: "标签信息-查询当前仓库下所有tags",
});

/**
 * 查询当前仓库下所有标签。
 *
 * @param client 共享上下文客户端。
 * @param input 当前 action 的请求参数。
 * @param options 本次调用的局部覆盖配置。
 * @returns 解码后的标签列表响应。
 */
export async function describeGitTags(
  client: CodingClient,
  input: DescribeGitTagsRequest,
  options?: InvokeOptions,
): Promise<DescribeGitTagsResponse> {
  return client.invoke(describeGitTagsSpec, input, options);
}