import { describe, expect, it, vi } from "vitest";

import { describeIssueCommentList } from "../../src/apis/issues/describeIssueCommentList.js";
import { createCodingClient } from "../../src/client/createCodingClient.js";

describe("接口测试（describeIssueCommentList）", () => {
  it("会返回解码后的事项评论列表", async () => {
    const fetchMock = vi.fn(async (input: URL | RequestInfo, init?: RequestInit) => {
      const body = JSON.parse(String(init?.body));
      const url = new URL(String(input));

      expect(url.searchParams.get("Action")).toBeNull();
      expect(body.Action).toBe("DescribeIssueCommentList");
      expect(body.IssueCode).toBe(5213);

      return new Response(
        JSON.stringify({
          Response: {
            CommentList: [
              {
                CommentId: 1,
                Content: "<p>内容</p>",
                CreatedAt: 1710000000,
                CreatorId: 2,
                FileId: [10],
                ParentId: 0,
                RawContent: "内容",
                UpdatedAt: 1710000001,
              },
            ],
            RequestId: "req-issue-comment-list",
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

    const result = await describeIssueCommentList(client, {
      IssueCode: 5213,
      ProjectName: "test",
      ShowFileId: true,
    });

    expect(result.RequestId).toBe("req-issue-comment-list");
    expect(result.CommentList).toHaveLength(1);
    expect(result.CommentList[0]?.RawContent).toBe("内容");
  });
});