import { Schema } from "effect";

import type { CodingClient, InvokeOptions } from "../../client/types.js";
import { defineActionSpec } from "../../core/actionSpec.js";
import { mergeRequestLogSchema } from "../../schemas/mergeRequests.js";

export const action = "DescribeMergeRequestLog";

export const requestSchema = Schema.Struct({
  DepotId: Schema.Number,
  DepotPath: Schema.optional(Schema.String),
  MergeId: Schema.Number,
});

export const responseSchema = Schema.Struct({
  Logs: Schema.Array(mergeRequestLogSchema),
  RequestId: Schema.String,
});

export type DescribeMergeRequestLogRequest = Schema.Schema.Type<typeof requestSchema>;

export type DescribeMergeRequestLogResponse = Schema.Schema.Type<typeof responseSchema>;

export const describeMergeRequestLogSpec = defineActionSpec({
  action,
  actionPlacement: "body",
  requestSchema,
  responseSchema,
  summary: "合并请求-查询合并请求操作记录",
});

/**
 * 查询合并请求操作日志。
 *
 * @param client 共享上下文客户端。
 * @param input 当前 action 的请求参数。
 * @param options 本次调用的局部覆盖配置。
 * @returns 解码后的合并请求操作日志响应。
 */
export async function describeMergeRequestLog(
  client: CodingClient,
  input: DescribeMergeRequestLogRequest,
  options?: InvokeOptions,
): Promise<DescribeMergeRequestLogResponse> {
  return client.invoke(describeMergeRequestLogSpec, input, options);
}