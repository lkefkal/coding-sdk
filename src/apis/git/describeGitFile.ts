import { Schema } from "effect";

import type { CodingClient, InvokeOptions } from "../../client/types.js";
import { defineActionSpec } from "../../core/actionSpec.js";
import { gitFileItemSchema } from "../../schemas/git.js";

export const action = "DescribeGitFile";

export const requestSchema = Schema.Struct({
  DepotId: Schema.Number,
  DepotPath: Schema.optional(Schema.String),
  Path: Schema.optional(Schema.String),
  Ref: Schema.String,
});

export const responseSchema = Schema.Struct({
  GitFile: Schema.NullOr(gitFileItemSchema),
  RequestId: Schema.String,
});

export type DescribeGitFileRequest = Schema.Schema.Type<typeof requestSchema>;
export type DescribeGitFileResponse = Schema.Schema.Type<typeof responseSchema>;

export const describeGitFileSpec = defineActionSpec({
  action,
  actionPlacement: "body",
  requestSchema,
  responseSchema,
  summary: "Git文件-获取文件详情",
});

/**
 * 获取仓库中文件的详情。
 *
 * @param client 共享上下文客户端。
 * @param input 当前 action 的请求参数。
 * @param options 本次调用的局部覆盖配置。
 * @returns 解码后的文件详情响应。
 */
export async function describeGitFile(
  client: CodingClient,
  input: DescribeGitFileRequest,
  options?: InvokeOptions,
): Promise<DescribeGitFileResponse> {
  return client.invoke(describeGitFileSpec, input, options);
}