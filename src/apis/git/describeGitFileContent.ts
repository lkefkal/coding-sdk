import { Schema } from "effect";

import type { CodingClient, InvokeOptions } from "../../client/types.js";
import { defineActionSpec } from "../../core/actionSpec.js";
import { gitFileContentSchema } from "../../schemas/git.js";

export const action = "DescribeGitFileContent";

export const requestSchema = Schema.Struct({
  CommitSha: Schema.String,
  DepotId: Schema.Number,
  DepotPath: Schema.optional(Schema.String),
  Path: Schema.String,
});

export const responseSchema = Schema.Struct({
  GitFileContent: gitFileContentSchema,
  RequestId: Schema.String,
});

export type DescribeGitFileContentRequest = Schema.Schema.Type<typeof requestSchema>;
export type DescribeGitFileContentResponse = Schema.Schema.Type<typeof responseSchema>;

export const describeGitFileContentSpec = defineActionSpec({
  action,
  actionPlacement: "body",
  requestSchema,
  responseSchema,
  summary: "Git提交-查询某次提交某文件的内容",
});

/**
 * 查询某次提交中某个文件的内容。
 *
 * @param client 共享上下文客户端。
 * @param input 当前 action 的请求参数。
 * @param options 本次调用的局部覆盖配置。
 * @returns 解码后的文件内容响应。
 */
export async function describeGitFileContent(
  client: CodingClient,
  input: DescribeGitFileContentRequest,
  options?: InvokeOptions,
): Promise<DescribeGitFileContentResponse> {
  return client.invoke(describeGitFileContentSpec, input, options);
}