import { Schema } from "effect";

import type { CodingClient, InvokeOptions } from "../../client/types.js";
import { defineActionSpec } from "../../core/actionSpec.js";
import { mergeRequestNoteSchema } from "../../schemas/mergeRequests.js";

export const action = "DeleteMergeRequestNote";

export const requestSchema = Schema.Struct({
  DepotPath: Schema.String,
  LineNoteId: Schema.Number,
  MergeId: Schema.Number,
});

export const responseSchema = Schema.Struct({
  Note: mergeRequestNoteSchema,
  RequestId: Schema.String,
});

export type DeleteMergeRequestNoteRequest = Schema.Schema.Type<typeof requestSchema>;

export type DeleteMergeRequestNoteResponse = Schema.Schema.Type<typeof responseSchema>;

export const deleteMergeRequestNoteSpec = defineActionSpec({
  action,
  actionPlacement: "both",
  requestSchema,
  responseSchema,
  summary: "合并请求-删除合并请求行评论和改动文件diff行评论",
});

/**
 * 删除合并请求评论或 diff 行评论。
 *
 * @param client 共享上下文客户端。
 * @param input 当前 action 的请求参数。
 * @param options 本次调用的局部覆盖配置。
 * @returns 解码后的删除评论响应。
 */
export async function deleteMergeRequestNote(
  client: CodingClient,
  input: DeleteMergeRequestNoteRequest,
  options?: InvokeOptions,
): Promise<DeleteMergeRequestNoteResponse> {
  return client.invoke(deleteMergeRequestNoteSpec, input, options);
}