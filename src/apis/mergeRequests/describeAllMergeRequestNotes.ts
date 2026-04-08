import { Schema } from "effect";

import type { CodingClient, InvokeOptions } from "../../client/types.js";
import { defineActionSpec } from "../../core/actionSpec.js";
import { mergeRequestNoteListSchema } from "../../schemas/mergeRequests.js";

export const action = "DescribeAllMergeRequestNotes";

export const requestSchema = Schema.Struct({
  CreatedAtEndDate: Schema.optional(Schema.String),
  CreatedAtStartDate: Schema.optional(Schema.String),
  DepotPath: Schema.String,
  MergeIds: Schema.optional(Schema.Array(Schema.Number)),
  MrStatuses: Schema.optional(Schema.Array(Schema.String)),
  PageNumber: Schema.Number,
  PageSize: Schema.Number,
  ReporterIds: Schema.optional(Schema.Array(Schema.Number)),
});

export const responseSchema = Schema.Struct({
  Notes: Schema.Array(mergeRequestNoteListSchema),
  RequestId: Schema.String,
});

export type DescribeAllMergeRequestNotesRequest = Schema.Schema.Type<typeof requestSchema>;

export type DescribeAllMergeRequestNotesResponse = Schema.Schema.Type<typeof responseSchema>;

export const describeAllMergeRequestNotesSpec = defineActionSpec({
  action,
  actionPlacement: "both",
  requestSchema,
  responseSchema,
  summary: "合并请求-获取所有合并请求行评论和改动文件diff行评论",
});

/**
 * 获取所有合并请求的行评论和改动文件 diff 行评论。
 *
 * @param client 共享上下文客户端。
 * @param input 当前 action 的请求参数。
 * @param options 本次调用的局部覆盖配置。
 * @returns 解码后的评论列表响应。
 */
export async function describeAllMergeRequestNotes(
  client: CodingClient,
  input: DescribeAllMergeRequestNotesRequest,
  options?: InvokeOptions,
): Promise<DescribeAllMergeRequestNotesResponse> {
  return client.invoke(describeAllMergeRequestNotesSpec, input, options);
}