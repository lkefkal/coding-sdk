import { describe, expect, it, vi } from "vitest";

import { describeCodingProjects } from "../../src/apis/projects/describeCodingProjects.js";
import { createCodingClient } from "../../src/client/createCodingClient.js";

describe("describeCodingProjects", () => {
  it("会在 body 中发送 Action，并返回解码后的项目分页列表", async () => {
    const fetchMock = vi.fn(async (input: URL | RequestInfo, init?: RequestInit) => {
      const body = JSON.parse(String(init?.body));
      const url = new URL(String(input));

      expect(url.searchParams.get("Action")).toBeNull();
      expect(body.Action).toBe("DescribeCodingProjects");
      expect(body.PageNumber).toBe(1);

      return new Response(
        JSON.stringify({
          Response: {
            Data: {
              PageNumber: 1,
              PageSize: 10,
              ProjectList: [
                {
                  Archived: false,
                  CreatedAt: 1619580482000,
                  Description: "",
                  DisplayName: "empty",
                  EndDate: 0,
                  Icon: "https://e.coding.net/static/project_icon/scenery-version-2-4.svg",
                  Id: 1,
                  IsDemo: false,
                  MaxMember: 0,
                  Name: "empty",
                  StartDate: 0,
                  Status: 1,
                  TeamId: 1,
                  TeamOwnerId: 1,
                  Type: 2,
                  UpdatedAt: 1619580482000,
                  UserOwnerId: 0,
                },
              ],
              TotalCount: 1,
            },
            RequestId: "req-projects",
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

    const result = await describeCodingProjects(client, {
      PageNumber: 1,
      PageSize: 10,
      ProjectName: "coding",
    });

    expect(result.RequestId).toBe("req-projects");
    expect(result.Data?.TotalCount).toBe(1);
    expect(result.Data?.ProjectList?.[0]?.Id).toBe(1);
  });
});