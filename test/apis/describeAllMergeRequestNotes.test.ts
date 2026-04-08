import { describe, expect, it, vi } from "vitest";

import { describeAllMergeRequestNotes } from "../../src/apis/mergeRequests/describeAllMergeRequestNotes.js";
import { createCodingClient } from "../../src/client/createCodingClient.js";

describe("describeAllMergeRequestNotes", () => {
  it("会同时在 query 和 body 中发送 Action，并返回解码后的全部合并请求评论", async () => {
    const fetchMock = vi.fn(async (input: URL | RequestInfo, init?: RequestInit) => {
      const body = JSON.parse(String(init?.body));
      const url = new URL(String(input));

      expect(url.searchParams.get("Action")).toBe("DescribeAllMergeRequestNotes");
      expect(body.Action).toBe("DescribeAllMergeRequestNotes");
      expect(body.DepotPath).toBe("abc");

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
                      GlobalKey: "coding-user",
                      Id: 4,
                      Name: "user",
                      Status: "INACTIVE",
                      TeamId: 1,
                    },
                    CommitSha: "2994baabc5dca2bd2a07b9230da99becf1734331",
                    Content: "Hello",
                    CreatedAt: 1670992462000,
                    Id: 707,
                    Index: 4,
                    MergeId: 14,
                    ParentId: 0,
                    Path: "README.md",
                    UpdatedAt: 1670992462000,
                  },
                ],
              },
            ],
            RequestId: "req-all-merge-request-notes",
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

    const result = await describeAllMergeRequestNotes(client, {
      DepotPath: "abc",
      MergeIds: [1],
      MrStatuses: ["CANMERGE"],
      PageNumber: 1,
      PageSize: 10,
      ReporterIds: [2],
    });

    expect(result.RequestId).toBe("req-all-merge-request-notes");
    expect(result.Notes).toHaveLength(1);
    expect(result.Notes[0]?.Note[0]?.Content).toBe("Hello");
  });
});