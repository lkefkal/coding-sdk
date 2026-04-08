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

export type Project = Schema.Schema.Type<typeof projectSchema>;
export type ProjectsData = Schema.Schema.Type<typeof projectsDataSchema>;