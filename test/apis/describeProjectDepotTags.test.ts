import { describe, expect, it, vi } from "vitest";

import { describeProjectDepotTags } from "../../src/apis/git/describeProjectDepotTags.js";
import { createCodingClient } from "../../src/client/createCodingClient.js";

describe("接口测试（describeProjectDepotTags）", () => {
  it("会在 body 中发送 Action，并返回解码后的项目仓库标签列表", async () => {
    const fetchMock = vi.fn(async (input: URL | RequestInfo, init?: RequestInit) => {
      const body = JSON.parse(String(init?.body));
      const url = new URL(String(input));

      expect(url.searchParams.get("Action")).toBeNull();
      expect(body.Action).toBe("DescribeProjectDepotTags");
      expect(body.ProjectId).toBe(1);
      expect(body.Id).toBe(8);
      expect(body.DepotType).toBe("CODING");

      return new Response(
        JSON.stringify({
          Response: {
            Data: {
              DepotDetailList: [
                {
                  Name: "v1.0.0",
                  Sha: "sha-tag-v1",
                },
              ],
            },
            RequestId: "req-project-depot-tags",
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

    const result = await describeProjectDepotTags(client, {
      DepotType: "CODING",
      Id: 8,
      ProjectId: 1,
    });

    expect(result.RequestId).toBe("req-project-depot-tags");
    expect(result.Data.DepotDetailList[0]?.Name).toBe("v1.0.0");
  });
});