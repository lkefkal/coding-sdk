import { Schema } from "effect";

import type { CodingClient, InvokeOptions } from "../../client/types.js";
import { defineActionSpec } from "../../core/actionSpec.js";

export const action = "EnabledServiceHook";

export const requestSchema = Schema.Struct({
  Enabled: Schema.Boolean,
  Id: Schema.Array(Schema.String),
  ProjectId: Schema.Number,
  TargetType: Schema.Literal("PROJECT", "SPACE_NODE", "PROGRAM"),
});

export const responseSchema = Schema.Struct({
  RequestId: Schema.String,
  Succeed: Schema.Boolean,
});

export type EnabledServiceHookRequest = Schema.Schema.Type<typeof requestSchema>;

export type EnabledServiceHookResponse = Schema.Schema.Type<typeof responseSchema>;

export const enabledServiceHookSpec = defineActionSpec({
  action,
  actionPlacement: "body",
  requestSchema,
  responseSchema,
  summary: "Service Hook 事件开关",
});

/**
 * 批量开启或关闭指定的 Service Hook。
 *
 * @param client 共享上下文客户端。
 * @param input 当前 action 的请求参数。
 * @param options 本次调用的局部覆盖配置。
 * @returns 解码后的开关结果响应。
 */
export async function enabledServiceHook(
  client: CodingClient,
  input: EnabledServiceHookRequest,
  options?: InvokeOptions,
): Promise<EnabledServiceHookResponse> {
  return client.invoke(enabledServiceHookSpec, input, options);
}