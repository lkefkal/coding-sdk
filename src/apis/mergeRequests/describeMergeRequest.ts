import { Schema } from "effect";

import type { CodingClient, InvokeOptions } from "../../client/types.js";
import { defineActionSpec } from "../../core/actionSpec.js";
import { mergeRequestInfoSchema } from "../../schemas/mergeRequests.js";

export const action = "DescribeMergeRequest";

export const requestSchema = Schema.Struct({
  DepotId: Schema.Number,
  DepotPath: Schema.optional(Schema.String),
  MergeId: Schema.Number,
});

export const responseSchema = Schema.Struct({
  MergeRequestInfo: mergeRequestInfoSchema,
  RequestId: Schema.String,
});

export type DescribeMergeRequestRequest = Schema.Schema.Type<typeof requestSchema>;

export type DescribeMergeRequestResponse = Schema.Schema.Type<typeof responseSchema>;

export const describeMergeRequestSpec = defineActionSpec({
  action,
  actionPlacement: "body",
  requestSchema,
  responseSchema,
  summary: "合并请求-查询合并请求详情信息",
});

/**
 * 查询合并请求详情。
 *
 * @param client 共享上下文客户端。
 * @param input 当前 action 的请求参数。
 * @param options 本次调用的局部覆盖配置。
 * @returns 解码后的合并请求详情响应。
 */
export async function describeMergeRequest(
  client: CodingClient,
  input: DescribeMergeRequestRequest,
  options?: InvokeOptions,
): Promise<DescribeMergeRequestResponse> {
  return client.invoke(describeMergeRequestSpec, input, options);
}