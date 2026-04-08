import { describe, expect, it, vi } from "vitest";

import { createCodingClient } from "../../src/client/createCodingClient.js";
import { enabledServiceHook } from "../../src/apis/serviceHooks/enabledServiceHook.js";

describe("接口测试（enabledServiceHook）", () => {
  it("会返回批量开关操作结果", async () => {
    const fetchMock = vi.fn(async (input: URL | RequestInfo, init?: RequestInit) => {
      const body = JSON.parse(String(init?.body));
      const url = new URL(String(input));

      expect(url.searchParams.get("Action")).toBeNull();
      expect(body.Action).toBe("EnabledServiceHook");
      expect(body.Id).toEqual(["hook-1", "hook-2"]);
      expect(body.Enabled).toBe(true);

      return new Response(
        JSON.stringify({
          Response: {
            RequestId: "req-enable-hook",
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

    const result = await enabledServiceHook(client, {
      Enabled: true,
      Id: ["hook-1", "hook-2"],
      ProjectId: 1001,
      TargetType: "PROJECT",
    });

    expect(result.RequestId).toBe("req-enable-hook");
    expect(result.Succeed).toBe(true);
  });
});