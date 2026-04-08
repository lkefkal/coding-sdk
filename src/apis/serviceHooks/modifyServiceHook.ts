import { Schema } from "effect";

import type { CodingClient, InvokeOptions } from "../../client/types.js";
import { defineActionSpec } from "../../core/actionSpec.js";
import {
  serviceHookEventNameSchema,
  serviceHookSchema,
  serviceHookServiceActionSchema,
  serviceHookServiceSchema,
  serviceHookTargetTypeSchema,
} from "../../schemas/serviceHooks.js";

export const action = "ModifyServiceHook";

export const requestSchema = Schema.Struct({
  ActionProperty: Schema.String,
  Enabled: Schema.Boolean,
  Event: Schema.Array(serviceHookEventNameSchema),
  FilterProperty: Schema.String,
  Id: Schema.String,
  Name: Schema.optional(Schema.String),
  ProjectId: Schema.Number,
  Service: serviceHookServiceSchema,
  ServiceAction: serviceHookServiceActionSchema,
  TargetType: Schema.optional(serviceHookTargetTypeSchema),
});

export const responseSchema = Schema.Struct({
  RequestId: Schema.String,
  ServiceHook: serviceHookSchema,
});

export type ModifyServiceHookRequest = Schema.Schema.Type<typeof requestSchema>;

export type ModifyServiceHookResponse = Schema.Schema.Type<typeof responseSchema>;

export const modifyServiceHookSpec = defineActionSpec({
  action,
  actionPlacement: "body",
  requestSchema,
  responseSchema,
  summary: "Service Hook 修改",
});

/**
 * 修改单个 Service Hook 配置。
 *
 * @param client 共享上下文客户端。
 * @param input 当前 action 的请求参数。
 * @param options 本次调用的局部覆盖配置。
 * @returns 解码后的 Service Hook 修改结果。
 */
export async function modifyServiceHook(
  client: CodingClient,
  input: ModifyServiceHookRequest,
  options?: InvokeOptions,
): Promise<ModifyServiceHookResponse> {
  return client.invoke(modifyServiceHookSpec, input, options);
}