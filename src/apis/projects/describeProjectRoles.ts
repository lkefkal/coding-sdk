import { Schema } from "effect";

import type { CodingClient, InvokeOptions } from "../../client/types.js";
import { defineActionSpec } from "../../core/actionSpec.js";
import { projectRoleSchema } from "../../schemas/projects.js";

export const action = "DescribeProjectRoles";

export const requestSchema = Schema.Struct({
  ProjectId: Schema.Number,
});

export const responseSchema = Schema.Struct({
  RequestId: Schema.String,
  Roles: Schema.Array(projectRoleSchema),
});

export type DescribeProjectRolesRequest = Schema.Schema.Type<typeof requestSchema>;
export type DescribeProjectRolesResponse = Schema.Schema.Type<typeof responseSchema>;

export const describeProjectRolesSpec = defineActionSpec({
  action,
  actionPlacement: "body",
  requestSchema,
  responseSchema,
  summary: "项目-项目用户组查询",
});

/**
 * 查询项目用户组列表。
 */
export async function describeProjectRoles(
  client: CodingClient,
  input: DescribeProjectRolesRequest,
  options?: InvokeOptions,
): Promise<DescribeProjectRolesResponse> {
  return client.invoke(describeProjectRolesSpec, input, options);
}