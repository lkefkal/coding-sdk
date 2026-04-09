import { describe, expect, it, vi } from "vitest";

import { createCodingClient } from "../../src/client/createCodingClient.js";
import { describeProjectRoles } from "../../src/apis/projects/describeProjectRoles.js";

describe("describeProjectRoles", () => {
  it("会在 body 中发送 Action，并返回解码后的项目用户组列表", async () => {
    const fetchMock = vi.fn(async (input: URL | RequestInfo, init?: RequestInit) => {
      const body = JSON.parse(String(init?.body));
      const url = new URL(String(input));

      expect(url.searchParams.get("Action")).toBeNull();
      expect(body.Action).toBe("DescribeProjectRoles");
      expect(body.ProjectId).toBe(1);

      return new Response(
        JSON.stringify({
          Response: {
            RequestId: "req-project-roles",
            Roles: [
              {
                RoleId: 1,
                RoleType: "ProjectMember",
                RoleTypeName: "开发",
              },
            ],
          },
        }),
        { status: 200 },
      );
    });

    const client = createCodingClient({
      baseUrl: "https://e.coding.net/open-api",
      fetch: fetchMock,
      token: "token-value",
    });

    const result = await describeProjectRoles(client, {
      ProjectId: 1,
    });

    expect(result.RequestId).toBe("req-project-roles");
    expect(result.Roles[0]?.RoleTypeName).toBe("开发");
  });
});