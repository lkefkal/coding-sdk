import { describe, expect, it, vi } from "vitest";

import { createCodingClient } from "../../src/client/createCodingClient.js";
import { describeProjectByName } from "../../src/apis/projects/describeProjectByName.js";

describe("接口测试（describeProjectByName）", () => {
  it("会在 body 中发送 Action，并返回解码后的项目详情", async () => {
    const fetchMock = vi.fn(async (input: URL | RequestInfo, init?: RequestInit) => {
      const body = JSON.parse(String(init?.body));
      const url = new URL(String(input));

      expect(url.searchParams.get("Action")).toBeNull();
      expect(body.Action).toBe("DescribeProjectByName");
      expect(body.ProjectName).toBe("coding-demo");

      return new Response(
        JSON.stringify({
          Response: {
            Project: {
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
            RequestId: "req-project-by-name",
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

    const result = await describeProjectByName(client, {
      ProjectName: "coding-demo",
    });

    expect(result.RequestId).toBe("req-project-by-name");
    expect(result.Project?.Id).toBe(2);
    expect(result.Project?.Name).toBe("coding-demo");
  });
});