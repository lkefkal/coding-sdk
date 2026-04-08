import { Schema } from "effect";

import type { CodingClient, InvokeOptions } from "../../client/types.js";
import { defineActionSpec } from "../../core/actionSpec.js";
import { describeMergeRequestsDataSchema } from "../../schemas/mergeRequests.js";

export const action = "DescribeProjectMergeRequests";

export const requestSchema = Schema.Struct({
  CreatedAtEndDate: Schema.optional(Schema.String),
  CreatedAtStartDate: Schema.optional(Schema.String),
  CreatorEmail: Schema.optional(Schema.String),
  CreatorGlobalKey: Schema.optional(Schema.String),
  IsSortDirectionAsc: Schema.optional(Schema.Boolean),
  KeyWord: Schema.optional(Schema.String),
  Label: Schema.optional(Schema.String),
  MergerEmail: Schema.optional(Schema.String),
  MergerGlobalKey: Schema.optional(Schema.String),
  PageNumber: Schema.optional(Schema.Number),
  PageSize: Schema.optional(Schema.Number),
  ProjectId: Schema.Number,
  ReviewerEmail: Schema.optional(Schema.String),
  ReviewerGlobalKey: Schema.optional(Schema.String),
  Sort: Schema.optional(Schema.String),
  SourceBranch: Schema.optional(Schema.String),
  Status: Schema.optional(Schema.String),
  TargetBranch: Schema.optional(Schema.String),
  UpdatedAtEndDate: Schema.optional(Schema.String),
  UpdatedAtStartDate: Schema.optional(Schema.String),
});

export const responseSchema = Schema.Struct({
  Data: describeMergeRequestsDataSchema,
  RequestId: Schema.String,
});

export type DescribeProjectMergeRequestsRequest = Schema.Schema.Type<typeof requestSchema>;
export type DescribeProjectMergeRequestsResponse = Schema.Schema.Type<typeof responseSchema>;

export const describeProjectMergeRequestsSpec = defineActionSpec({
  action,
  actionPlacement: "body",
  requestSchema,
  responseSchema,
  summary: "项目-获取项目下的合并请求列表",
});

/**
 * 查询项目维度下的合并请求列表。
 */
export async function describeProjectMergeRequests(
  client: CodingClient,
  input: DescribeProjectMergeRequestsRequest,
  options?: InvokeOptions,
): Promise<DescribeProjectMergeRequestsResponse> {
  return client.invoke(describeProjectMergeRequestsSpec, input, options);
}