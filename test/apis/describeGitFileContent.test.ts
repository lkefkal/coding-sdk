import { describe, expect, it, vi } from "vitest";

import { describeGitFileContent } from "../../src/apis/git/describeGitFileContent.js";
import { createCodingClient } from "../../src/client/createCodingClient.js";

describe("接口测试（describeGitFileContent）", () => {
  it("会在 body 中发送 Action，并返回解码后的提交文件内容", async () => {
    const fetchMock = vi.fn(async (input: URL | RequestInfo, init?: RequestInit) => {
      const body = JSON.parse(String(init?.body));
      const url = new URL(String(input));

      expect(url.searchParams.get("Action")).toBeNull();
      expect(body.Action).toBe("DescribeGitFileContent");
      expect(body.DepotId).toBe(6);
      expect(body.CommitSha).toBe("commit-sha");
      expect(body.Path).toBe("README.md");

      return new Response(
        JSON.stringify({
          Response: {
            GitFileContent: {
              Content: "IyBjb2Rpbmctc2Rr",
              IsLargeFileStorage: false,
              IsLfs: false,
              IsText: true,
            },
            RequestId: "req-git-file-content",
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

    const result = await describeGitFileContent(client, {
      CommitSha: "commit-sha",
      DepotId: 6,
      Path: "README.md",
    });

    expect(result.RequestId).toBe("req-git-file-content");
    expect(result.GitFileContent.IsText).toBe(true);
  });
});