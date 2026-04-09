import { Schema } from "effect";

import type { CodingClient, InvokeOptions } from "../../client/types.js";
import { defineActionSpec } from "../../core/actionSpec.js";
import { gitBlobDetailSchema } from "../../schemas/git.js";

export const action = "DescribeGitBlob";

export const requestSchema = Schema.Struct({
  BlobSha: Schema.String,
  DepotId: Schema.Number,
  DepotPath: Schema.optional(Schema.String),
});

export const responseSchema = Schema.Struct({
  Data: gitBlobDetailSchema,
  RequestId: Schema.String,
});

export type DescribeGitBlobRequest = Schema.Schema.Type<typeof requestSchema>;
export type DescribeGitBlobResponse = Schema.Schema.Type<typeof responseSchema>;

export const describeGitBlobSpec = defineActionSpec({
  action,
  actionPlacement: "body",
  requestSchema,
  responseSchema,
  summary: "Git文件-查询GitBlob",
});

/**
 * 查询 Git Blob 详情。
 *
 * @param client 共享上下文客户端。
 * @param input 当前 action 的请求参数。
 * @param options 本次调用的局部覆盖配置。
 * @returns 解码后的 Blob 详情响应。
 */
export async function describeGitBlob(
  client: CodingClient,
  input: DescribeGitBlobRequest,
  options?: InvokeOptions,
): Promise<DescribeGitBlobResponse> {
  return client.invoke(describeGitBlobSpec, input, options);
}