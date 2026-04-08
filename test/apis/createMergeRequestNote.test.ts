import { describe, expect, it, vi } from "vitest";

import { createMergeRequestNote } from "../../src/apis/mergeRequests/createMergeRequestNote.js";
import { createCodingClient } from "../../src/client/createCodingClient.js";

describe("createMergeRequestNote", () => {
  it("会同时在 query 和 body 中发送 Action，并返回解码后的新评论", async () => {
    const fetchMock = vi.fn(async (input: URL | RequestInfo, init?: RequestInit) => {
      const body = JSON.parse(String(init?.body));
      const url = new URL(String(input));

      expect(url.searchParams.get("Action")).toBe("CreateMergeRequestNote");
      expect(body.Action).toBe("CreateMergeRequestNote");
      expect(body.Content).toBe("Hello");

      return new Response(
        JSON.stringify({
          Response: {
            Note: {
              Author: {
                Avatar: "/static/fruit_avatar/Fruit-20.png",
                Email: "example@example.com",
                GlobalKey: "coding-coding",
                Id: 2,
                Name: "coding",
                Status: "INACTIVE",
                TeamId: 1,
              },
              CommitSha: "2994baabc5dca2bd2a07b9230da99becf1734331",
              Content: "Hello",
              CreatedAt: 1671011875949,
              Id: 720,
              Index: 1,
              MergeId: 14,
              ParentId: 0,
              Path: "README.md",
              UpdatedAt: 1671011875949,
            },
            RequestId: "req-create-merge-request-note",
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

    const result = await createMergeRequestNote(client, {
      Content: "Hello",
      DepotPath: "codingcorp/test/test111",
      Form: {
        CommitSha: "2994baabc5dca2bd2a07b9230da99becf1734331",
        Index: 1,
        Path: "README.md",
      },
      MergeId: 14,
      ParentId: 0,
    });

    expect(result.RequestId).toBe("req-create-merge-request-note");
    expect(result.Note.Id).toBe(720);
    expect(result.Note.Path).toBe("README.md");
  });
});