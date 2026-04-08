import { Schema } from "effect";

import type { CodingClient, InvokeOptions } from "../../client/types.js";
import { defineActionSpec } from "../../core/actionSpec.js";
import { describeProjectCredentialsDataSchema } from "../../schemas/projects.js";

export const action = "DescribeProjectCredentials";

export const requestSchema = Schema.Struct({
  ProjectId: Schema.Number,
});

export const responseSchema = Schema.Struct({
  Data: describeProjectCredentialsDataSchema,
  RequestId: Schema.String,
});

export type DescribeProjectCredentialsRequest = Schema.Schema.Type<typeof requestSchema>;
export type DescribeProjectCredentialsResponse = Schema.Schema.Type<typeof responseSchema>;

export const describeProjectCredentialsSpec = defineActionSpec({
  action,
  actionPlacement: "body",
  requestSchema,
  responseSchema,
  summary: "项目-项目凭据列表查询",
});

/**
 * 查询项目凭据列表。
 */
export async function describeProjectCredentials(
  client: CodingClient,
  input: DescribeProjectCredentialsRequest,
  options?: InvokeOptions,
): Promise<DescribeProjectCredentialsResponse> {
  return client.invoke(describeProjectCredentialsSpec, input, options);
}