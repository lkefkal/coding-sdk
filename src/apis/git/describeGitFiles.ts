import { Schema } from "effect";

import type { CodingClient, InvokeOptions } from "../../client/types.js";
import { defineActionSpec } from "../../core/actionSpec.js";
import { gitTreeItemSchema } from "../../schemas/git.js";

export const action = "DescribeGitFiles";

export const requestSchema = Schema.Struct({
  DepotId: Schema.Number,
  DepotPath: Schema.optional(Schema.String),
  Path: Schema.optional(Schema.String),
  Ref: Schema.String,
});

export const responseSchema = Schema.Struct({
  Items: Schema.Array(gitTreeItemSchema),
  RequestId: Schema.String,
});

export type DescribeGitFilesRequest = Schema.Schema.Type<typeof requestSchema>;
export type DescribeGitFilesResponse = Schema.Schema.Type<typeof responseSchema>;

export const describeGitFilesSpec = defineActionSpec({
  action,
  actionPlacement: "body",
  requestSchema,
  responseSchema,
  summary: "Git文件-查询仓库目录下文件和文件夹名字",
});

/**
 * 获取指定分支目录下的文件和文件夹名字。
 *
 * @param client 共享上下文客户端。
 * @param input 当前 action 的请求参数。
 * @param options 本次调用的局部覆盖配置。
 * @returns 解码后的目录项列表响应。
 */
export async function describeGitFiles(
  client: CodingClient,
  input: DescribeGitFilesRequest,
  options?: InvokeOptions,
): Promise<DescribeGitFilesResponse> {
  return client.invoke(describeGitFilesSpec, input, options);
}