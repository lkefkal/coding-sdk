import { Schema } from "effect";

import type { CodingClient, InvokeOptions } from "../../client/types.js";
import { defineActionSpec } from "../../core/actionSpec.js";
import { projectsDataSchema } from "../../schemas/projects.js";

export const action = "DescribeCodingProjects";

export const requestSchema = Schema.Struct({
  PageNumber: Schema.Number,
  PageSize: Schema.Number,
  ProjectName: Schema.optional(Schema.String),
});

export const responseSchema = Schema.Struct({
  Data: Schema.NullOr(projectsDataSchema),
  RequestId: Schema.String,
});

export type DescribeCodingProjectsRequest = Schema.Schema.Type<typeof requestSchema>;
export type DescribeCodingProjectsResponse = Schema.Schema.Type<typeof responseSchema>;

export const describeCodingProjectsSpec = defineActionSpec({
  action,
  actionPlacement: "body",
  requestSchema,
  responseSchema,
  summary: "项目-项目列表查询",
});

/**
 * 查询团队内项目分页列表。
 *
 * @param client 共享上下文客户端。
 * @param input 当前 action 的请求参数。
 * @param options 本次调用的局部覆盖配置。
 * @returns 解码后的项目列表响应。
 */
export async function describeCodingProjects(
  client: CodingClient,
  input: DescribeCodingProjectsRequest,
  options?: InvokeOptions,
): Promise<DescribeCodingProjectsResponse> {
  return client.invoke(describeCodingProjectsSpec, input, options);
}