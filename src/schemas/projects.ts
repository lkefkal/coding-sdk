import { Schema } from "effect";

export const projectSchema = Schema.Struct({
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
  ProgramIds: Schema.optional(Schema.Array(Schema.Number)),
  StartDate: Schema.NullOr(Schema.Number),
  Status: Schema.NullOr(Schema.Number),
  TeamId: Schema.NullOr(Schema.Number),
  TeamOwnerId: Schema.NullOr(Schema.Number),
  Type: Schema.NullOr(Schema.Number),
  UpdatedAt: Schema.NullOr(Schema.Number),
  UserOwnerId: Schema.NullOr(Schema.Number),
});

export const projectsDataSchema = Schema.Struct({
  PageNumber: Schema.Number,
  PageSize: Schema.Number,
  ProjectList: Schema.NullOr(Schema.Array(projectSchema)),
  TotalCount: Schema.Number,
});

export const projectPolicySchema = Schema.Struct({
  PolicyAlias: Schema.String,
  PolicyId: Schema.Number,
  PolicyName: Schema.String,
});

export const projectPrincipalRespSchema = Schema.Struct({
  CreatedAt: Schema.Number,
  Policies: Schema.NullOr(Schema.Array(projectPolicySchema)),
  PrincipalId: Schema.String,
  PrincipalName: Schema.String,
  PrincipalType: Schema.String,
});

export const projectPrincipalDataSchema = Schema.Struct({
  PageNumber: Schema.Number,
  PageSize: Schema.Number,
  Principals: Schema.Array(projectPrincipalRespSchema),
  TotalCount: Schema.Number,
});

export const projectRoleSchema = Schema.Struct({
  RoleId: Schema.Number,
  RoleType: Schema.String,
  RoleTypeName: Schema.String,
});

export const projectMemberMemberRefSchema = Schema.Struct({
  Assignee: Schema.NullOr(Schema.Boolean),
  DepartmentId: Schema.NullOr(Schema.Number),
  DepartmentMemberId: Schema.NullOr(Schema.Number),
  DepartmentName: Schema.NullOr(Schema.String),
  DescribeId: Schema.NullOr(Schema.String),
  Pointer: Schema.NullOr(Schema.Boolean),
});

export const projectMemberDepartmentMemberSchema = Schema.Struct({
  RefId: Schema.NullOr(Schema.Number),
  Refs: Schema.NullOr(Schema.Array(projectMemberMemberRefSchema)),
  ThirdPartyAvatar: Schema.NullOr(Schema.String),
  ThirdPartyId: Schema.optional(Schema.String),
  ThirdPartyName: Schema.NullOr(Schema.String),
});

export const projectMemberUserDataSchema = Schema.Struct({
  Avatar: Schema.String,
  DepartmentMember: Schema.Struct({
    RefId: Schema.NullOr(Schema.Number),
    Refs: Schema.NullOr(Schema.Array(projectMemberMemberRefSchema)),
    ThirdPartyAvatar: Schema.NullOr(Schema.String),
    ThirdPartyId: Schema.optional(Schema.String),
    ThirdPartyName: Schema.NullOr(Schema.String),
  }),
  Email: Schema.String,
  EmailValidation: Schema.Number,
  GlobalKey: Schema.String,
  Id: Schema.Number,
  Name: Schema.String,
  NamePinYin: Schema.String,
  Phone: Schema.String,
  PhoneValidation: Schema.Number,
  Roles: Schema.Array(projectRoleSchema),
  Status: Schema.Number,
  TeamId: Schema.Number,
  UniqueExtField: Schema.String,
});

export const projectMemberDataSchema = Schema.Struct({
  PageNumber: Schema.Number,
  PageSize: Schema.Number,
  ProjectMembers: Schema.Array(projectMemberUserDataSchema),
  TotalCount: Schema.Number,
});

export const codingCIProjectDepotSchema = Schema.Struct({
  Authorized: Schema.NullOr(Schema.Boolean),
  DepotHttpsUrl: Schema.NullOr(Schema.String),
  DepotSshUrl: Schema.NullOr(Schema.String),
  DepotType: Schema.String,
  Id: Schema.Number,
  IsDefault: Schema.Boolean,
  Name: Schema.String,
  OpenModule: Schema.String,
});

export const describeProjectDepotsDataSchema = Schema.Struct({
  DepotList: Schema.Array(codingCIProjectDepotSchema),
  IsBound: Schema.Boolean,
});

export const projectCredentialSchema = Schema.Struct({
  CredentialId: Schema.String,
  Name: Schema.String,
});

export const describeProjectCredentialsDataSchema = Schema.Struct({
  CredentialList: Schema.Array(projectCredentialSchema),
});

export type Project = Schema.Schema.Type<typeof projectSchema>;
export type ProjectsData = Schema.Schema.Type<typeof projectsDataSchema>;
export type CodingCIProjectDepot = Schema.Schema.Type<typeof codingCIProjectDepotSchema>;
export type DescribeProjectCredentialsData = Schema.Schema.Type<typeof describeProjectCredentialsDataSchema>;
export type DescribeProjectDepotsData = Schema.Schema.Type<typeof describeProjectDepotsDataSchema>;
export type ProjectCredential = Schema.Schema.Type<typeof projectCredentialSchema>;
export type ProjectMemberData = Schema.Schema.Type<typeof projectMemberDataSchema>;
export type ProjectMemberDepartmentMember = Schema.Schema.Type<typeof projectMemberDepartmentMemberSchema>;
export type ProjectMemberMemberRef = Schema.Schema.Type<typeof projectMemberMemberRefSchema>;
export type ProjectMemberUserData = Schema.Schema.Type<typeof projectMemberUserDataSchema>;
export type ProjectPolicy = Schema.Schema.Type<typeof projectPolicySchema>;
export type ProjectPrincipalData = Schema.Schema.Type<typeof projectPrincipalDataSchema>;
export type ProjectPrincipalResp = Schema.Schema.Type<typeof projectPrincipalRespSchema>;
export type ProjectRole = Schema.Schema.Type<typeof projectRoleSchema>;