import { Schema } from "effect";

import type { CodingClient, InvokeOptions } from "../../client/types.js";
import { defineActionSpec } from "../../core/actionSpec.js";
import { mergeRequestUserSchema } from "../../schemas/mergeRequests.js";

export const action = "DeleteMergeRequestReviewer";

export const requestSchema = Schema.Struct({
  DepotId: Schema.Number,
  DepotPath: Schema.optional(Schema.String),
  MergeId: Schema.Number,
  ReviewerGlobalKey: Schema.String,
});

export const responseSchema = Schema.Struct({
  RequestId: Schema.String,
  Reviewers: Schema.Array(mergeRequestUserSchema),
});

export type DeleteMergeRequestReviewerRequest = Schema.Schema.Type<typeof requestSchema>;

export type DeleteMergeRequestReviewerResponse = Schema.Schema.Type<typeof responseSchema>;

export const deleteMergeRequestReviewerSpec = defineActionSpec({
  action,
  actionPlacement: "body",
  requestSchema,
  responseSchema,
  summary: "合并请求-删除mr评审者",
});

/**
 * 删除合并请求评审者。
 *
 * @param client 共享上下文客户端。
 * @param input 当前 action 的请求参数。
 * @param options 本次调用的局部覆盖配置。
 * @returns 解码后的剩余评审者列表响应。
 */
export async function deleteMergeRequestReviewer(
  client: CodingClient,
  input: DeleteMergeRequestReviewerRequest,
  options?: InvokeOptions,
): Promise<DeleteMergeRequestReviewerResponse> {
  return client.invoke(deleteMergeRequestReviewerSpec, input, options);
}