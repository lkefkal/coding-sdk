import { describe, expect, it, vi } from "vitest";

import { describeGitCommitFilePathList } from "../../src/apis/git/describeGitCommitFilePathList.js";
import { createCodingClient } from "../../src/client/createCodingClient.js";

describe("接口测试（describeGitCommitFilePathList）", () => {
  it("会同时在 query 和 body 中发送 Action，并返回解码后的改动文件路径列表", async () => {
    const fetchMock = vi.fn(async (input: URL | RequestInfo, init?: RequestInit) => {
      const body = JSON.parse(String(init?.body));
      const url = new URL(String(input));

      expect(url.searchParams.get("Action")).toBe("DescribeGitCommitFilePathList");
      expect(body.Action).toBe("DescribeGitCommitFilePathList");
      expect(body.DepotPath).toBe("team/project/repo");
      expect(body.CommitSha).toBe("commit-sha");

      return new Response(
        JSON.stringify({
          Response: {
            FilePaths: [
              {
                NewPath: null,
                Path: "README.md",
                Type: "update",
              },
            ],
            RequestId: "req-git-commit-file-path-list",
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

    const result = await describeGitCommitFilePathList(client, {
      CommitSha: "commit-sha",
      DepotPath: "team/project/repo",
    });

    expect(result.RequestId).toBe("req-git-commit-file-path-list");
    expect(result.FilePaths?.[0]?.Type).toBe("update");
  });
});