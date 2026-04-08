import { Schema } from "effect";

import type { CodingClient, InvokeOptions } from "../../client/types.js";
import { defineActionSpec } from "../../core/actionSpec.js";
import { projectPrincipalDataSchema } from "../../schemas/projects.js";

export const action = "DescribeProjectMemberPrincipals";

export const requestSchema = Schema.Struct({
  Keyword: Schema.optional(Schema.String),
  PageNumber: Schema.Number,
  PageSize: Schema.Number,
  PolicyId: Schema.optional(Schema.Number),
  ProjectId: Schema.Number,
});

export const responseSchema = Schema.Struct({
  Data: Schema.NullOr(projectPrincipalDataSchema),
  RequestId: Schema.String,
});

export type DescribeProjectMemberPrincipalsRequest = Schema.Schema.Type<typeof requestSchema>;
export type DescribeProjectMemberPrincipalsResponse = Schema.Schema.Type<typeof responseSchema>;

export const describeProjectMemberPrincipalsSpec = defineActionSpec({
  action,
  actionPlacement: "body",
  requestSchema,
  responseSchema,
  summary: "项目-项目成员主体查询",
});

/**
 * 查询项目成员主体列表，包含用户组、部门和成员。
 */
export async function describeProjectMemberPrincipals(
  client: CodingClient,
  input: DescribeProjectMemberPrincipalsRequest,
  options?: InvokeOptions,
): Promise<DescribeProjectMemberPrincipalsResponse> {
  return client.invoke(describeProjectMemberPrincipalsSpec, input, options);
}