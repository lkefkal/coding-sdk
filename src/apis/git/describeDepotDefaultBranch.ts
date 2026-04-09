import { Schema } from "effect";

import type { CodingClient, InvokeOptions } from "../../client/types.js";
import { defineActionSpec } from "../../core/actionSpec.js";

export const action = "DescribeDepotDefaultBranch";

export const requestSchema = Schema.Struct({
  DepotPath: Schema.String,
});

export const responseSchema = Schema.Struct({
  BranchName: Schema.String,
  RequestId: Schema.String,
});

export type DescribeDepotDefaultBranchRequest = Schema.Schema.Type<typeof requestSchema>;
export type DescribeDepotDefaultBranchResponse = Schema.Schema.Type<typeof responseSchema>;

export const describeDepotDefaultBranchSpec = defineActionSpec({
  action,
  actionPlacement: "both",
  requestSchema,
  responseSchema,
  summary: "仓库分支-查询仓库的默认分支",
});

/**
 * 查询仓库的默认分支。
 *
 * @param client 共享上下文客户端。
 * @param input 当前 action 的请求参数。
 * @param options 本次调用的局部覆盖配置。
 * @returns 解码后的默认分支响应。
 */
export async function describeDepotDefaultBranch(
  client: CodingClient,
  input: DescribeDepotDefaultBranchRequest,
  options?: InvokeOptions,
): Promise<DescribeDepotDefaultBranchResponse> {
  return client.invoke(describeDepotDefaultBranchSpec, input, options);
}