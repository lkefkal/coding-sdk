import { Schema } from "effect";

import type { CodingClient, InvokeOptions } from "../../client/types.js";
import { defineActionSpec } from "../../core/actionSpec.js";

export const action = "DescribeProjectsByFeature";

export const requestSchema = Schema.Struct({
  MenuName: Schema.String,
});

export const responseSchema = Schema.Struct({
  ProjectId: Schema.NullOr(Schema.Array(Schema.Number)),
  RequestId: Schema.String,
});

export type DescribeProjectsByFeatureRequest = Schema.Schema.Type<typeof requestSchema>;
export type DescribeProjectsByFeatureResponse = Schema.Schema.Type<typeof responseSchema>;

export const describeProjectsByFeatureSpec = defineActionSpec({
  action,
  actionPlacement: "body",
  requestSchema,
  responseSchema,
  summary: "项目-通过一级菜单名查询开启某个模块的项目",
});

/**
 * 通过一级菜单名称查询开启某个模块的项目 ID 列表。
 *
 * @param client 共享上下文客户端。
 * @param input 当前 action 的请求参数。
 * @param options 本次调用的局部覆盖配置。
 * @returns 解码后的项目 ID 列表响应。
 */
export async function describeProjectsByFeature(
  client: CodingClient,
  input: DescribeProjectsByFeatureRequest,
  options?: InvokeOptions,
): Promise<DescribeProjectsByFeatureResponse> {
  return client.invoke(describeProjectsByFeatureSpec, input, options);
}