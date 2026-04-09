import { Schema } from "effect";

import type { CodingClient, InvokeOptions } from "../../client/types.js";
import { defineActionSpec } from "../../core/actionSpec.js";
import { projectLabelSchema } from "../../schemas/projects.js";

export const action = "DescribeAllProjectLabels";

export const requestSchema = Schema.Struct({
  ProjectId: Schema.Number,
});

export const responseSchema = Schema.Struct({
  Labels: Schema.Array(projectLabelSchema),
  RequestId: Schema.String,
});

export type DescribeAllProjectLabelsRequest = Schema.Schema.Type<typeof requestSchema>;
export type DescribeAllProjectLabelsResponse = Schema.Schema.Type<typeof responseSchema>;

export const describeAllProjectLabelsSpec = defineActionSpec({
  action,
  actionPlacement: "body",
  requestSchema,
  responseSchema,
  summary: "项目-查询项目全部标签",
});

/**
 * 查询指定项目的全部标签。
 */
export async function describeAllProjectLabels(
  client: CodingClient,
  input: DescribeAllProjectLabelsRequest,
  options?: InvokeOptions,
): Promise<DescribeAllProjectLabelsResponse> {
  return client.invoke(describeAllProjectLabelsSpec, input, options);
}