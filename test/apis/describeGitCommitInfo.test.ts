import { describe, expect, it, vi } from "vitest";

import { describeGitCommitInfo } from "../../src/apis/git/describeGitCommitInfo.js";
import { createCodingClient } from "../../src/client/createCodingClient.js";

describe("接口测试（describeGitCommitInfo）", () => {
  it("会在 body 中发送 Action，并返回解码后的提交详情", async () => {
    const fetchMock = vi.fn(async (input: URL | RequestInfo, init?: RequestInit) => {
      const body = JSON.parse(String(init?.body));
      const url = new URL(String(input));

      expect(url.searchParams.get("Action")).toBeNull();
      expect(body.Action).toBe("DescribeGitCommitInfo");
      expect(body.DepotId).toBe(6);
      expect(body.Sha).toBe("commit-sha");

      return new Response(
        JSON.stringify({
          Response: {
            GitCommit: {
              AuthorEmail: "example@example.com",
              AuthorName: "coding",
              CommitDate: 1703142386000,
              Committer: {
                Email: "example@example.com",
                Name: "coding",
              },
              CreatedAt: 1703142386000,
              Parents: ["parent-sha"],
              Sha: "commit-sha",
              ShortMessage: "初始化提交",
            },
            RequestId: "req-git-commit-info",
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

    const result = await describeGitCommitInfo(client, {
      DepotId: 6,
      Sha: "commit-sha",
    });

    expect(result.RequestId).toBe("req-git-commit-info");
    expect(result.GitCommit.ShortMessage).toBe("初始化提交");
  });
});