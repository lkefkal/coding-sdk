import { describe, expect, it, vi } from "vitest";

import { pingServiceHook } from "../../src/apis/serviceHooks/pingServiceHook.js";
import { createCodingClient } from "../../src/client/createCodingClient.js";

describe("接口测试（pingServiceHook）", () => {
  it("会返回 Service Hook 测试结果", async () => {
    const fetchMock = vi.fn(async (input: URL | RequestInfo, init?: RequestInit) => {
      const body = JSON.parse(String(init?.body));
      const url = new URL(String(input));

      expect(url.searchParams.get("Action")).toBeNull();
      expect(body.Action).toBe("PingServiceHook");
      expect(body.Id).toEqual(["hook-1"]);

      return new Response(
        JSON.stringify({
          Response: {
            RequestId: "req-ping-hook",
            Succeed: true,
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

    const result = await pingServiceHook(client, {
      Id: ["hook-1"],
      ProjectId: 1001,
      TargetType: "PROJECT",
    });

    expect(result.RequestId).toBe("req-ping-hook");
    expect(result.Succeed).toBe(true);
  });
});