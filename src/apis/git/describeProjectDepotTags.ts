import { Schema } from "effect";

import type { CodingClient, InvokeOptions } from "../../client/types.js";
import { defineActionSpec } from "../../core/actionSpec.js";
import { depotDetailDataSchema } from "../../schemas/git.js";

export const action = "DescribeProjectDepotTags";

export const requestSchema = Schema.Struct({
  DepotType: Schema.String,
  Id: Schema.Number,
  ProjectId: Schema.Number,
});

export const responseSchema = Schema.Struct({
  Data: depotDetailDataSchema,
  RequestId: Schema.String,
});

export type DescribeProjectDepotTagsRequest = Schema.Schema.Type<typeof requestSchema>;
export type DescribeProjectDepotTagsResponse = Schema.Schema.Type<typeof responseSchema>;

export const describeProjectDepotTagsSpec = defineActionSpec({
  action,
  actionPlacement: "body",
  requestSchema,
  responseSchema,
  summary: "标签信息-获取仓库的标签列表",
});

/**
 * 获取项目仓库的标签列表。
 *
 * @param client 共享上下文客户端。
 * @param input 当前 action 的请求参数。
 * @param options 本次调用的局部覆盖配置。
 * @returns 解码后的项目仓库标签列表响应。
 */
export async function describeProjectDepotTags(
  client: CodingClient,
  input: DescribeProjectDepotTagsRequest,
  options?: InvokeOptions,
): Promise<DescribeProjectDepotTagsResponse> {
  return client.invoke(describeProjectDepotTagsSpec, input, options);
}