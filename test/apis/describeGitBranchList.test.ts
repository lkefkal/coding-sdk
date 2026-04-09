import { describe, expect, it, vi } from "vitest";

import { describeGitBranchList } from "../../src/apis/git/describeGitBranchList.js";
import { createCodingClient } from "../../src/client/createCodingClient.js";

describe("接口测试（describeGitBranchList）", () => {
  it("会同时在 query 和 body 中发送 Action，并返回解码后的分支集合", async () => {
    const fetchMock = vi.fn(async (input: URL | RequestInfo, init?: RequestInit) => {
      const body = JSON.parse(String(init?.body));
      const url = new URL(String(input));

      expect(url.searchParams.get("Action")).toBe("DescribeGitBranchList");
      expect(body.Action).toBe("DescribeGitBranchList");
      expect(body.DepotPath).toBe("team/project/repo");
      expect(body.PageNumber).toBe(1);
      expect(body.PageSize).toBe(10);

      return new Response(
        JSON.stringify({
          Response: {
            GitBranchesData: {
              Branches: [
                {
                  BranchName: "master",
                  IsDefaultBranch: true,
                  IsProtected: true,
                  Sha: "sha-master",
                },
              ],
              TotalCount: 1,
            },
            RequestId: "req-git-branch-list",
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

    const result = await describeGitBranchList(client, {
      DepotPath: "team/project/repo",
      PageNumber: 1,
      PageSize: 10,
    });

    expect(result.RequestId).toBe("req-git-branch-list");
    expect(result.GitBranchesData.TotalCount).toBe(1);
    expect(result.GitBranchesData.Branches[0]?.Sha).toBe("sha-master");
  });
});