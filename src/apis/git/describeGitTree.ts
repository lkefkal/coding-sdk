import { Schema } from "effect";

import type { CodingClient, InvokeOptions } from "../../client/types.js";
import { defineActionSpec } from "../../core/actionSpec.js";
import { gitTreeSchema } from "../../schemas/git.js";

export const action = "DescribeGitTree";

export const requestSchema = Schema.Struct({
  DepotId: Schema.Number,
  DepotPath: Schema.optional(Schema.String),
  IsRecursive: Schema.Boolean,
  Path: Schema.optional(Schema.String),
  Ref: Schema.String,
});

export const responseSchema = Schema.Struct({
  RequestId: Schema.String,
  Trees: Schema.Array(gitTreeSchema),
});

export type DescribeGitTreeRequest = Schema.Schema.Type<typeof requestSchema>;
export type DescribeGitTreeResponse = Schema.Schema.Type<typeof responseSchema>;

export const describeGitTreeSpec = defineActionSpec({
  action,
  actionPlacement: "body",
  requestSchema,
  responseSchema,
  summary: "仓库信息-查询git仓库的树",
});

/**
 * 查询 git 仓库的树结构。
 *
 * @param client 共享上下文客户端。
 * @param input 当前 action 的请求参数。
 * @param options 本次调用的局部覆盖配置。
 * @returns 解码后的树结构响应。
 */
export async function describeGitTree(
  client: CodingClient,
  input: DescribeGitTreeRequest,
  options?: InvokeOptions,
): Promise<DescribeGitTreeResponse> {
  return client.invoke(describeGitTreeSpec, input, options);
}