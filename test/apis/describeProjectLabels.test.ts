import { describe, expect, it, vi } from "vitest";

import { createCodingClient } from "../../src/client/createCodingClient.js";
import { describeProjectLabels } from "../../src/apis/projects/describeProjectLabels.js";

describe("describeProjectLabels", () => {
  it("会在 body 中发送 Action，并返回解码后的标签筛选项目列表", async () => {
    const fetchMock = vi.fn(async (input: URL | RequestInfo, init?: RequestInit) => {
      const body = JSON.parse(String(init?.body));
      const url = new URL(String(input));

      expect(url.searchParams.get("Action")).toBeNull();
      expect(body.Action).toBe("DescribeProjectLabels");
      expect(body.Label).toBe("Demo");

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
                Icon: "https://dn-coding-net-production-pp.codehub.cn/79a8bcc4-d9cc-4061-940d-5b3bb31bf571.png",
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
            RequestId: "req-project-labels",
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

    const result = await describeProjectLabels(client, {
      Label: "Demo",
    });

    expect(result.RequestId).toBe("req-project-labels");
    expect(result.ProjectList?.[0]?.Name).toBe("coding-demo");
  });
});