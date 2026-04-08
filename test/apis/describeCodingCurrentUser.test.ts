import { describe, expect, it, vi } from "vitest";

import { createCodingClient } from "../../src/client/createCodingClient.js";
import { describeCodingCurrentUser } from "../../src/apis/user/describeCodingCurrentUser.js";

describe("describeCodingCurrentUser", () => {
  it("sends Action in both query and body", async () => {
    const fetchMock = vi.fn(async (input: URL | RequestInfo, init?: RequestInit) => {
      const body = JSON.parse(String(init?.body));
      const url = new URL(String(input));

      expect(url.searchParams.get("Action")).toBe("DescribeCodingCurrentUser");
      expect(body.Action).toBe("DescribeCodingCurrentUser");

      return new Response(
        JSON.stringify({
          Response: {
            RequestId: "req-user",
            User: {
              Id: 1,
              Name: "coding",
              GlobalKey: "coding",
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

    const result = await describeCodingCurrentUser(client, {});

    expect(result.RequestId).toBe("req-user");
    expect(result.User.Id).toBe(1);
  });
});