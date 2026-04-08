import { describe, expect, it, vi } from "vitest";

import { describeMergeRequestLog } from "../../src/apis/mergeRequests/describeMergeRequestLog.js";
import { createCodingClient } from "../../src/client/createCodingClient.js";

describe("接口测试（describeMergeRequestLog）", () => {
  it("会在 body 中发送 Action，并返回解码后的合并请求操作日志", async () => {
    const fetchMock = vi.fn(async (input: URL | RequestInfo, init?: RequestInit) => {
      const body = JSON.parse(String(init?.body));
      const url = new URL(String(input));

      expect(url.searchParams.get("Action")).toBeNull();
      expect(body.Action).toBe("DescribeMergeRequestLog");
      expect(body.MergeId).toBe(2);

      return new Response(
        JSON.stringify({
          Response: {
            Logs: [
              {
                Action: "create",
                Id: 14,
                Name: "coding",
              },
            ],
            RequestId: "req-merge-request-log",
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

    const result = await describeMergeRequestLog(client, {
      DepotId: 8,
      MergeId: 2,
    });

    expect(result.RequestId).toBe("req-merge-request-log");
    expect(result.Logs).toHaveLength(1);
    expect(result.Logs[0]?.Action).toBe("create");
  });
});