import { describe, expect, it, vi } from "vitest";

import { describeGitBranch } from "../../src/apis/git/describeGitBranch.js";
import { createCodingClient } from "../../src/client/createCodingClient.js";

describe("接口测试（describeGitBranch）", () => {
  it("会在 body 中发送 Action，并返回解码后的单个分支详情", async () => {
    const fetchMock = vi.fn(async (input: URL | RequestInfo, init?: RequestInit) => {
      const body = JSON.parse(String(init?.body));
      const url = new URL(String(input));

      expect(url.searchParams.get("Action")).toBeNull();
      expect(body.Action).toBe("DescribeGitBranch");
      expect(body.BranchName).toBe("master");
      expect(body.DepotId).toBe(6);

      return new Response(
        JSON.stringify({
          Response: {
            GitBranch: {
              BranchName: "master",
              Content: "默认分支",
              IsDefaultBranch: true,
              IsProtected: false,
              LastCommit: {
                AuthorEmail: "example@example.com",
                AuthorName: "coding",
                CommitDate: 1703142386000,
                Committer: {
                  Email: "example@example.com",
                  Name: "coding",
                },
                CreatedAt: 1703142386000,
                Parents: [],
                Sha: "sha-master",
                ShortMessage: "初始化仓库",
              },
              Sha: "sha-master",
            },
            RequestId: "req-git-branch",
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

    const result = await describeGitBranch(client, {
      BranchName: "master",
      DepotId: 6,
    });

    expect(result.RequestId).toBe("req-git-branch");
    expect(result.GitBranch.Content).toBe("默认分支");
    expect(result.GitBranch.LastCommit.Committer.Name).toBe("coding");
  });
});