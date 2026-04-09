import { Schema } from "effect";

import type { CodingClient, InvokeOptions } from "../../client/types.js";
import { defineActionSpec } from "../../core/actionSpec.js";
import { gitFileStatPayloadSchema } from "../../schemas/git.js";

export const action = "DescribeGitFileStat";

export const requestSchema = Schema.Struct({
  DepotPath: Schema.String,
  Path: Schema.String,
  Ref: Schema.String,
});

export const responseSchema = Schema.Struct({
  Payload: gitFileStatPayloadSchema,
  RequestId: Schema.String,
});

export type DescribeGitFileStatRequest = Schema.Schema.Type<typeof requestSchema>;
export type DescribeGitFileStatResponse = Schema.Schema.Type<typeof responseSchema>;

export const describeGitFileStatSpec = defineActionSpec({
  action,
  actionPlacement: "both",
  requestSchema,
  responseSchema,
  summary: "Git文件-检查仓库文件是否存在",
});

/**
 * 检查仓库文件是否存在。
 *
 * @param client 共享上下文客户端。
 * @param input 当前 action 的请求参数。
 * @param options 本次调用的局部覆盖配置。
 * @returns 解码后的文件存在性响应。
 */
export async function describeGitFileStat(
  client: CodingClient,
  input: DescribeGitFileStatRequest,
  options?: InvokeOptions,
): Promise<DescribeGitFileStatResponse> {
  return client.invoke(describeGitFileStatSpec, input, options);
}