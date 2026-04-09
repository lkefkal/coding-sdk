import { Schema } from "effect";

import type { CodingClient, InvokeOptions } from "../../client/types.js";
import { defineActionSpec } from "../../core/actionSpec.js";
import { depotDetailDataSchema } from "../../schemas/git.js";

export const action = "DescribeProjectDepotBranches";

export const requestSchema = Schema.Struct({
  DepotType: Schema.String,
  Id: Schema.Number,
  ProjectId: Schema.Number,
});

export const responseSchema = Schema.Struct({
  Data: depotDetailDataSchema,
  RequestId: Schema.String,
});

export type DescribeProjectDepotBranchesRequest = Schema.Schema.Type<typeof requestSchema>;
export type DescribeProjectDepotBranchesResponse = Schema.Schema.Type<typeof responseSchema>;

export const describeProjectDepotBranchesSpec = defineActionSpec({
  action,
  actionPlacement: "body",
  requestSchema,
  responseSchema,
  summary: "仓库分支-获取仓库分支列表",
});

/**
 * 获取项目仓库的分支列表。
 *
 * @param client 共享上下文客户端。
 * @param input 当前 action 的请求参数。
 * @param options 本次调用的局部覆盖配置。
 * @returns 解码后的项目仓库分支列表响应。
 */
export async function describeProjectDepotBranches(
  client: CodingClient,
  input: DescribeProjectDepotBranchesRequest,
  options?: InvokeOptions,
): Promise<DescribeProjectDepotBranchesResponse> {
  return client.invoke(describeProjectDepotBranchesSpec, input, options);
}