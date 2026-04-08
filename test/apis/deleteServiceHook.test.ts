import { describe, expect, it, vi } from "vitest";

import { deleteServiceHook } from "../../src/apis/serviceHooks/deleteServiceHook.js";
import { createCodingClient } from "../../src/client/createCodingClient.js";

describe("deleteServiceHook", () => {
  it("会返回批量删除结果", async () => {
    const fetchMock = vi.fn(async (input: URL | RequestInfo, init?: RequestInit) => {
      const body = JSON.parse(String(init?.body));
      const url = new URL(String(input));

      expect(url.searchParams.get("Action")).toBeNull();
      expect(body.Action).toBe("DeleteServiceHook");
      expect(body.Id).toEqual(["hook-1", "hook-2"]);

      return new Response(
        JSON.stringify({
          Response: {
            RequestId: "req-delete-hook",
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

    const result = await deleteServiceHook(client, {
      Id: ["hook-1", "hook-2"],
      ProjectId: 1001,
      TargetType: "PROJECT",
    });

    expect(result.RequestId).toBe("req-delete-hook");
    expect(result.Succeed).toBe(true);
  });
});