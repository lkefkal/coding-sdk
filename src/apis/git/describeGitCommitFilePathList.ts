import { Schema } from "effect";

import type { CodingClient, InvokeOptions } from "../../client/types.js";
import { defineActionSpec } from "../../core/actionSpec.js";
import { gitCommitFilePathSchema } from "../../schemas/git.js";

export const action = "DescribeGitCommitFilePathList";

export const requestSchema = Schema.Struct({
  CommitSha: Schema.String,
  DepotPath: Schema.String,
});

export const responseSchema = Schema.Struct({
  FilePaths: Schema.NullOr(Schema.Array(gitCommitFilePathSchema)),
  RequestId: Schema.String,
});

export type DescribeGitCommitFilePathListRequest = Schema.Schema.Type<typeof requestSchema>;
export type DescribeGitCommitFilePathListResponse = Schema.Schema.Type<typeof responseSchema>;

export const describeGitCommitFilePathListSpec = defineActionSpec({
  action,
  actionPlacement: "both",
  requestSchema,
  responseSchema,
  summary: "Git提交-查询仓库某次提交改动的文件路径列表",
});

/**
 * 查询某次提交改动的文件路径列表。
 *
 * @param client 共享上下文客户端。
 * @param input 当前 action 的请求参数。
 * @param options 本次调用的局部覆盖配置。
 * @returns 解码后的提交改动文件路径响应。
 */
export async function describeGitCommitFilePathList(
  client: CodingClient,
  input: DescribeGitCommitFilePathListRequest,
  options?: InvokeOptions,
): Promise<DescribeGitCommitFilePathListResponse> {
  return client.invoke(describeGitCommitFilePathListSpec, input, options);
}