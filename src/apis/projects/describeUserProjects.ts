import { Schema } from "effect";

import type { CodingClient, InvokeOptions } from "../../client/types.js";
import { defineActionSpec } from "../../core/actionSpec.js";
import { projectSchema } from "../../schemas/projects.js";

export const action = "DescribeUserProjects";

export const requestSchema = Schema.Struct({
  ProjectName: Schema.optional(Schema.String),
  UserId: Schema.Number,
});

export const responseSchema = Schema.Struct({
  ProjectList: Schema.NullOr(Schema.Array(projectSchema)),
  RequestId: Schema.String,
});

export type DescribeUserProjectsRequest = Schema.Schema.Type<typeof requestSchema>;
export type DescribeUserProjectsResponse = Schema.Schema.Type<typeof responseSchema>;

export const describeUserProjectsSpec = defineActionSpec({
  action,
  actionPlacement: "body",
  requestSchema,
  responseSchema,
  summary: "项目-已加入项目列表查询",
});

/**
 * 查询指定用户已加入的项目列表。
 *
 * @param client 共享上下文客户端。
 * @param input 当前 action 的请求参数。
 * @param options 本次调用的局部覆盖配置。
 * @returns 解码后的项目列表响应。
 */
export async function describeUserProjects(
  client: CodingClient,
  input: DescribeUserProjectsRequest,
  options?: InvokeOptions,
): Promise<DescribeUserProjectsResponse> {
  return client.invoke(describeUserProjectsSpec, input, options);
}