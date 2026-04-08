import { Schema } from "effect";

import type { CodingClient, InvokeOptions } from "../../client/types.js";
import { defineActionSpec } from "../../core/actionSpec.js";
import { projectMemberDataSchema } from "../../schemas/projects.js";

export const action = "DescribeProjectMembers";

export const requestSchema = Schema.Struct({
  PageNumber: Schema.Number,
  PageSize: Schema.Number,
  ProjectId: Schema.Number,
  RoleId: Schema.optional(Schema.Number),
});

export const responseSchema = Schema.Struct({
  Data: projectMemberDataSchema,
  RequestId: Schema.String,
});

export type DescribeProjectMembersRequest = Schema.Schema.Type<typeof requestSchema>;
export type DescribeProjectMembersResponse = Schema.Schema.Type<typeof responseSchema>;

export const describeProjectMembersSpec = defineActionSpec({
  action,
  actionPlacement: "body",
  requestSchema,
  responseSchema,
  summary: "项目-项目成员列表查询",
});

/**
 * 查询项目成员分页列表。
 */
export async function describeProjectMembers(
  client: CodingClient,
  input: DescribeProjectMembersRequest,
  options?: InvokeOptions,
): Promise<DescribeProjectMembersResponse> {
  return client.invoke(describeProjectMembersSpec, input, options);
}