import { Schema } from "effect";

import type { CodingClient, InvokeOptions } from "../../client/types.js";
import { defineActionSpec } from "../../core/actionSpec.js";

export const action = "DescribeGitTagsByBranch";

export const requestSchema = Schema.Struct({
  Branch: Schema.String,
  DepotId: Schema.Number,
  DepotPath: Schema.optional(Schema.String),
});

export const responseSchema = Schema.Struct({
  RequestId: Schema.String,
  Tags: Schema.Array(Schema.String),
});

export type DescribeGitTagsByBranchRequest = Schema.Schema.Type<typeof requestSchema>;
export type DescribeGitTagsByBranchResponse = Schema.Schema.Type<typeof responseSchema>;

export const describeGitTagsByBranchSpec = defineActionSpec({
  action,
  actionPlacement: "body",
  requestSchema,
  responseSchema,
  summary: "标签信息-根据分支获取标签列表",
});

/**
 * 根据分支查询标签列表。
 *
 * @param client 共享上下文客户端。
 * @param input 当前 action 的请求参数。
 * @param options 本次调用的局部覆盖配置。
 * @returns 解码后的标签名称列表响应。
 */
export async function describeGitTagsByBranch(
  client: CodingClient,
  input: DescribeGitTagsByBranchRequest,
  options?: InvokeOptions,
): Promise<DescribeGitTagsByBranchResponse> {
  return client.invoke(describeGitTagsByBranchSpec, input, options);
}