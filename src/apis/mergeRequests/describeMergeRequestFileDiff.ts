import { Schema } from "effect";

import type { CodingClient, InvokeOptions } from "../../client/types.js";
import { defineActionSpec } from "../../core/actionSpec.js";
import { mergeRequestFileDiffSchema } from "../../schemas/mergeRequests.js";

export const action = "DescribeMergeRequestFileDiff";

export const requestSchema = Schema.Struct({
  DepotId: Schema.Number,
  DepotPath: Schema.optional(Schema.String),
  MergeId: Schema.Number,
});

export const responseSchema = Schema.Struct({
  MergeRequestFileDiff: mergeRequestFileDiffSchema,
  RequestId: Schema.String,
});

export type DescribeMergeRequestFileDiffRequest = Schema.Schema.Type<typeof requestSchema>;

export type DescribeMergeRequestFileDiffResponse = Schema.Schema.Type<typeof responseSchema>;

export const describeMergeRequestFileDiffSpec = defineActionSpec({
  action,
  actionPlacement: "body",
  requestSchema,
  responseSchema,
  summary: "合并请求-获取合并请求文件修改记录",
});

/**
 * 查询合并请求文件修改记录。
 *
 * @param client 共享上下文客户端。
 * @param input 当前 action 的请求参数。
 * @param options 本次调用的局部覆盖配置。
 * @returns 解码后的合并请求文件修改记录响应。
 */
export async function describeMergeRequestFileDiff(
  client: CodingClient,
  input: DescribeMergeRequestFileDiffRequest,
  options?: InvokeOptions,
): Promise<DescribeMergeRequestFileDiffResponse> {
  return client.invoke(describeMergeRequestFileDiffSpec, input, options);
}