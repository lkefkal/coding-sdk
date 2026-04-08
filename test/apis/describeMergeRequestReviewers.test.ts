import { describe, expect, it, vi } from "vitest";

import { describeMergeRequestReviewers } from "../../src/apis/mergeRequests/describeMergeRequestReviewers.js";
import { createCodingClient } from "../../src/client/createCodingClient.js";

describe("接口测试（describeMergeRequestReviewers）", () => {
  it("会在 body 中发送 Action，并返回解码后的评审者列表", async () => {
    const fetchMock = vi.fn(async (input: URL | RequestInfo, init?: RequestInit) => {
      const body = JSON.parse(String(init?.body));
      const url = new URL(String(input));

      expect(url.searchParams.get("Action")).toBeNull();
      expect(body.Action).toBe("DescribeMergeRequestReviewers");
      expect(body.MergeId).toBe(15);

      return new Response(
        JSON.stringify({
          Response: {
            RequestId: "req-merge-request-reviewers",
            Reviewers: [
              {
                Avatar: "/static/fruit_avatar/Fruit-20.png",
                Email: "example@example.com",
                GlobalKey: "coding-user",
                Id: 4,
                Name: "user",
                Status: "INACTIVE",
                TeamId: 0,
              },
              {
                Avatar: "/static/fruit_avatar/Fruit-20.png",
                Email: "example@example.com",
                GlobalKey: "coding-admin",
                Id: 3,
                Name: "admin",
                Status: "INACTIVE",
                TeamId: 0,
              },
            ],
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

    const result = await describeMergeRequestReviewers(client, {
      DepotId: 9,
      MergeId: 15,
    });

    expect(result.RequestId).toBe("req-merge-request-reviewers");
    expect(result.Reviewers).toHaveLength(2);
    expect(result.Reviewers[0]?.GlobalKey).toBe("coding-user");
  });
});