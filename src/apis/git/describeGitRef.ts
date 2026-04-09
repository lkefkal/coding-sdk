import { Schema } from "effect";

import type { CodingClient, InvokeOptions } from "../../client/types.js";
import { defineActionSpec } from "../../core/actionSpec.js";
import { gitRefSchema } from "../../schemas/git.js";

export const action = "DescribeGitRef";

export const requestSchema = Schema.Struct({
  DepotId: Schema.Number,
  DepotPath: Schema.optional(Schema.String),
  Revision: Schema.String,
});

export const responseSchema = Schema.Struct({
  GitRef: gitRefSchema,
  RequestId: Schema.String,
});

export type DescribeGitRefRequest = Schema.Schema.Type<typeof requestSchema>;
export type DescribeGitRefResponse = Schema.Schema.Type<typeof responseSchema>;

export const describeGitRefSpec = defineActionSpec({
  action,
  actionPlacement: "body",
  requestSchema,
  responseSchema,
  summary: "仓库分支-获取分支或标签信息",
});

/**
 * 获取分支或标签信息。
 *
 * @param client 共享上下文客户端。
 * @param input 当前 action 的请求参数。
 * @param options 本次调用的局部覆盖配置。
 * @returns 解码后的 ref 信息响应。
 */
export async function describeGitRef(
  client: CodingClient,
  input: DescribeGitRefRequest,
  options?: InvokeOptions,
): Promise<DescribeGitRefResponse> {
  return client.invoke(describeGitRefSpec, input, options);
}