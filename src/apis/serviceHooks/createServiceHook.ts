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

export const action = "CreateServiceHook";

export const requestSchema = Schema.Struct({
  ActionProperty: Schema.String,
  Enabled: Schema.Boolean,
  Event: Schema.Array(serviceHookEventNameSchema),
  FilterProperty: Schema.optional(Schema.String),
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

export type CreateServiceHookRequest = Schema.Schema.Type<typeof requestSchema>;

export type CreateServiceHookResponse = Schema.Schema.Type<typeof responseSchema>;

export const createServiceHookSpec = defineActionSpec({
  action,
  actionPlacement: "body",
  requestSchema,
  responseSchema,
  summary: "Service Hook 创建",
});

/**
 * 创建新的 Service Hook。
 *
 * @param client 共享上下文客户端。
 * @param input 当前 action 的请求参数。
 * @param options 本次调用的局部覆盖配置。
 * @returns 解码后的 Service Hook 创建结果。
 */
export async function createServiceHook(
  client: CodingClient,
  input: CreateServiceHookRequest,
  options?: InvokeOptions,
): Promise<CreateServiceHookResponse> {
  return client.invoke(createServiceHookSpec, input, options);
}