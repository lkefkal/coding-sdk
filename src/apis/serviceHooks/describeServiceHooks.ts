import { Schema } from "effect";

import type { CodingClient, InvokeOptions } from "../../client/types.js";
import { defineActionSpec } from "../../core/actionSpec.js";
import { serviceHookPageSchema } from "../../schemas/serviceHooks.js";

export const action = "DescribeServiceHooks";

export const requestSchema = Schema.Struct({
  CreatorBy: Schema.optional(Schema.Array(Schema.Number)),
  Enabled: Schema.optional(Schema.String),
  Event: Schema.optional(
    Schema.Literal(
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
    ),
  ),
  Name: Schema.optional(Schema.String),
  PageNumber: Schema.Number,
  PageSize: Schema.Number,
  ProjectId: Schema.Number,
  Service: Schema.optional(
    Schema.Literal("WebHook", "WeCom", "DingDing", "Jenkins", "FeiShu"),
  ),
  Status: Schema.optional(Schema.Literal("SUCCESS", "FAILURE")),
  TargetType: Schema.Literal("PROJECT", "SPACE_NODE", "PROGRAM"),
});

export const responseSchema = Schema.Struct({
  Data: serviceHookPageSchema,
  RequestId: Schema.String,
});

export type DescribeServiceHooksRequest = Schema.Schema.Type<typeof requestSchema>;

export type DescribeServiceHooksResponse = Schema.Schema.Type<typeof responseSchema>;

export const describeServiceHooksSpec = defineActionSpec({
  action,
  actionPlacement: "body",
  requestSchema,
  responseSchema,
  summary: "Service Hook 列表分页查询",
});

/**
 * 查询 Service Hook 列表，并返回经过 schema 解码后的分页结果。
 *
 * @param client 共享上下文客户端。
 * @param input 当前 action 的请求参数。
 * @param options 本次调用的局部覆盖配置。
 * @returns 解码后的 Service Hook 列表响应。
 */
export async function describeServiceHooks(
  client: CodingClient,
  input: DescribeServiceHooksRequest,
  options?: InvokeOptions,
): Promise<DescribeServiceHooksResponse> {
  return client.invoke(describeServiceHooksSpec, input, options);
}