import { describe, expect, it, vi } from "vitest";

import { createCodingClient } from "../../src/client/createCodingClient.js";
import { describeProjectMembers } from "../../src/apis/projects/describeProjectMembers.js";

describe("接口测试（describeProjectMembers）", () => {
  it("会在 body 中发送 Action，并返回解码后的项目成员分页结果", async () => {
    const fetchMock = vi.fn(async (input: URL | RequestInfo, init?: RequestInit) => {
      const body = JSON.parse(String(init?.body));
      const url = new URL(String(input));

      expect(url.searchParams.get("Action")).toBeNull();
      expect(body.Action).toBe("DescribeProjectMembers");
      expect(body.ProjectId).toBe(1);

      return new Response(
        JSON.stringify({
          Response: {
            Data: {
              PageNumber: 1,
              PageSize: 1,
              ProjectMembers: [
                {
                  Avatar: "http://e.coding.net/static/fruit_avatar/Fruit-4.png",
                  DepartmentMember: {
                    RefId: 0,
                    Refs: [],
                    ThirdPartyAvatar: "",
                    ThirdPartyId: "",
                    ThirdPartyName: "",
                  },
                  Email: "blockuser@gmail.com",
                  EmailValidation: 1,
                  GlobalKey: "GK",
                  Id: 6,
                  Name: "blockuser",
                  NamePinYin: "blockuser",
                  Phone: "13800138006",
                  PhoneValidation: 1,
                  Roles: [
                    {
                      RoleId: 1,
                      RoleType: "ProjectMember",
                      RoleTypeName: "开发",
                    },
                  ],
                  Status: -1,
                  TeamId: 1,
                  UniqueExtField: "",
                },
              ],
              TotalCount: 6,
            },
            RequestId: "req-project-members",
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

    const result = await describeProjectMembers(client, {
      PageNumber: 1,
      PageSize: 10,
      ProjectId: 1,
      RoleId: 1,
    });

    expect(result.RequestId).toBe("req-project-members");
    expect(result.Data.ProjectMembers[0]?.Name).toBe("blockuser");
  });
});