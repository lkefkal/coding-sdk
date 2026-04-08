import { Schema } from "effect";

import type { CodingClient, InvokeOptions } from "../../client/types.js";
import { defineActionSpec } from "../../core/actionSpec.js";
import { projectSchema } from "../../schemas/projects.js";

export const action = "DescribeProjectByName";

export const requestSchema = Schema.Struct({
  ProjectName: Schema.String,
});

export const responseSchema = Schema.Struct({
  Project: Schema.NullOr(projectSchema),
  RequestId: Schema.String,
});

export type DescribeProjectByNameRequest = Schema.Schema.Type<typeof requestSchema>;
export type DescribeProjectByNameResponse = Schema.Schema.Type<typeof responseSchema>;

export const describeProjectByNameSpec = defineActionSpec({
  action,
  actionPlacement: "body",
  requestSchema,
  responseSchema,
  summary: "项目-通过项目名称查询项目",
});

/**
 * 通过项目名称查询项目详情。
 *
 * @param client 共享上下文客户端。
 * @param input 当前 action 的请求参数。
 * @param options 本次调用的局部覆盖配置。
 * @returns 解码后的项目详情响应。
 */
export async function describeProjectByName(
  client: CodingClient,
  input: DescribeProjectByNameRequest,
  options?: InvokeOptions,
): Promise<DescribeProjectByNameResponse> {
  return client.invoke(describeProjectByNameSpec, input, options);
}