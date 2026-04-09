import { Schema } from "effect";

import type { CodingClient, InvokeOptions } from "../../client/types.js";
import { defineActionSpec } from "../../core/actionSpec.js";
import { projectSchema } from "../../schemas/projects.js";

export const action = "DescribeProjectLabels";

export const requestSchema = Schema.Struct({
  Label: Schema.optional(Schema.String),
});

export const responseSchema = Schema.Struct({
  ProjectList: Schema.NullOr(Schema.Array(projectSchema)),
  RequestId: Schema.String,
});

export type DescribeProjectLabelsRequest = Schema.Schema.Type<typeof requestSchema>;
export type DescribeProjectLabelsResponse = Schema.Schema.Type<typeof responseSchema>;

export const describeProjectLabelsSpec = defineActionSpec({
  action,
  actionPlacement: "body",
  requestSchema,
  responseSchema,
  summary: "项目-按指定标签查询项目列表",
});

/**
 * 按项目标签查询项目列表。
 */
export async function describeProjectLabels(
  client: CodingClient,
  input: DescribeProjectLabelsRequest,
  options?: InvokeOptions,
): Promise<DescribeProjectLabelsResponse> {
  return client.invoke(describeProjectLabelsSpec, input, options);
}