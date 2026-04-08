import { Schema } from "effect";

import type { CodingClient, InvokeOptions } from "../../client/types.js";
import { defineActionSpec } from "../../core/actionSpec.js";
import { customFieldChangeLogSchema } from "../../schemas/issues.js";

export const action = "DescribeIssueCustomFieldLogList";

export const requestSchema = Schema.Struct({
  FieldName: Schema.String,
  IssueCode: Schema.Number,
  ProjectName: Schema.String,
});

export const responseSchema = Schema.Struct({
  FieldChangeLogList: Schema.optional(Schema.Array(customFieldChangeLogSchema)),
  RequestId: Schema.String,
});

export type DescribeIssueCustomFieldLogListRequest = Schema.Schema.Type<typeof requestSchema>;

export type DescribeIssueCustomFieldLogListResponse = Schema.Schema.Type<typeof responseSchema>;

export const describeIssueCustomFieldLogListSpec = defineActionSpec({
  action,
  actionPlacement: "body",
  requestSchema,
  responseSchema,
  summary: "事项的自定义属性变更日志查询",
});

/**
 * 查询事项自定义属性变更日志列表。
 *
 * @param client 共享上下文客户端。
 * @param input 当前 action 的请求参数。
 * @param options 本次调用的局部覆盖配置。
 * @returns 解码后的事项自定义属性变更日志响应。
 */
export async function describeIssueCustomFieldLogList(
  client: CodingClient,
  input: DescribeIssueCustomFieldLogListRequest,
  options?: InvokeOptions,
): Promise<DescribeIssueCustomFieldLogListResponse> {
  return client.invoke(describeIssueCustomFieldLogListSpec, input, options);
}