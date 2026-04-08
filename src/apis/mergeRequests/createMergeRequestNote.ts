import { Schema } from "effect";

import type { CodingClient, InvokeOptions } from "../../client/types.js";
import { defineActionSpec } from "../../core/actionSpec.js";
import {
  mergeRequestDiffNoteFormSchema,
  mergeRequestNoteSchema,
} from "../../schemas/mergeRequests.js";

export const action = "CreateMergeRequestNote";

export const requestSchema = Schema.Struct({
  Content: Schema.String,
  DepotPath: Schema.String,
  Form: Schema.optional(mergeRequestDiffNoteFormSchema),
  MergeId: Schema.Number,
  ParentId: Schema.Number,
});

export const responseSchema = Schema.Struct({
  Note: mergeRequestNoteSchema,
  RequestId: Schema.String,
});

export type CreateMergeRequestNoteRequest = Schema.Schema.Type<typeof requestSchema>;

export type CreateMergeRequestNoteResponse = Schema.Schema.Type<typeof responseSchema>;

export const createMergeRequestNoteSpec = defineActionSpec({
  action,
  actionPlacement: "both",
  requestSchema,
  responseSchema,
  summary: "合并请求-创建合并请求行评论和改动文件diff行评论",
});

/**
 * 创建合并请求评论或 diff 行评论。
 *
 * @param client 共享上下文客户端。
 * @param input 当前 action 的请求参数。
 * @param options 本次调用的局部覆盖配置。
 * @returns 解码后的创建评论响应。
 */
export async function createMergeRequestNote(
  client: CodingClient,
  input: CreateMergeRequestNoteRequest,
  options?: InvokeOptions,
): Promise<CreateMergeRequestNoteResponse> {
  return client.invoke(createMergeRequestNoteSpec, input, options);
}