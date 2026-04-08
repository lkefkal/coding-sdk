import { describe, expect, it, vi } from "vitest";

import { createCodingClient } from "../../src/client/createCodingClient.js";
import { describeEvents } from "../../src/apis/serviceHooks/describeEvents.js";

describe("接口测试（describeEvents）", () => {
  it("会返回解码后的 Service Hook 事件列表", async () => {
    const fetchMock = vi.fn(async (input: URL | RequestInfo, init?: RequestInit) => {
      const body = JSON.parse(String(init?.body));
      const url = new URL(String(input));

      expect(url.searchParams.get("Action")).toBeNull();
      expect(body.Action).toBe("DescribeEvents");

      return new Response(
        JSON.stringify({
          Response: {
            Event: [
              {
                GroupLabel: "代码事件",
                GroupName: "git",
                Label: "代码推送",
                Name: "GIT_PUSHED",
              },
            ],
            RequestId: "req-events",
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

    const result = await describeEvents(client, {});

    expect(result.RequestId).toBe("req-events");
    expect(result.Event).toHaveLength(1);
    expect(result.Event[0]?.Name).toBe("GIT_PUSHED");
  });
});