import { Schema } from "effect";

import type { CodingClient, InvokeOptions } from "../../client/types.js";
import { defineActionSpec } from "../../core/actionSpec.js";
import { describeProjectDepotsDataSchema } from "../../schemas/projects.js";

export const action = "DescribeProjectDepots";

export const requestSchema = Schema.Struct({
  DepotType: Schema.String,
  ProjectId: Schema.Number,
});

export const responseSchema = Schema.Struct({
  Data: describeProjectDepotsDataSchema,
  RequestId: Schema.String,
});

export type DescribeProjectDepotsRequest = Schema.Schema.Type<typeof requestSchema>;
export type DescribeProjectDepotsResponse = Schema.Schema.Type<typeof responseSchema>;

export const describeProjectDepotsSpec = defineActionSpec({
  action,
  actionPlacement: "body",
  requestSchema,
  responseSchema,
  summary: "项目-获取项目仓库列表",
});

/**
 * 查询项目下的仓库列表。
 */
export async function describeProjectDepots(
  client: CodingClient,
  input: DescribeProjectDepotsRequest,
  options?: InvokeOptions,
): Promise<DescribeProjectDepotsResponse> {
  return client.invoke(describeProjectDepotsSpec, input, options);
}