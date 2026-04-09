import { describe, expect, it, vi } from "vitest";

import { describeGitFile } from "../../src/apis/git/describeGitFile.js";
import { createCodingClient } from "../../src/client/createCodingClient.js";

describe("接口测试（describeGitFile）", () => {
  it("会在 body 中发送 Action，并返回解码后的文件详情", async () => {
    const fetchMock = vi.fn(async (input: URL | RequestInfo, init?: RequestInit) => {
      const body = JSON.parse(String(init?.body));
      const url = new URL(String(input));

      expect(url.searchParams.get("Action")).toBeNull();
      expect(body.Action).toBe("DescribeGitFile");
      expect(body.DepotId).toBe(6);
      expect(body.Ref).toBe("master");
      expect(body.Path).toBe("README.md");

      return new Response(
        JSON.stringify({
          Response: {
            GitFile: {
              Content: "IyBjb2Rpbmctc2Rr",
              ContentSha256: "sha256-value",
              Encoding: "base64",
              FileName: "README.md",
              FilePath: "README.md",
              Sha: "blob-sha",
              Size: 14,
            },
            RequestId: "req-git-file",
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

    const result = await describeGitFile(client, {
      DepotId: 6,
      Path: "README.md",
      Ref: "master",
    });

    expect(result.RequestId).toBe("req-git-file");
    expect(result.GitFile?.FileName).toBe("README.md");
  });
});