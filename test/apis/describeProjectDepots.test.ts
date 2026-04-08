import { describe, expect, it, vi } from "vitest";

import { createCodingClient } from "../../src/client/createCodingClient.js";
import { describeProjectDepots } from "../../src/apis/projects/describeProjectDepots.js";

describe("接口测试（describeProjectDepots）", () => {
  it("会在 body 中发送 Action，并返回解码后的项目仓库列表", async () => {
    const fetchMock = vi.fn(async (input: URL | RequestInfo, init?: RequestInit) => {
      const body = JSON.parse(String(init?.body));
      const url = new URL(String(input));

      expect(url.searchParams.get("Action")).toBeNull();
      expect(body.Action).toBe("DescribeProjectDepots");
      expect(body.DepotType).toBe("CODING");

      return new Response(
        JSON.stringify({
          Response: {
            Data: {
              DepotList: [
                {
                  Authorized: true,
                  DepotHttpsUrl: "http://e.coding.9.134.115.58.nip.io/codingcorp/test-1.git",
                  DepotSshUrl: "git@e.coding.9.134.115.58.nip.io:codingcorp/test-1.git",
                  DepotType: "CODING",
                  Id: 1,
                  IsDefault: true,
                  Name: "test-1",
                  OpenModule: "continue_integration",
                },
              ],
              IsBound: true,
            },
            RequestId: "req-project-depots",
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

    const result = await describeProjectDepots(client, {
      DepotType: "CODING",
      ProjectId: 1,
    });

    expect(result.RequestId).toBe("req-project-depots");
    expect(result.Data.DepotList[0]?.Name).toBe("test-1");
  });
});