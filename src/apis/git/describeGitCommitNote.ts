import { Schema } from "effect";

import type { CodingClient, InvokeOptions } from "../../client/types.js";
import { defineActionSpec } from "../../core/actionSpec.js";

export const action = "DescribeGitCommitNote";

export const requestSchema = Schema.Struct({
  CommitSha: Schema.String,
  DepotId: Schema.Number,
  DepotPath: Schema.optional(Schema.String),
  NotesRef: Schema.String,
});

export const responseSchema = Schema.Struct({
  CommitNote: Schema.String,
  RequestId: Schema.String,
});

export type DescribeGitCommitNoteRequest = Schema.Schema.Type<typeof requestSchema>;
export type DescribeGitCommitNoteResponse = Schema.Schema.Type<typeof responseSchema>;

export const describeGitCommitNoteSpec = defineActionSpec({
  action,
  actionPlacement: "body",
  requestSchema,
  responseSchema,
  summary: "Git提交-获取提交注释",
});

/**
 * 获取指定提交在指定 notes ref 下的注释内容。
 *
 * @param client 共享上下文客户端。
 * @param input 当前 action 的请求参数。
 * @param options 本次调用的局部覆盖配置。
 * @returns 解码后的提交注释响应。
 */
export async function describeGitCommitNote(
  client: CodingClient,
  input: DescribeGitCommitNoteRequest,
  options?: InvokeOptions,
): Promise<DescribeGitCommitNoteResponse> {
  return client.invoke(describeGitCommitNoteSpec, input, options);
}