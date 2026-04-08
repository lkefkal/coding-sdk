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

export const issueUserSchema = Schema.Struct({
  Avatar: Schema.String,
  Email: Schema.String,
  GlobalKey: Schema.String,
  Id: Schema.Number,
  Name: Schema.String,
  Phone: Schema.String,
  Status: Schema.NullOr(Schema.Number),
  TeamGlobalKey: Schema.String,
  TeamId: Schema.Number,
});

export const issueDefectTypeSchema = Schema.Struct({
  IconUrl: Schema.String,
  Id: Schema.Number,
  Name: Schema.String,
});

export const issueEpicSchema = Schema.Struct({
  Assignee: Schema.NullOr(issueUserSchema),
  Code: Schema.Number,
  IssueStatusId: Schema.NullOr(Schema.Number),
  IssueStatusName: Schema.NullOr(Schema.String),
  Name: Schema.String,
  Priority: Schema.NullOr(Schema.String),
  Type: Schema.optional(Schema.String),
});

export const issueFileSchema = Schema.Struct({
  FileId: Schema.Number,
  Name: Schema.String,
  Size: Schema.Number,
  Type: Schema.Number,
  Url: Schema.String,
});

export const issueProjectLabelSchema = Schema.Struct({
  Color: Schema.String,
  Id: Schema.Number,
  Name: Schema.String,
});

export const issueSimpleDataSchema = Schema.Struct({
  Assignee: issueUserSchema,
  Code: Schema.Number,
  IssueStatusId: Schema.Number,
  IssueStatusName: Schema.String,
  IssueStatusType: Schema.String,
  IssueTypeDetail: issueTypeDetailSchema,
  Name: Schema.String,
  Priority: Schema.NullOr(Schema.String),
  Type: Schema.String,
});

export const issueProjectSchema = Schema.Struct({
  Archived: Schema.NullOr(Schema.Boolean),
  CreatedAt: Schema.NullOr(Schema.Number),
  Description: Schema.NullOr(Schema.String),
  DisplayName: Schema.NullOr(Schema.String),
  EndDate: Schema.NullOr(Schema.Number),
  Icon: Schema.NullOr(Schema.String),
  Id: Schema.Number,
  IsDemo: Schema.NullOr(Schema.Boolean),
  MaxMember: Schema.NullOr(Schema.Number),
  Name: Schema.NullOr(Schema.String),
  ProgramIds: Schema.optional(Schema.Array(Schema.Unknown)),
  StartDate: Schema.NullOr(Schema.Number),
  Status: Schema.NullOr(Schema.Number),
  TeamId: Schema.NullOr(Schema.Number),
  TeamOwnerId: Schema.NullOr(Schema.Number),
  Type: Schema.NullOr(Schema.Number),
  UpdatedAt: Schema.NullOr(Schema.Number),
  UserOwnerId: Schema.NullOr(Schema.Number),
});

export const issueProjectModuleSchema = Schema.Struct({
  Id: Schema.Number,
  Name: Schema.String,
});

export const issueRequirementTypeSchema = Schema.Struct({
  Id: Schema.Number,
  Name: Schema.String,
});

export const issueSubTaskSchema = Schema.Struct({
  Assignee: Schema.NullOr(issueUserSchema),
  Code: Schema.Number,
  IssueStatusId: Schema.NullOr(Schema.Number),
  IssueStatusName: Schema.NullOr(Schema.String),
  Name: Schema.String,
  Priority: Schema.NullOr(Schema.String),
  Type: Schema.optional(Schema.NullOr(Schema.String)),
});

export const issueThirdLinkSchema = Schema.Struct({
  Id: Schema.Number,
  Link: Schema.String,
  ThirdType: Schema.String,
  Title: Schema.String,
});

export const apiIssueLogIssueLogSchema = Schema.Struct({
  ActionType: Schema.String,
  Content: Schema.String,
  CreateAt: Schema.Number,
  Creator: Schema.Number,
  IssueId: Schema.Number,
  Target: Schema.String,
  TargetName: Schema.String,
  UpdatedAt: Schema.Number,
});

export const issueCommentSchema = Schema.Struct({
  CommentId: Schema.Number,
  Content: Schema.String,
  CreatedAt: Schema.Number,
  CreatorId: Schema.Number,
  FileId: Schema.optional(Schema.Array(Schema.Number)),
  ParentId: Schema.Number,
  RawContent: Schema.String,
  UpdatedAt: Schema.Number,
});

export const issueWorkLogSchema = Schema.Struct({
  CreatedAt: Schema.Number,
  Id: Schema.Number,
  IssueCode: Schema.Number,
  IssueId: Schema.Number,
  ProjectName: Schema.String,
  RecordHours: Schema.Number,
  RemainingHours: Schema.Number,
  StartAt: Schema.optional(Schema.Number),
  UpdatedAt: Schema.optional(Schema.NullOr(Schema.Number)),
  UserId: Schema.Number,
  WorkingDesc: Schema.String,
});

export const resourceReferenceSchema = Schema.Struct({
  ProjectId: Schema.optional(Schema.NullOr(Schema.Number)),
  ProjectName: Schema.optional(Schema.NullOr(Schema.String)),
  ResourceCode: Schema.optional(Schema.NullOr(Schema.Number)),
  ResourceId: Schema.optional(Schema.NullOr(Schema.Number)),
  ResourceName: Schema.optional(Schema.NullOr(Schema.String)),
  ResourceStatus: Schema.optional(Schema.NullOr(Schema.String)),
  ResourceType: Schema.optional(Schema.NullOr(Schema.String)),
});

