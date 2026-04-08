import { Schema } from "effect";

export const mergeRequestUserSchema = Schema.Struct({
  Avatar: Schema.NullOr(Schema.String),
  Email: Schema.String,
  GlobalKey: Schema.NullOr(Schema.String),
  Id: Schema.Number,
  Name: Schema.NullOr(Schema.String),
  Status: Schema.NullOr(Schema.String),
  TeamId: Schema.NullOr(Schema.Number),
});

export const mergeRequestMissionSchema = Schema.Struct({
  Code: Schema.optional(Schema.NullOr(Schema.Number)),
  Link: Schema.optional(Schema.NullOr(Schema.String)),
  TargetId: Schema.optional(Schema.NullOr(Schema.Number)),
  TargetProjectName: Schema.optional(Schema.NullOr(Schema.String)),
  TargetType: Schema.optional(Schema.NullOr(Schema.String)),
  Title: Schema.optional(Schema.NullOr(Schema.String)),
});

export const mergeRequestListItemSchema = Schema.Struct({
  ActionAt: Schema.NullOr(Schema.Number),
  ActionAuthor: Schema.NullOr(mergeRequestUserSchema),
  Author: Schema.NullOr(mergeRequestUserSchema),
  BaseSha: Schema.NullOr(Schema.String),
  CommentCount: Schema.NullOr(Schema.Number),
  CreatedAt: Schema.NullOr(Schema.Number),
  DepotId: Schema.Number,
  Describe: Schema.NullOr(Schema.String),
  Granted: Schema.NullOr(Schema.Number),
  Id: Schema.Number,
  Labels: Schema.NullOr(Schema.Array(Schema.String)),
  MergeCommitSha: Schema.NullOr(Schema.String),
  MergeId: Schema.Number,
  Path: Schema.NullOr(Schema.String),
  ProjectId: Schema.Number,
  Reminded: Schema.NullOr(Schema.Boolean),
  Reviewers: Schema.NullOr(Schema.Array(mergeRequestUserSchema)),
  SourceBranch: Schema.NullOr(Schema.String),
  SourceBranchSha: Schema.NullOr(Schema.String),
  Status: Schema.NullOr(Schema.String),
  StickingPoint: Schema.NullOr(Schema.String),
  TargetBranch: Schema.NullOr(Schema.String),
  TargetBranchProtected: Schema.NullOr(Schema.Boolean),
  TargetBranchSha: Schema.NullOr(Schema.String),
  Title: Schema.String,
  UpdateAt: Schema.NullOr(Schema.Number),
});

export const describeMergeRequestsDataSchema = Schema.Struct({
  List: Schema.NullOr(Schema.Array(mergeRequestListItemSchema)),
  PageNumber: Schema.Number,
  PageSize: Schema.Number,
  TotalPage: Schema.Number,
  TotalRow: Schema.Number,
});

export const mergeRequestInfoSchema = Schema.Struct({
  ActionAt: Schema.Number,
  ActionAuthor: mergeRequestUserSchema,
  Author: mergeRequestUserSchema,
  BaseSha: Schema.String,
  CommentCount: Schema.Number,
  Conflicts: Schema.Array(Schema.String),
  CreatedAt: Schema.Number,
  DepotId: Schema.Number,
  Describe: Schema.String,
  Granted: Schema.Number,
  Id: Schema.Number,
  Labels: Schema.NullOr(Schema.Array(Schema.String)),
  MergeCommitSha: Schema.String,
  MergeId: Schema.Number,
  Mission: Schema.optional(Schema.NullOr(mergeRequestMissionSchema)),
  Path: Schema.String,
  ProjectId: Schema.Number,
  Reminded: Schema.NullOr(Schema.Boolean),
  Reviewers: Schema.NullOr(Schema.Array(mergeRequestUserSchema)),
  SourceBranch: Schema.String,
  SourceBranchSha: Schema.String,
  Status: Schema.String,
  StickingPoint: Schema.String,
  TargetBranch: Schema.String,
  TargetBranchProtected: Schema.Boolean,
  TargetBranchSha: Schema.String,
  Title: Schema.String,
  UpdatedAt: Schema.Number,
});

export const mergeRequestDiffFileSchema = Schema.Struct({
  BlobSha: Schema.NullOr(Schema.String),
  ChangeType: Schema.NullOr(Schema.String),
  Deletions: Schema.NullOr(Schema.Number),
  Insertions: Schema.NullOr(Schema.Number),
  Path: Schema.NullOr(Schema.String),
  Size: Schema.NullOr(Schema.Number),
});

export const mergeRequestDiffSchema = Schema.Struct({
  Deletions: Schema.NullOr(Schema.Number),
  Insertions: Schema.NullOr(Schema.Number),
  IsLarge: Schema.NullOr(Schema.Boolean),
  NewSha: Schema.NullOr(Schema.String),
  OldSha: Schema.NullOr(Schema.String),
  Paths: Schema.NullOr(Schema.Array(mergeRequestDiffFileSchema)),
});

export const mergeRequestLogSchema = Schema.Struct({
  Action: Schema.String,
  Id: Schema.Number,
  Name: Schema.String,
});

export const gitDiffLineSchema = Schema.Struct({
  Index: Schema.NullOr(Schema.Number),
  LeftNo: Schema.NullOr(Schema.Number),
  Prefix: Schema.NullOr(Schema.String),
  RightNo: Schema.NullOr(Schema.Number),
  Text: Schema.NullOr(Schema.String),
});

export const gitDiffSchema = Schema.Struct({
  ChangeType: Schema.String,
  Content: Schema.String,
  Deletions: Schema.Number,
  Insertions: Schema.Number,
  Lines: Schema.Array(gitDiffLineSchema),
  NewMode: Schema.String,
  OldMode: Schema.String,
  Path: Schema.String,
});

export const mergeRequestFileDiffItemSchema = Schema.Struct({
  ChangeType: Schema.String,
  Deletions: Schema.Number,
  DiffLines: Schema.Array(gitDiffLineSchema),
  Insertions: Schema.Number,
  ObjectId: Schema.String,
  Path: Schema.String,
});

export const mergeRequestFileDiffSchema = Schema.Struct({
  Deletions: Schema.Number,
  FileDiffs: Schema.Array(mergeRequestFileDiffItemSchema),
  Insertions: Schema.Number,
  NewSha: Schema.String,
  OldSha: Schema.String,
});

export type DescribeMergeRequestsData = Schema.Schema.Type<typeof describeMergeRequestsDataSchema>;
export type GitDiff = Schema.Schema.Type<typeof gitDiffSchema>;
export type GitDiffLine = Schema.Schema.Type<typeof gitDiffLineSchema>;
export type MergeRequestDiff = Schema.Schema.Type<typeof mergeRequestDiffSchema>;
export type MergeRequestDiffFile = Schema.Schema.Type<typeof mergeRequestDiffFileSchema>;
export type MergeRequestFileDiff = Schema.Schema.Type<typeof mergeRequestFileDiffSchema>;
export type MergeRequestFileDiffItem = Schema.Schema.Type<typeof mergeRequestFileDiffItemSchema>;
export type MergeRequestInfo = Schema.Schema.Type<typeof mergeRequestInfoSchema>;
export type MergeRequestListItem = Schema.Schema.Type<typeof mergeRequestListItemSchema>;
export type MergeRequestLog = Schema.Schema.Type<typeof mergeRequestLogSchema>;
export type MergeRequestMission = Schema.Schema.Type<typeof mergeRequestMissionSchema>;
export type MergeRequestUser = Schema.Schema.Type<typeof mergeRequestUserSchema>;