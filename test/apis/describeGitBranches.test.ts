import { describe, expect, it, vi } from "vitest";

import { describeGitBranches } from "../../src/apis/git/describeGitBranches.js";
import { createCodingClient } from "../../src/client/createCodingClient.js";

describe("接口测试（describeGitBranches）", () => {
  it("会在 body 中发送 Action，并返回解码后的仓库分支列表", async () => {
    const fetchMock = vi.fn(async (input: URL | RequestInfo, init?: RequestInit) => {
      const body = JSON.parse(String(init?.body));
      const url = new URL(String(input));

      expect(url.searchParams.get("Action")).toBeNull();
      expect(body.Action).toBe("DescribeGitBranches");
      expect(body.DepotId).toBe(6);

      return new Response(
        JSON.stringify({
          Response: {
            Branches: [
              {
                BranchName: "master",
                IsDefaultBranch: true,
                IsProtected: false,
                Sha: "sha-master",
              },
            ],
            RequestId: "req-git-branches",
            TotalCount: 1,
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

    const result = await describeGitBranches(client, {
      DepotId: 6,
    });

    expect(result.RequestId).toBe("req-git-branches");
    expect(result.TotalCount).toBe(1);
    expect(result.Branches?.[0]?.BranchName).toBe("master");
  });
});