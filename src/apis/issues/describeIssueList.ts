import { Schema } from "effect";

import type { CodingClient, InvokeOptions } from "../../client/types.js";
import { defineActionSpec } from "../../core/actionSpec.js";

export const action = "DescribeIssueList";

export const issueIterationSchema = Schema.Struct({
  Code: Schema.optional(Schema.Number),
  Name: Schema.optional(Schema.String),
  Status: Schema.optional(Schema.String),
});

export const issueListItemSchema = Schema.Struct({
  AssigneeId: Schema.optional(Schema.Number),
  Code: Schema.Number,
  CompletedAt: Schema.optional(Schema.Number),
  CreatedAt: Schema.optional(Schema.Number),
  CreatorId: Schema.optional(Schema.Number),
  Description: Schema.optional(Schema.String),
  DueDate: Schema.optional(Schema.Number),
  IssueStatusId: Schema.optional(Schema.Number),
  IssueStatusName: Schema.optional(Schema.String),
  IssueStatusType: Schema.optional(Schema.String),
  Iteration: Schema.optional(issueIterationSchema),
  IterationId: Schema.optional(Schema.Number),
  Name: Schema.String,
  ParentType: Schema.optional(Schema.String),
  Priority: Schema.optional(Schema.String),
  StartDate: Schema.optional(Schema.Number),
  StoryPoint: Schema.optional(Schema.String),
  Type: Schema.String,
  UpdatedAt: Schema.optional(Schema.Number),
  WorkingHours: Schema.optional(Schema.Union(Schema.Number, Schema.String)),
});

export const requestSchema = Schema.Struct({
  Conditions: Schema.optional(Schema.Array(Schema.Unknown)),
  IssueType: Schema.Literal(
    "ALL",
    "DEFECT",
    "REQUIREMENT",
    "MISSION",
    "EPIC",
  ),
  Limit: Schema.optional(Schema.Number),
  Offset: Schema.optional(Schema.Number),
  ProjectName: Schema.String,
  ShowImageOutUrl: Schema.optional(Schema.Boolean),
  SortKey: Schema.optional(Schema.String),
  SortValue: Schema.optional(Schema.Literal("ASC", "DESC")),
});

export const responseSchema = Schema.Struct({
  IssueList: Schema.Array(issueListItemSchema),
  RequestId: Schema.String,
});

export type DescribeIssueListRequest = Schema.Schema.Type<typeof requestSchema>;

export type DescribeIssueListResponse = Schema.Schema.Type<typeof responseSchema>;

export const describeIssueListSpec = defineActionSpec({
  action,
  actionPlacement: "body",
  requestSchema,
  responseSchema,
  summary: "查询事项列表",
});

export async function describeIssueList(
  client: CodingClient,
  input: DescribeIssueListRequest,
  options?: InvokeOptions,
): Promise<DescribeIssueListResponse> {
  return client.invoke(describeIssueListSpec, input, options);
}