import { Schema } from "effect";

import type { CodingClient, InvokeOptions } from "../../client/types.js";
import { defineActionSpec } from "../../core/actionSpec.js";
import {
  serviceHookOperationResultSchema,
  serviceHookTargetTypeSchema,
} from "../../schemas/serviceHooks.js";

export const action = "DeleteServiceHook";

export const requestSchema = Schema.Struct({
  Id: Schema.Array(Schema.String),
  ProjectId: Schema.Number,
  TargetType: Schema.optional(serviceHookTargetTypeSchema),
});

export const responseSchema = serviceHookOperationResultSchema;

export type DeleteServiceHookRequest = Schema.Schema.Type<typeof requestSchema>;

export type DeleteServiceHookResponse = Schema.Schema.Type<typeof responseSchema>;

export const deleteServiceHookSpec = defineActionSpec({
  action,
  actionPlacement: "body",
  requestSchema,
  responseSchema,
  summary: "Service Hook 删除",
});

/**
 * 批量删除指定的 Service Hook。
 *
 * @param client 共享上下文客户端。
 * @param input 当前 action 的请求参数。
 * @param options 本次调用的局部覆盖配置。
 * @returns 解码后的删除结果响应。
 */
export async function deleteServiceHook(
  client: CodingClient,
  input: DeleteServiceHookRequest,
  options?: InvokeOptions,
): Promise<DeleteServiceHookResponse> {
  return client.invoke(deleteServiceHookSpec, input, options);
}