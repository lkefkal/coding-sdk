import { describe, expect, it, vi } from "vitest";

import { createCodingClient } from "../../src/client/createCodingClient.js";
import { describeServiceHookLogs } from "../../src/apis/serviceHooks/describeServiceHookLogs.js";

describe("接口测试（describeServiceHookLogs）", () => {
  it("会返回解码后的发送记录分页结果", async () => {
    const fetchMock = vi.fn(async (input: URL | RequestInfo, init?: RequestInit) => {
      const body = JSON.parse(String(init?.body));
      const url = new URL(String(input));

      expect(url.searchParams.get("Action")).toBeNull();
      expect(body.Action).toBe("DescribeServiceHookLogs");
      expect(body.Id).toBe("hook-1");

      return new Response(
        JSON.stringify({
          Response: {
            RequestId: "req-hook-logs",
            Data: {
              Log: [
                {
                  CreatedAt: 1710000000,
                  Event: "PING",
                  Id: "log-1",
                  RequestContent: "{}",
                  RequestHeaders: "{}",
                  RequestId: "trace-1",
                  ResponseAt: 1710000001,
                  ResponseBody: "ok",
                  ResponseHeaders: "{}",
                  ResponseStatus: 200,
                  SendAt: 1710000000,
                  ServiceHookId: "hook-1",
                  Status: 1,
                },
              ],
              PageNumber: 1,
              PageSize: 20,
              TotalCount: 1,
            },
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

    const result = await describeServiceHookLogs(client, {
      Id: "hook-1",
      PageNumber: 1,
      PageSize: 20,
      ProjectId: 1001,
      TargetType: "PROJECT",
    });

    expect(result.RequestId).toBe("req-hook-logs");
    expect(result.Data.TotalCount).toBe(1);
    expect(result.Data.Log[0]?.Id).toBe("log-1");
  });
});