import { Schema } from "effect";

export const currentUserSchema = Schema.Struct({
  Avatar: Schema.optional(Schema.String),
  Email: Schema.optional(Schema.String),
  EmailValidation: Schema.optional(Schema.Number),
  GlobalKey: Schema.optional(Schema.String),
  Gravatar: Schema.optional(Schema.String),
  Id: Schema.Number,
  Name: Schema.optional(Schema.String),
  NamePinYin: Schema.optional(Schema.String),
  Phone: Schema.optional(Schema.String),
  PhoneRegionCode: Schema.optional(Schema.String),
  PhoneValidation: Schema.optional(Schema.Number),
  Region: Schema.optional(Schema.String),
  Status: Schema.optional(Schema.Number),
  TeamId: Schema.optional(Schema.Number),
});

export type CurrentUser = Schema.Schema.Type<typeof currentUserSchema>;