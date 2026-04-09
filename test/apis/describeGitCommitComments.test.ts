import { describe, expect, it, vi } from "vitest";

import { describeGitCommitComments } from "../../src/apis/git/describeGitCommitComments.js";
import { createCodingClient } from "../../src/client/createCodingClient.js";

describe("接口测试（describeGitCommitComments）", () => {
  it("会在 body 中发送 Action，并返回解码后的提交评论分页结果", async () => {
    const fetchMock = vi.fn(async (input: URL | RequestInfo, init?: RequestInit) => {
      const body = JSON.parse(String(init?.body));
      const url = new URL(String(input));

      expect(url.searchParams.get("Action")).toBeNull();
      expect(body.Action).toBe("DescribeGitCommitComments");
      expect(body.DepotPath).toBe("codingcorp/test/depot");
      expect(body.Sha).toBe("commit-sha");
      expect(body.PageNumber).toBe(1);
      expect(body.PageSize).toBe(10);

      return new Response(
        JSON.stringify({
          Response: {
            GitCommitComments: {
              CommitComments: [
                {
                  Author: {
                    Avatar: "/static/fruit_avatar/Fruit-20.png",
                    Email: "example@example.com",
                    GlobalKey: "coding-admin",
                    Id: 3,
                    Name: "admin",
                    Status: "ACTIVE",
                    TeamId: 1,
                  },
                  CommitSha: "commit-sha",
                  Content: "需要补充单测",
                  CreatedAt: 1703142386000,
                  DepotId: 4,
                  Id: 331,
                  Index: 7,
                  Path: "src/index.ts",
                },
              ],
              Page: {
                PageNumber: 1,
                PageSize: 10,
                TotalPage: 1,
                TotalRow: 1,
              },
            },
            RequestId: "req-git-commit-comments",
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

    const result = await describeGitCommitComments(client, {
      DepotPath: "codingcorp/test/depot",
      PageNumber: 1,
      PageSize: 10,
      Sha: "commit-sha",
    });

    expect(result.RequestId).toBe("req-git-commit-comments");
    expect(result.GitCommitComments.CommitComments[0]?.Content).toBe("需要补充单测");
    expect(result.GitCommitComments.Page.PageNumber).toBe(1);
  });
});