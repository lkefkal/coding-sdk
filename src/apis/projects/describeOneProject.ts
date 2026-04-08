import { Schema } from "effect";

import type { CodingClient, InvokeOptions } from "../../client/types.js";
import { defineActionSpec } from "../../core/actionSpec.js";
import { projectSchema } from "../../schemas/projects.js";

export const action = "DescribeOneProject";

export const requestSchema = Schema.Struct({
  ProjectId: Schema.Number,
});

export const responseSchema = Schema.Struct({
  Project: Schema.NullOr(projectSchema),
  RequestId: Schema.String,
});

export type DescribeOneProjectRequest = Schema.Schema.Type<typeof requestSchema>;
export type DescribeOneProjectResponse = Schema.Schema.Type<typeof responseSchema>;

export const describeOneProjectSpec = defineActionSpec({
  action,
  actionPlacement: "body",
  requestSchema,
  responseSchema,
  summary: "项目-单个项目查询",
});

/**
 * 通过项目编号查询单个项目详情。
 *
 * @param client 共享上下文客户端。
 * @param input 当前 action 的请求参数。
 * @param options 本次调用的局部覆盖配置。
 * @returns 解码后的项目详情响应。
 */
export async function describeOneProject(
  client: CodingClient,
  input: DescribeOneProjectRequest,
  options?: InvokeOptions,
): Promise<DescribeOneProjectResponse> {
  return client.invoke(describeOneProjectSpec, input, options);
}