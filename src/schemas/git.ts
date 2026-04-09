import { Schema } from "effect";

export const gitCommitterSchema = Schema.Struct({
  Email: Schema.String,
  Name: Schema.String,
});

export const gitCommitSchema = Schema.Struct({
  AuthorEmail: Schema.String,
  AuthorName: Schema.String,
  CommitDate: Schema.Number,
  Committer: gitCommitterSchema,
  CreatedAt: Schema.Number,
  Parents: Schema.Array(Schema.String),
  Sha: Schema.String,
  ShortMessage: Schema.String,
});

export const gitDetailedCommitSchema = Schema.Struct({
  Author: gitCommitterSchema,
  AuthorEmail: Schema.String,
  AuthorName: Schema.String,
  CommitDate: Schema.Number,
  Committer: gitCommitterSchema,
  CreatedAt: Schema.Number,
  FullMessage: Schema.String,
  Parents: Schema.NullOr(Schema.Array(Schema.String)),
  Sha: Schema.String,
  ShortMessage: Schema.String,
});

export const gitPageInfoSchema = Schema.Struct({
  PageNumber: Schema.NullOr(Schema.Number),
  PageSize: Schema.NullOr(Schema.Number),
  TotalPage: Schema.NullOr(Schema.Number),
  TotalRow: Schema.NullOr(Schema.Number),
});

export const gitCommitDataSchema = Schema.Struct({
  Commits: Schema.NullOr(Schema.Array(gitDetailedCommitSchema)),
  Page: Schema.NullOr(gitPageInfoSchema),
});

export const gitCommitFilePathSchema = Schema.Struct({
  NewPath: Schema.NullOr(Schema.String),
  Path: Schema.NullOr(Schema.String),
  Type: Schema.NullOr(Schema.String),
});

export const gitBranchInfoSchema = Schema.Struct({
  BranchName: Schema.String,
  DenyForcePush: Schema.optional(Schema.NullOr(Schema.Boolean)),
  ForceSquash: Schema.optional(Schema.NullOr(Schema.Boolean)),
  IsDefaultBranch: Schema.Boolean,
  IsProtected: Schema.Boolean,
  IsReadOnly: Schema.optional(Schema.NullOr(Schema.Boolean)),
  LastCommitDate: Schema.optional(Schema.NullOr(Schema.Number)),
  Sha: Schema.String,
  SpecBranchType: Schema.optional(Schema.NullOr(Schema.String)),
});

export const gitBranchesDataSchema = Schema.Struct({
  Branches: Schema.Array(gitBranchInfoSchema),
  TotalCount: Schema.Number,
});

export const gitBranchSchema = Schema.Struct({
  BranchName: Schema.String,
  Content: Schema.optional(Schema.String),
  IsDefaultBranch: Schema.Boolean,
  IsProtected: Schema.Boolean,
  LastCommit: gitCommitSchema,
  Sha: Schema.String,
});

export const gitRefInfoSchema = Schema.Struct({
  Ref: Schema.String,
});

export const gitRefSchema = Schema.Struct({
  AnnotatedTag: Schema.Boolean,
  DisplayName: Schema.String,
  FullMessage: Schema.String,
  Name: Schema.String,
  ObjectId: Schema.String,
  RefObjectId: Schema.String,
  ShortMessage: Schema.String,
});

export const codingCIDepotDetailSchema = Schema.Struct({
  Name: Schema.String,
  Sha: Schema.String,
});

export const gitFileContentSchema = Schema.Struct({
  Content: Schema.String,
  IsLargeFileStorage: Schema.Boolean,
  IsLfs: Schema.Boolean,
  IsText: Schema.Boolean,
});

export const gitBlobDetailSchema = Schema.Struct({
  BlobSha: Schema.NullOr(Schema.String),
  Content: Schema.NullOr(Schema.String),
  Encoding: Schema.NullOr(Schema.String),
  Size: Schema.NullOr(Schema.Number),
});

export const gitTreeItemSchema = Schema.Struct({
  Mode: Schema.String,
  Name: Schema.String,
  Path: Schema.String,
  Sha: Schema.String,
});

export const gitFileStatPayloadSchema = Schema.Struct({
  IsExist: Schema.Boolean,
});

export const gitFileItemSchema = Schema.Struct({
  Content: Schema.NullOr(Schema.String),
  ContentSha256: Schema.NullOr(Schema.String),
  Encoding: Schema.String,
  FileName: Schema.String,
  FilePath: Schema.String,
  Sha: Schema.String,
  Size: Schema.Number,
});

export const depotDetailDataSchema = Schema.Struct({
  DepotDetailList: Schema.Array(codingCIDepotDetailSchema),
});

export const gitTreeSchema = Schema.Struct({
  Mode: Schema.NullOr(Schema.String),
  Path: Schema.NullOr(Schema.String),
  Sha: Schema.NullOr(Schema.String),
  Type: Schema.NullOr(Schema.String),
});

export const gitAllTagCommitSchema = Schema.Struct({
  AuthorEmail: Schema.NullOr(Schema.String),
  AuthorName: Schema.NullOr(Schema.String),
  CommitDate: Schema.NullOr(Schema.Number),
  CommitterEmail: Schema.NullOr(Schema.String),
  CommitterName: Schema.NullOr(Schema.String),
  CreatedAt: Schema.NullOr(Schema.Number),
  Parents: Schema.NullOr(Schema.Array(Schema.String)),
  Sha: Schema.NullOr(Schema.String),
  ShortMessage: Schema.NullOr(Schema.String),
});

export const gitTagSchema = Schema.Struct({
  Commit: gitAllTagCommitSchema,
  Message: Schema.String,
  TagName: Schema.String,
});

export type CodingCIDepotDetail = Schema.Schema.Type<typeof codingCIDepotDetailSchema>;
export type DepotDetailData = Schema.Schema.Type<typeof depotDetailDataSchema>;
export type GitAllTagCommit = Schema.Schema.Type<typeof gitAllTagCommitSchema>;
export type GitBranch = Schema.Schema.Type<typeof gitBranchSchema>;
export type GitBranchInfo = Schema.Schema.Type<typeof gitBranchInfoSchema>;
export type GitBranchesData = Schema.Schema.Type<typeof gitBranchesDataSchema>;
export type GitBlobDetail = Schema.Schema.Type<typeof gitBlobDetailSchema>;
export type GitCommit = Schema.Schema.Type<typeof gitCommitSchema>;
export type GitCommitData = Schema.Schema.Type<typeof gitCommitDataSchema>;
export type GitCommitFilePath = Schema.Schema.Type<typeof gitCommitFilePathSchema>;
export type GitCommitter = Schema.Schema.Type<typeof gitCommitterSchema>;
export type GitDetailedCommit = Schema.Schema.Type<typeof gitDetailedCommitSchema>;
export type GitFileContent = Schema.Schema.Type<typeof gitFileContentSchema>;
export type GitFileItem = Schema.Schema.Type<typeof gitFileItemSchema>;
export type GitFileStatPayload = Schema.Schema.Type<typeof gitFileStatPayloadSchema>;
export type GitPageInfo = Schema.Schema.Type<typeof gitPageInfoSchema>;
export type GitRef = Schema.Schema.Type<typeof gitRefSchema>;
export type GitRefInfo = Schema.Schema.Type<typeof gitRefInfoSchema>;
export type GitTag = Schema.Schema.Type<typeof gitTagSchema>;
export type GitTree = Schema.Schema.Type<typeof gitTreeSchema>;
export type GitTreeItem = Schema.Schema.Type<typeof gitTreeItemSchema>;