import { describe, expect, it, vi } from "vitest";

import { describeGitCommitDiff } from "../../src/apis/git/describeGitCommitDiff.js";
import { createCodingClient } from "../../src/client/createCodingClient.js";

describe("接口测试（describeGitCommitDiff）", () => {
  it("会在 body 中发送 Action，并返回解码后的提交 diff", async () => {
    const fetchMock = vi.fn(async (input: URL | RequestInfo, init?: RequestInit) => {
      const body = JSON.parse(String(init?.body));
      const url = new URL(String(input));

      expect(url.searchParams.get("Action")).toBeNull();
      expect(body.Action).toBe("DescribeGitCommitDiff");
      expect(body.DepotId).toBe(6);
      expect(body.Sha).toBe("commit-sha");
      expect(body.Path).toBe("src/index.ts");

      return new Response(
        JSON.stringify({
          Response: {
            Diffs: [
              {
                ChangeType: "modify",
                Content: "@@ -1 +1 @@\n-console.log('old')\n+console.log('new')",
                Deletions: 1,
                Insertions: 1,
                Lines: [
                  {
                    Index: 0,
                    LeftNo: 1,
                    Prefix: "-",
                    RightNo: 0,
                    Text: "console.log('old')",
                  },
                  {
                    Index: 1,
                    LeftNo: 0,
                    Prefix: "+",
                    RightNo: 1,
                    Text: "console.log('new')",
                  },
                ],
                NewMode: "100644",
                OldMode: "100644",
                Path: "src/index.ts",
              },
            ],
            RequestId: "req-git-commit-diff",
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

    const result = await describeGitCommitDiff(client, {
      DepotId: 6,
      Path: "src/index.ts",
      Sha: "commit-sha",
    });

    expect(result.RequestId).toBe("req-git-commit-diff");
    expect(result.Diffs?.[0]?.ChangeType).toBe("modify");
    expect(result.Diffs?.[0]?.Lines[1]?.Prefix).toBe("+");
  });
});