import { Schema } from "effect";

import type { CodingClient, InvokeOptions } from "../../client/types.js";
import { defineActionSpec } from "../../core/actionSpec.js";
import { serviceHookEventSchema } from "../../schemas/serviceHooks.js";

export const action = "DescribeEvents";

export const requestSchema = Schema.Struct({});

export const responseSchema = Schema.Struct({
  Event: Schema.Array(serviceHookEventSchema),
  RequestId: Schema.String,
});

export type DescribeEventsRequest = Schema.Schema.Type<typeof requestSchema>;

export type DescribeEventsResponse = Schema.Schema.Type<typeof responseSchema>;

export const describeEventsSpec = defineActionSpec({
  action,
  actionPlacement: "body",
  requestSchema,
  responseSchema,
  summary: "Service Hook 事件列表查询",
});

/**
 * 查询 Service Hook 事件列表。
 *
 * @param client 共享上下文客户端。
 * @param input 当前 action 的请求参数。
 * @param options 本次调用的局部覆盖配置。
 * @returns 解码后的 Service Hook 事件列表响应。
 */
export async function describeEvents(
  client: CodingClient,
  input: DescribeEventsRequest,
  options?: InvokeOptions,
): Promise<DescribeEventsResponse> {
  return client.invoke(describeEventsSpec, input, options);
}