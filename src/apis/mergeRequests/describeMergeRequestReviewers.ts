import { Schema } from "effect";

import type { CodingClient, InvokeOptions } from "../../client/types.js";
import { defineActionSpec } from "../../core/actionSpec.js";
import { mergeRequestUserSchema } from "../../schemas/mergeRequests.js";

export const action = "DescribeMergeRequestReviewers";

export const requestSchema = Schema.Struct({
  DepotId: Schema.Number,
  MergeId: Schema.Number,
});

export const responseSchema = Schema.Struct({
  RequestId: Schema.String,
  Reviewers: Schema.Array(mergeRequestUserSchema),
});

export type DescribeMergeRequestReviewersRequest = Schema.Schema.Type<typeof requestSchema>;

export type DescribeMergeRequestReviewersResponse = Schema.Schema.Type<typeof responseSchema>;

export const describeMergeRequestReviewersSpec = defineActionSpec({
  action,
  actionPlacement: "body",
  requestSchema,
  responseSchema,
  summary: "合并请求-获取合并请求的评审者",
});

/**
 * 获取合并请求的评审者列表。
 *
 * @param client 共享上下文客户端。
 * @param input 当前 action 的请求参数。
 * @param options 本次调用的局部覆盖配置。
 * @returns 解码后的评审者列表响应。
 */
export async function describeMergeRequestReviewers(
  client: CodingClient,
  input: DescribeMergeRequestReviewersRequest,
  options?: InvokeOptions,
): Promise<DescribeMergeRequestReviewersResponse> {
  return client.invoke(describeMergeRequestReviewersSpec, input, options);
}