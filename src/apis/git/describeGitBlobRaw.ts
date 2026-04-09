import { Schema } from "effect";

import type { CodingClient, InvokeOptions } from "../../client/types.js";
import { defineActionSpec } from "../../core/actionSpec.js";

export const action = "DescribeGitBlobRaw";

export const requestSchema = Schema.Struct({
  BlobSha: Schema.String,
  DepotId: Schema.Number,
  DepotPath: Schema.optional(Schema.String),
});

export const responseSchema = Schema.Struct({
  Content: Schema.NullOr(Schema.String),
  RequestId: Schema.String,
});

export type DescribeGitBlobRawRequest = Schema.Schema.Type<typeof requestSchema>;
export type DescribeGitBlobRawResponse = Schema.Schema.Type<typeof responseSchema>;

export const describeGitBlobRawSpec = defineActionSpec({
  action,
  actionPlacement: "body",
  requestSchema,
  responseSchema,
  summary: "Git文件-查询Git Blob raw信息",
});

/**
 * 查询 Git Blob 的原始文本内容。
 *
 * @param client 共享上下文客户端。
 * @param input 当前 action 的请求参数。
 * @param options 本次调用的局部覆盖配置。
 * @returns 解码后的 Blob 原始内容响应。
 */
export async function describeGitBlobRaw(
  client: CodingClient,
  input: DescribeGitBlobRawRequest,
  options?: InvokeOptions,
): Promise<DescribeGitBlobRawResponse> {
  return client.invoke(describeGitBlobRawSpec, input, options);
}