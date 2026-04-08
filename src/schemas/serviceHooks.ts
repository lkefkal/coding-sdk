import { Schema } from "effect";

/**
 * 表示 Service Hook 目标类型的共享 schema。
 */
export const serviceHookTargetTypeSchema = Schema.Literal(
  "PROJECT",
  "SPACE_NODE",
  "PROGRAM",
);

export type ServiceHookTargetType = Schema.Schema.Type<
  typeof serviceHookTargetTypeSchema
>;

/**
 * 表示 Service Hook 服务类型的共享 schema。
 */
export const serviceHookServiceSchema = Schema.Literal(
  "WebHook",
  "WeCom",
  "DingDing",
  "Jenkins",
  "FeiShu",
);

export type ServiceHookService = Schema.Schema.Type<typeof serviceHookServiceSchema>;

/**
 * 表示 Service Hook 发送方式的共享 schema。
 */
export const serviceHookServiceActionSchema = Schema.Literal(
  "dingding_group_chat_robot",
  "wecom_group_chat_robot",
  "jenkins_generic_build_job",
  "feishu_group_chat_robot",
  "webhook_http_post",
  "webhook_http_get",
);

export type ServiceHookServiceAction = Schema.Schema.Type<
  typeof serviceHookServiceActionSchema
>;

/**
 * 表示 Service Hook 事件名的共享 schema。
 */
export const serviceHookEventNameSchema = Schema.Literal(
  "ITERATION_CREATED",
  "ITERATION_DELETED",
  "ITERATION_UPDATED",
  "ISSUE_CREATED",
  "ISSUE_DELETED",
  "ISSUE_COMMENT_CREATED",
  "ISSUE_STATUS_UPDATED",
  "ISSUE_ASSIGNEE_CHANGED",
  "ISSUE_ITERATION_CHANGED",
  "ISSUE_RELATIONSHIP_CHANGED",
  "ISSUE_UPDATED",
  "GIT_PUSHED",
  "GIT_MR_CREATED",
  "GIT_MR_MERGED",
  "GIT_MR_UPDATED",
  "GIT_MR_MERGED",
  "GIT_MR_CLOSED",
  "ARTIFACTS_VERSION_CREATED",
  "ARTIFACTS_VERSION_UPDATED",
  "ARTIFACTS_VERSION_DOWNLOADED",
  "ARTIFACTS_VERSION_DELETED",
  "ARTIFACTS_VERSION_RELEASED",
  "ARTIFACTS_VERSION_DOWNLOAD_FORBIDDEN",
  "ARTIFACTS_VERSION_DOWNLOAD_ALLOWED",
  "ARTIFACTS_VERSION_DOWNLOAD_BLOCKED",
  "FILE_CREATED",
  "FILE_UPDATED",
  "FILE_RENAMED",
  "FILE_SHARE_UPDATED",
  "FILE_MOVED",
  "FILE_COPIED",
  "FILE_MOVED_TO_RECYCLE_BIN",
  "FILE_RESTORED_FROM_RECYCLE_BIN",
  "FILE_DELETED",
  "WIKI_CREATED",
  "WIKI_UPDATED",
  "WIKI_MOVED",
  "WIKI_SHARE_UPDATED",
  "WIKI_ACCESS_UPDATED",
  "WIKI_COPIED",
  "WIKI_MOVED_TO_RECYCLE_BIN",
  "WIKI_RESTORED_FROM_RECYCLE_BIN",
  "WIKI_DELETED",
  "MEMBER_CREATED",
  "MEMBER_DELETED",
  "MEMBER_ROLE_UPDATED",
  "TEST_PLAN_CREATED",
  "TEST_PLAN_UPDATED",
  "TEST_PLAN_FINISHED",
  "TEST_TASK_ASSIGNED",
  "TEST_REPORT_CREATED",
  "FLEXIBLE_TESTX_REVIEW_CREATED",
  "FLEXIBLE_TESTX_REVIEW_COMMENTED",
  "FLEXIBLE_TESTX_REVIEW_UPDATED",
  "FLEXIBLE_TESTX_REVIEW_COMPLETED",
  "FLEXIBLE_TESTX_PLAN_CREATED",
  "FLEXIBLE_TESTX_PLAN_TASK_ASSIGNED",
  "FLEXIBLE_TESTX_PLAN_UPDATED",
  "FLEXIBLE_TESTX_PLAN_FINISHED",
  "FLEXIBLE_TESTX_REPORT_CREATED",
  "CODE_DOG_CREATE_JOB",
  "CODE_DOG_RESULT_NOTIFY",
  "PLAN_CREATED",
  "PLAN_DELETED",
  "PLAN_COMMENT_CREATED",
  "PLAN_STATUE_CHANGED",
  "PLAN_ASSIGNEE_CHANGED",
  "PLAN_UPDATED",
  "RISK_CREATED",
  "RISK_DELETED",
  "RISK_COMMENT_CREATED",
  "RISK_STATUS_CHANGED",
  "RISK_ASSIGNEE_CHANGED",
  "RISK_UPDATED",
);

export type ServiceHookEventName = Schema.Schema.Type<
  typeof serviceHookEventNameSchema
>;

/**
 * 表示 Service Hook 通用布尔操作结果的共享 schema。
 */
export const serviceHookOperationResultSchema = Schema.Struct({
  RequestId: Schema.String,
  Succeed: Schema.Boolean,
});

export type ServiceHookOperationResult = Schema.Schema.Type<
  typeof serviceHookOperationResultSchema
>;

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
  Service: serviceHookServiceSchema,
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