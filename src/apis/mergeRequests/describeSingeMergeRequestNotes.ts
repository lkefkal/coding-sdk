import { Schema } from "effect";

import type { CodingClient, InvokeOptions } from "../../client/types.js";
import { defineActionSpec } from "../../core/actionSpec.js";
import { mergeRequestNoteListSchema } from "../../schemas/mergeRequests.js";

export const action = "DescribeSingeMergeRequestNotes";

export const requestSchema = Schema.Struct({
  DepotPath: Schema.String,
  MergeId: Schema.Number,
});

export const responseSchema = Schema.Struct({
  Notes: Schema.Array(mergeRequestNoteListSchema),
  RequestId: Schema.String,
});

export type DescribeSingeMergeRequestNotesRequest = Schema.Schema.Type<typeof requestSchema>;

export type DescribeSingeMergeRequestNotesResponse = Schema.Schema.Type<typeof responseSchema>;

export const describeSingeMergeRequestNotesSpec = defineActionSpec({
  action,
  actionPlacement: "both",
  requestSchema,
  responseSchema,
  summary: "合并请求-获取单个合并请求行评论和改动文件diff行评论",
});

/**
 * 获取单个合并请求的行评论和改动文件 diff 行评论。
 *
 * @param client 共享上下文客户端。
 * @param input 当前 action 的请求参数。
 * @param options 本次调用的局部覆盖配置。
 * @returns 解码后的评论列表响应。
 */
export async function describeSingeMergeRequestNotes(
  client: CodingClient,
  input: DescribeSingeMergeRequestNotesRequest,
  options?: InvokeOptions,
): Promise<DescribeSingeMergeRequestNotesResponse> {
  return client.invoke(describeSingeMergeRequestNotesSpec, input, options);
}