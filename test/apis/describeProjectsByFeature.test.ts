import { describe, expect, it, vi } from "vitest";

import { createCodingClient } from "../../src/client/createCodingClient.js";
import { describeProjectsByFeature } from "../../src/apis/projects/describeProjectsByFeature.js";

describe("describeProjectsByFeature", () => {
  it("会在 body 中发送 Action，并返回解码后的项目 ID 列表", async () => {
    const fetchMock = vi.fn(async (input: URL | RequestInfo, init?: RequestInit) => {
      const body = JSON.parse(String(init?.body));
      const url = new URL(String(input));

      expect(url.searchParams.get("Action")).toBeNull();
      expect(body.Action).toBe("DescribeProjectsByFeature");
      expect(body.MenuName).toBe("项目协同");

      return new Response(
        JSON.stringify({
          Response: {
            ProjectId: [11934829, 11783308, 11783257],
            RequestId: "req-projects-by-feature",
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

    const result = await describeProjectsByFeature(client, {
      MenuName: "项目协同",
    });

    expect(result.RequestId).toBe("req-projects-by-feature");
    expect(result.ProjectId).toEqual([11934829, 11783308, 11783257]);
  });
});