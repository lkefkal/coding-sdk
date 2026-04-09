import { describe, expect, it, vi } from "vitest";

import { describeGitCommitsInPage } from "../../src/apis/git/describeGitCommitsInPage.js";
import { createCodingClient } from "../../src/client/createCodingClient.js";

describe("接口测试（describeGitCommitsInPage）", () => {
  it("会在 body 中发送 Action，并返回解码后的提交分页结果", async () => {
    const fetchMock = vi.fn(async (input: URL | RequestInfo, init?: RequestInit) => {
      const body = JSON.parse(String(init?.body));
      const url = new URL(String(input));

      expect(url.searchParams.get("Action")).toBeNull();
      expect(body.Action).toBe("DescribeGitCommitsInPage");
      expect(body.DepotId).toBe(6);
      expect(body.Ref).toBe("master");

      return new Response(
        JSON.stringify({
          Response: {
            Data: {
              Commits: [
                {
                  Author: {
                    Email: "example@example.com",
                    Name: "coding",
                  },
                  AuthorEmail: "example@example.com",
                  AuthorName: "coding",
                  CommitDate: 1703142386000,
                  Committer: {
                    Email: "example@example.com",
                    Name: "coding",
                  },
                  CreatedAt: 1703142386000,
                  FullMessage: "初始化提交\n",
                  Parents: ["parent-sha"],
                  Sha: "commit-sha",
                  ShortMessage: "初始化提交",
                },
              ],
              Page: {
                PageNumber: 1,
                PageSize: 10,
                TotalPage: 1,
                TotalRow: 1,
              },
            },
            RequestId: "req-git-commits-in-page",
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

    const result = await describeGitCommitsInPage(client, {
      DepotId: 6,
      Ref: "master",
    });

    expect(result.RequestId).toBe("req-git-commits-in-page");
    expect(result.Data.Page?.TotalRow).toBe(1);
    expect(result.Data.Commits?.[0]?.FullMessage).toBe("初始化提交\n");
  });
});