export const issueStatusSchema = Schema.Struct({
  CreatedAt: Schema.Number,
  Description: Schema.NullOr(Schema.String),
  Id: Schema.Number,
  Index: Schema.Number,
  IsSystem: Schema.Boolean,
  Name: Schema.String,
  Type: Schema.String,
  UpdatedAt: Schema.Number,
});

export const issueStatusChangeLogSchema = Schema.Struct({
  CreatedAt: Schema.optional(Schema.NullOr(Schema.Number)),
  IssueCode: Schema.optional(Schema.NullOr(Schema.Number)),
  IssueStatus: Schema.optional(Schema.NullOr(issueStatusSchema)),
  StatusId: Schema.optional(Schema.NullOr(Schema.Number)),
  StatusName: Schema.optional(Schema.NullOr(Schema.String)),
});

export const issueStatusChangeLogListSchema = Schema.Struct({
  List: Schema.optional(Schema.NullOr(Schema.Array(issueStatusChangeLogSchema))),
});

export const customFieldChangeLogSchema = Schema.Struct({
  ActionType: Schema.optional(Schema.NullOr(Schema.String)),
  Creator: Schema.optional(Schema.NullOr(Schema.Number)),
  FieldId: Schema.optional(Schema.NullOr(Schema.Number)),
  FieldName: Schema.optional(Schema.NullOr(Schema.String)),
  FieldType: Schema.optional(Schema.NullOr(Schema.String)),
  FieldValue: Schema.optional(Schema.NullOr(Schema.String)),
  IssueId: Schema.optional(Schema.NullOr(Schema.Number)),
  UpdatedAt: Schema.optional(Schema.NullOr(Schema.Number)),
});

export const issueDetailSchema = Schema.Struct({
  Assignee: issueUserSchema,
  Assignees: Schema.optional(Schema.Array(issueUserSchema)),
  Code: Schema.Number,
  CompletedAt: Schema.Number,
  CreatedAt: Schema.Number,
  Creator: issueUserSchema,
  CustomFields: Schema.Array(issueCustomFieldSchema),
  DefectType: issueDefectTypeSchema,
  Description: Schema.String,
  DueDate: Schema.Number,
  Epic: issueEpicSchema,
  Files: Schema.Array(issueFileSchema),
  IssueStatusId: Schema.Number,
  IssueStatusName: Schema.String,
  IssueStatusType: Schema.String,
  IssueTypeDetail: issueTypeDetailSchema,
  IssueTypeId: Schema.Number,
  Iteration: issueIterationSchema,
  IterationId: Schema.Number,
  Labels: Schema.Array(issueProjectLabelSchema),
  Name: Schema.String,
  Parent: issueSimpleDataSchema,
  ParentType: Schema.String,
  Priority: Schema.String,
  Project: Schema.NullOr(issueProjectSchema),
  ProjectModule: issueProjectModuleSchema,
  RequirementType: issueRequirementTypeSchema,
  StartDate: Schema.Number,
  StoryPoint: Schema.String,
  SubTasks: Schema.Array(issueSubTaskSchema),
  ThirdLinks: Schema.Array(issueThirdLinkSchema),
  Type: Schema.String,
  UpdatedAt: Schema.Number,
  Watchers: Schema.Array(issueUserSchema),
  WorkingHours: Schema.Number,
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
export type ApiIssueLogIssueLog = Schema.Schema.Type<typeof apiIssueLogIssueLogSchema>;
export type CustomFieldChangeLog = Schema.Schema.Type<typeof customFieldChangeLogSchema>;
export type IssueDefectType = Schema.Schema.Type<typeof issueDefectTypeSchema>;
export type IssueComment = Schema.Schema.Type<typeof issueCommentSchema>;
export type IssueDetail = Schema.Schema.Type<typeof issueDetailSchema>;
export type IssueEpic = Schema.Schema.Type<typeof issueEpicSchema>;
export type IssueFile = Schema.Schema.Type<typeof issueFileSchema>;
export type IssueIteration = Schema.Schema.Type<typeof issueIterationSchema>;
export type IssueListItem = Schema.Schema.Type<typeof issueListItemSchema>;
export type IssueProject = Schema.Schema.Type<typeof issueProjectSchema>;
export type IssueProjectLabel = Schema.Schema.Type<typeof issueProjectLabelSchema>;
export type IssueProjectModule = Schema.Schema.Type<typeof issueProjectModuleSchema>;
export type IssueRequirementType = Schema.Schema.Type<typeof issueRequirementTypeSchema>;
export type IssueStatus = Schema.Schema.Type<typeof issueStatusSchema>;
export type IssueStatusChangeLog = Schema.Schema.Type<typeof issueStatusChangeLogSchema>;
export type IssueStatusChangeLogList = Schema.Schema.Type<typeof issueStatusChangeLogListSchema>;
export type IssueWorkLog = Schema.Schema.Type<typeof issueWorkLogSchema>;
export type ResourceReference = Schema.Schema.Type<typeof resourceReferenceSchema>;
export type IssueSimpleData = Schema.Schema.Type<typeof issueSimpleDataSchema>;
export type IssueSubTask = Schema.Schema.Type<typeof issueSubTaskSchema>;
export type IssueThirdLink = Schema.Schema.Type<typeof issueThirdLinkSchema>;
export type IssueType = Schema.Schema.Type<typeof issueTypeSchema>;
export type IssueTypeDetail = Schema.Schema.Type<typeof issueTypeDetailSchema>;
export type IssueUser = Schema.Schema.Type<typeof issueUserSchema>;
export type SortDirection = Schema.Schema.Type<typeof sortDirectionSchema>;