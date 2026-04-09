import { Schema } from "effect";

import type { CodingClient, InvokeOptions } from "../../client/types.js";
import { defineActionSpec } from "../../core/actionSpec.js";
import { gitTagSchema } from "../../schemas/git.js";

export const action = "DescribeGitTag";

export const requestSchema = Schema.Struct({
  DepotId: Schema.Number,
  DepotPath: Schema.optional(Schema.String),
  TagName: Schema.String,
});

export const responseSchema = Schema.Struct({
  GitTag: gitTagSchema,
  RequestId: Schema.String,
});

export type DescribeGitTagRequest = Schema.Schema.Type<typeof requestSchema>;
export type DescribeGitTagResponse = Schema.Schema.Type<typeof responseSchema>;

export const describeGitTagSpec = defineActionSpec({
  action,
  actionPlacement: "body",
  requestSchema,
  responseSchema,
  summary: "标签信息-查询单个tag",
});

/**
 * 查询单个标签详情。
 *
 * @param client 共享上下文客户端。
 * @param input 当前 action 的请求参数。
 * @param options 本次调用的局部覆盖配置。
 * @returns 解码后的单个标签响应。
 */
export async function describeGitTag(
  client: CodingClient,
  input: DescribeGitTagRequest,
  options?: InvokeOptions,
): Promise<DescribeGitTagResponse> {
  return client.invoke(describeGitTagSpec, input, options);
}