import { Schema } from "effect";

import type { CodingClient, InvokeOptions } from "../../client/types.js";
import { defineActionSpec } from "../../core/actionSpec.js";
import { mergeRequestUserSchema } from "../../schemas/mergeRequests.js";

export const action = "CreateMergeRequestReviewer";

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

export type CreateMergeRequestReviewerRequest = Schema.Schema.Type<typeof requestSchema>;

export type CreateMergeRequestReviewerResponse = Schema.Schema.Type<typeof responseSchema>;

export const createMergeRequestReviewerSpec = defineActionSpec({
  action,
  actionPlacement: "body",
  requestSchema,
  responseSchema,
  summary: "合并请求-新增合并请求评审者",
});

/**
 * 为合并请求新增评审者。
 *
 * @param client 共享上下文客户端。
 * @param input 当前 action 的请求参数。
 * @param options 本次调用的局部覆盖配置。
 * @returns 解码后的评审者列表响应。
 */
export async function createMergeRequestReviewer(
  client: CodingClient,
  input: CreateMergeRequestReviewerRequest,
  options?: InvokeOptions,
): Promise<CreateMergeRequestReviewerResponse> {
  return client.invoke(createMergeRequestReviewerSpec, input, options);
}