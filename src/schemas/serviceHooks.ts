import { Schema } from "effect";

/**
 * 表示 Service Hook 事件项的共享 schema。
 */
export const serviceHookEventSchema = Schema.Struct({
  GroupLabel: Schema.String,
  GroupName: Schema.String,
  Label: Schema.String,
  Name: Schema.String,
});

export type ServiceHookEvent = Schema.Schema.Type<typeof serviceHookEventSchema>;

/**
 * 表示 Service Hook 关联用户的共享 schema。
 */
export const serviceHookUserSchema = Schema.Struct({
  Avatar: Schema.String,
  Id: Schema.Number,
  Name: Schema.String,
  NamePinyin: Schema.String,
});

export type ServiceHookUser = Schema.Schema.Type<typeof serviceHookUserSchema>;

/**
 * 表示单个 Service Hook 项的共享 schema。
 */
export const serviceHookSchema = Schema.Struct({
  Action: Schema.String,
  ActionLabel: Schema.String,
  ActionProperties: Schema.String,
  CreatedAt: Schema.Number,
  CreatorBy: Schema.Number,
  CreatorByUser: serviceHookUserSchema,
  Enabled: Schema.Boolean,
  Event: Schema.Array(Schema.String),
  EventLabel: Schema.Array(Schema.String),
  FilterProperties: Schema.String,
  Id: Schema.String,
  LastSucceedAt: Schema.Number,
  Name: Schema.String,
  Service: Schema.String,
  ServiceName: Schema.String,
  Status: Schema.Number,
  TargetId: Schema.Number,
  TargetType: Schema.String,
  UpdatedAt: Schema.Number,
  UpdatedBy: Schema.Number,
  UpdatedByUser: serviceHookUserSchema,
  Version: Schema.Number,
});

export type ServiceHook = Schema.Schema.Type<typeof serviceHookSchema>;

/**
 * 表示单条 Service Hook 发送记录的共享 schema。
 */
export const serviceHookLogSchema = Schema.Struct({
  CreatedAt: Schema.NullOr(Schema.Number),
  Event: Schema.NullOr(Schema.String),
  Id: Schema.String,
  RequestContent: Schema.NullOr(Schema.String),
  RequestHeaders: Schema.NullOr(Schema.String),
  RequestId: Schema.NullOr(Schema.String),
  ResponseAt: Schema.NullOr(Schema.Number),
  ResponseBody: Schema.NullOr(Schema.String),
  ResponseHeaders: Schema.NullOr(Schema.String),
  ResponseStatus: Schema.NullOr(Schema.Number),
  SendAt: Schema.NullOr(Schema.Number),
  ServiceHookId: Schema.NullOr(Schema.String),
  Status: Schema.NullOr(Schema.Number),
});

export type ServiceHookLog = Schema.Schema.Type<typeof serviceHookLogSchema>;

/**
 * 表示 Service Hook 分页结果的共享 schema。
 */
export const serviceHookPageSchema = Schema.Struct({
  PageNumber: Schema.Number,
  PageSize: Schema.Number,
  ServiceHook: Schema.Array(serviceHookSchema),
  TotalCount: Schema.Number,
});

export type ServiceHookPage = Schema.Schema.Type<typeof serviceHookPageSchema>;

/**
 * 表示 Service Hook 发送记录分页结果的共享 schema。
 */
export const serviceHookLogPageSchema = Schema.Struct({
  Log: Schema.Array(serviceHookLogSchema),
  PageNumber: Schema.Number,
  PageSize: Schema.Number,
  TotalCount: Schema.Number,
});

export type ServiceHookLogPage = Schema.Schema.Type<typeof serviceHookLogPageSchema>;