import { describe, expect, it, vi } from "vitest";

import { describeUserProjects } from "../../src/apis/projects/describeUserProjects.js";
import { createCodingClient } from "../../src/client/createCodingClient.js";

describe("接口测试（describeUserProjects）", () => {
  it("会在 body 中发送 Action，并返回解码后的已加入项目列表", async () => {
    const fetchMock = vi.fn(async (input: URL | RequestInfo, init?: RequestInit) => {
      const body = JSON.parse(String(init?.body));
      const url = new URL(String(input));

      expect(url.searchParams.get("Action")).toBeNull();
      expect(body.Action).toBe("DescribeUserProjects");
      expect(body.UserId).toBe(1);

      return new Response(
        JSON.stringify({
          Response: {
            ProjectList: [
              {
                Archived: false,
                CreatedAt: 1572933083682,
                Description: "CODING 示例项目",
                DisplayName: "示例项目",
                EndDate: 0,
                Icon: "https://e.coding.net/static/project_icon/scenery-version-2-4.svg",
                Id: 2,
                IsDemo: true,
                MaxMember: 0,
                Name: "coding-demo",
                StartDate: 0,
                Status: 1,
                TeamId: 12,
                TeamOwnerId: 0,
                Type: 2,
                UpdatedAt: 1572933083682,
                UserOwnerId: 0,
              },
            ],
            RequestId: "req-user-projects",
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

    const result = await describeUserProjects(client, {
      ProjectName: "coding",
      UserId: 1,
    });

    expect(result.RequestId).toBe("req-user-projects");
    expect(result.ProjectList).toHaveLength(1);
    expect(result.ProjectList?.[0]?.Name).toBe("coding-demo");
  });
});