import { describe, expect, it, vi } from "vitest";

import { describeSingeMergeRequestNotes } from "../../src/apis/mergeRequests/describeSingeMergeRequestNotes.js";
import { createCodingClient } from "../../src/client/createCodingClient.js";

describe("describeSingeMergeRequestNotes", () => {
  it("会同时在 query 和 body 中发送 Action，并返回解码后的单个合并请求评论", async () => {
    const fetchMock = vi.fn(async (input: URL | RequestInfo, init?: RequestInit) => {
      const body = JSON.parse(String(init?.body));
      const url = new URL(String(input));

      expect(url.searchParams.get("Action")).toBe("DescribeSingeMergeRequestNotes");
      expect(body.Action).toBe("DescribeSingeMergeRequestNotes");
      expect(body.MergeId).toBe(15);

      return new Response(
        JSON.stringify({
          Response: {
            Notes: [
              {
                Note: [
                  {
                    Author: {
                      Avatar: "/static/fruit_avatar/Fruit-20.png",
                      Email: "example@example.com",
                      GlobalKey: "coding-coding",
                      Id: 2,
                      Name: "coding",
                      Status: "INACTIVE",
                      TeamId: 1,
                    },
                    CommitSha: "",
                    Content: "nnic",
                    CreatedAt: 1703226273000,
                    Id: 332,
                    Index: 0,
                    MergeId: 15,
                    ParentId: 0,
                    Path: "",
                    UpdatedAt: 1703226273000,
                  },
                ],
              },
            ],
            RequestId: "req-single-merge-request-notes",
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

    const result = await describeSingeMergeRequestNotes(client, {
      DepotPath: "codingcorp/zyx/depot",
      MergeId: 15,
    });

    expect(result.RequestId).toBe("req-single-merge-request-notes");
    expect(result.Notes).toHaveLength(1);
    expect(result.Notes[0]?.Note[0]?.Id).toBe(332);
  });
});