import { describe, expect, it, vi } from "vitest";

import { createCodingClient } from "../../src/client/createCodingClient.js";
import { describeProjectMemberPrincipals } from "../../src/apis/projects/describeProjectMemberPrincipals.js";

describe("接口测试（describeProjectMemberPrincipals）", () => {
  it("会在 body 中发送 Action，并返回解码后的成员主体分页结果", async () => {
    const fetchMock = vi.fn(async (input: URL | RequestInfo, init?: RequestInit) => {
      const body = JSON.parse(String(init?.body));
      const url = new URL(String(input));

      expect(url.searchParams.get("Action")).toBeNull();
      expect(body.Action).toBe("DescribeProjectMemberPrincipals");
      expect(body.ProjectId).toBe(1);

      return new Response(
        JSON.stringify({
          Response: {
            Data: {
              PageNumber: 1,
              PageSize: 1,
              Principals: [
                {
                  CreatedAt: 1000000000,
                  Policies: [
                    {
                      PolicyAlias: "项目成员",
                      PolicyId: 1,
                      PolicyName: "ProjectMember",
                    },
                  ],
                  PrincipalId: "1",
                  PrincipalName: "coding",
                  PrincipalType: "USER",
                },
              ],
              TotalCount: 1,
            },
            RequestId: "req-project-member-principals",
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

    const result = await describeProjectMemberPrincipals(client, {
      Keyword: "coding",
      PageNumber: 1,
      PageSize: 1,
      PolicyId: 1,
      ProjectId: 1,
    });

    expect(result.RequestId).toBe("req-project-member-principals");
    expect(result.Data?.Principals[0]?.PrincipalName).toBe("coding");
  });
});