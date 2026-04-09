import { describe, expect, it, vi } from "vitest";

import { createCodingClient } from "../../src/client/createCodingClient.js";
import { describeAllProjectLabels } from "../../src/apis/projects/describeAllProjectLabels.js";

describe("describeAllProjectLabels", () => {
  it("会在 body 中发送 Action，并返回解码后的项目标签列表", async () => {
    const fetchMock = vi.fn(async (input: URL | RequestInfo, init?: RequestInit) => {
      const body = JSON.parse(String(init?.body));
      const url = new URL(String(input));

      expect(url.searchParams.get("Action")).toBeNull();
      expect(body.Action).toBe("DescribeAllProjectLabels");
      expect(body.ProjectId).toBe(1);

      return new Response(
        JSON.stringify({
          Response: {
            Labels: [
              {
                Color: "#C6C8CC",
                CreatorId: 2,
                Id: 2,
                Name: "labelName",
                ProjectId: 1,
              },
            ],
            RequestId: "req-all-project-labels",
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

    const result = await describeAllProjectLabels(client, {
      ProjectId: 1,
    });

    expect(result.RequestId).toBe("req-all-project-labels");
    expect(result.Labels[0]?.Name).toBe("labelName");
  });
});