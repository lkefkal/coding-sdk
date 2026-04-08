import { Schema } from "effect";

import type { CodingClient, InvokeOptions } from "../../client/types.js";
import { defineActionSpec } from "../../core/actionSpec.js";
import { describeMergeRequestsDataSchema } from "../../schemas/mergeRequests.js";

export const action = "DescribeDepotMergeRequests";

export const requestSchema = Schema.Struct({
  CreatedAtEndDate: Schema.optional(Schema.String),
  CreatedAtStartDate: Schema.optional(Schema.String),
  CreatorEmails: Schema.optional(Schema.Array(Schema.String)),
  CreatorGlobalKeys: Schema.optional(Schema.Array(Schema.String)),
  DepotId: Schema.Number,
  DepotPath: Schema.optional(Schema.String),
  IsSortDirectionAsc: Schema.optional(Schema.Boolean),
  KeyWord: Schema.optional(Schema.String),
  Labels: Schema.optional(Schema.Array(Schema.String)),
  MergerEmails: Schema.optional(Schema.Array(Schema.String)),
  MergerGlobalKeys: Schema.optional(Schema.Array(Schema.String)),
  PageNumber: Schema.optional(Schema.Number),
  PageSize: Schema.optional(Schema.Number),
  ReviewerEmails: Schema.optional(Schema.Array(Schema.String)),
  ReviewerGlobalKeys: Schema.optional(Schema.Array(Schema.String)),
  Sort: Schema.optional(Schema.String),
  SourceBranches: Schema.optional(Schema.Array(Schema.String)),
  Status: Schema.optional(Schema.String),
  TargetBranches: Schema.optional(Schema.Array(Schema.String)),
  UpdatedAtEndDate: Schema.optional(Schema.String),
  UpdatedAtStartDate: Schema.optional(Schema.String),
});

export const responseSchema = Schema.Struct({
  Data: describeMergeRequestsDataSchema,
  RequestId: Schema.String,
});

export type DescribeDepotMergeRequestsRequest = Schema.Schema.Type<typeof requestSchema>;

export type DescribeDepotMergeRequestsResponse = Schema.Schema.Type<typeof responseSchema>;

export const describeDepotMergeRequestsSpec = defineActionSpec({
  action,
  actionPlacement: "both",
  requestSchema,
  responseSchema,
  summary: "合并请求-查询仓库合并请求列表",
});

/**
 * 查询仓库合并请求列表。
 *
 * @param client 共享上下文客户端。
 * @param input 当前 action 的请求参数。
 * @param options 本次调用的局部覆盖配置。
 * @returns 解码后的合并请求列表响应。
 */
export async function describeDepotMergeRequests(
  client: CodingClient,
  input: DescribeDepotMergeRequestsRequest,
  options?: InvokeOptions,
): Promise<DescribeDepotMergeRequestsResponse> {
  return client.invoke(describeDepotMergeRequestsSpec, input, options);
}