import { Schema } from "effect";

import type { CodingClient, InvokeOptions } from "../../client/types.js";
import { defineActionSpec } from "../../core/actionSpec.js";
import {
  serviceHookOperationResultSchema,
  serviceHookTargetTypeSchema,
} from "../../schemas/serviceHooks.js";

export const action = "PingServiceHook";

export const requestSchema = Schema.Struct({
  Id: Schema.Array(Schema.String),
  ProjectId: Schema.Number,
  TargetType: Schema.optional(serviceHookTargetTypeSchema),
});

export const responseSchema = serviceHookOperationResultSchema;

export type PingServiceHookRequest = Schema.Schema.Type<typeof requestSchema>;

export type PingServiceHookResponse = Schema.Schema.Type<typeof responseSchema>;

export const pingServiceHookSpec = defineActionSpec({
  action,
  actionPlacement: "body",
  requestSchema,
  responseSchema,
  summary: "Service Hook 测试",
});

/**
 * 触发指定 Service Hook 的测试发送。
 *
 * @param client 共享上下文客户端。
 * @param input 当前 action 的请求参数。
 * @param options 本次调用的局部覆盖配置。
 * @returns 解码后的测试结果响应。
 */
export async function pingServiceHook(
  client: CodingClient,
  input: PingServiceHookRequest,
  options?: InvokeOptions,
): Promise<PingServiceHookResponse> {
  return client.invoke(pingServiceHookSpec, input, options);
}