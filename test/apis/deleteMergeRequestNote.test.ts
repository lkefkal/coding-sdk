import { describe, expect, it, vi } from "vitest";

import { deleteMergeRequestNote } from "../../src/apis/mergeRequests/deleteMergeRequestNote.js";
import { createCodingClient } from "../../src/client/createCodingClient.js";

describe("deleteMergeRequestNote", () => {
  it("会同时在 query 和 body 中发送 Action，并返回解码后的已删除评论", async () => {
    const fetchMock = vi.fn(async (input: URL | RequestInfo, init?: RequestInit) => {
      const body = JSON.parse(String(init?.body));
      const url = new URL(String(input));

      expect(url.searchParams.get("Action")).toBe("DeleteMergeRequestNote");
      expect(body.Action).toBe("DeleteMergeRequestNote");
      expect(body.LineNoteId).toBe(330);

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
              CommitSha: "",
              Content: "啊啊啊啊啊啊啊啊啊啊啊啊啊",
              CreatedAt: 1703042325000,
              Id: 330,
              Index: 0,
              MergeId: 10,
              ParentId: 0,
              Path: "",
              UpdatedAt: 1703042325000,
            },
            RequestId: "req-delete-merge-request-note",
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

    const result = await deleteMergeRequestNote(client, {
      DepotPath: "codingcorp/zyx/repo_01",
      LineNoteId: 330,
      MergeId: 10,
    });

    expect(result.RequestId).toBe("req-delete-merge-request-note");
    expect(result.Note.Id).toBe(330);
    expect(result.Note.Content).toBe("啊啊啊啊啊啊啊啊啊啊啊啊啊");
  });
});