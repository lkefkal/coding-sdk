import { describe, expect, it, vi } from "vitest";

import { describeGitCommitInfos } from "../../src/apis/git/describeGitCommitInfos.js";
import { createCodingClient } from "../../src/client/createCodingClient.js";

describe("接口测试（describeGitCommitInfos）", () => {
  it("会在 body 中发送 Action，并返回解码后的提交列表", async () => {
    const fetchMock = vi.fn(async (input: URL | RequestInfo, init?: RequestInit) => {
      const body = JSON.parse(String(init?.body));
      const url = new URL(String(input));

      expect(url.searchParams.get("Action")).toBeNull();
      expect(body.Action).toBe("DescribeGitCommitInfos");
      expect(body.DepotId).toBe(6);
      expect(body.Ref).toBe("master");

      return new Response(
        JSON.stringify({
          Response: {
            Commits: [
              {
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
            ],
            RequestId: "req-git-commit-infos",
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

    const result = await describeGitCommitInfos(client, {
      DepotId: 6,
      Ref: "master",
    });

    expect(result.RequestId).toBe("req-git-commit-infos");
    expect(result.Commits[0]?.Sha).toBe("commit-sha");
  });
});