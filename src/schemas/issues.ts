import { Schema } from "effect";

export const issueTypeSchema = Schema.Literal(
  "ALL",
  "DEFECT",
  "REQUIREMENT",
  "MISSION",
  "EPIC",
);

export const sortDirectionSchema = Schema.Literal("ASC", "DESC");

export const issueConditionSchema = Schema.Struct({
  ConstValue: Schema.optional(Schema.String),
  CustomFieldId: Schema.optional(Schema.Number),
  CustomFieldName: Schema.optional(Schema.String),
  Key: Schema.String,
  Value: Schema.optional(Schema.String),
});

export const issueCustomFieldSchema = Schema.Struct({
  Id: Schema.Number,
  Name: Schema.String,
  ValueString: Schema.String,
});

export const issueTypeDetailSchema = Schema.Struct({
  Description: Schema.String,
  Id: Schema.Number,
  IsSystem: Schema.Boolean,
  IssueType: Schema.String,
  Name: Schema.String,
});

export const issueIterationSchema = Schema.Struct({
  Code: Schema.Number,
  Id: Schema.Number,
  Name: Schema.String,
  Status: Schema.String,
});

export const issueListItemSchema = Schema.Struct({
  AssigneeId: Schema.Number,
  Code: Schema.Number,
  CompletedAt: Schema.NullOr(Schema.Number),
  CreatedAt: Schema.NullOr(Schema.Number),
  CreatorId: Schema.Number,
  CustomFields: Schema.optional(Schema.NullOr(Schema.Array(issueCustomFieldSchema))),
  Description: Schema.String,
  DueDate: Schema.NullOr(Schema.Number),
  IssueStatusId: Schema.Number,
  IssueStatusName: Schema.String,
  IssueStatusType: Schema.String,
  IssueTypeDetail: Schema.NullOr(issueTypeDetailSchema),
  IssueTypeId: Schema.NullOr(Schema.Number),
  Iteration: Schema.NullOr(issueIterationSchema),
  IterationId: Schema.Number,
  Labels: Schema.optional(Schema.NullOr(Schema.Array(Schema.Unknown))),
  Name: Schema.String,
  ParentCode: Schema.optional(Schema.NullOr(Schema.Number)),
  ParentId: Schema.optional(Schema.NullOr(Schema.Number)),
  ParentType: Schema.String,
  Priority: Schema.String,
  StartDate: Schema.NullOr(Schema.Number),
  StoryPoint: Schema.NullOr(Schema.String),
  Type: Schema.String,
  UpdatedAt: Schema.NullOr(Schema.Number),
  WorkingHours: Schema.Number,
  Assignees: Schema.optional(Schema.Array(Schema.Unknown)),
});

export type IssueCondition = Schema.Schema.Type<typeof issueConditionSchema>;
export type IssueCustomField = Schema.Schema.Type<typeof issueCustomFieldSchema>;
export type IssueIteration = Schema.Schema.Type<typeof issueIterationSchema>;
export type IssueListItem = Schema.Schema.Type<typeof issueListItemSchema>;
export type IssueType = Schema.Schema.Type<typeof issueTypeSchema>;
export type IssueTypeDetail = Schema.Schema.Type<typeof issueTypeDetailSchema>;
export type SortDirection = Schema.Schema.Type<typeof sortDirectionSchema>;