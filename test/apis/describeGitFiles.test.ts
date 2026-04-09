import { describe, expect, it, vi } from "vitest";

import { describeGitFiles } from "../../src/apis/git/describeGitFiles.js";
import { createCodingClient } from "../../src/client/createCodingClient.js";

describe("接口测试（describeGitFiles）", () => {
  it("会在 body 中发送 Action，并返回解码后的目录项列表", async () => {
    const fetchMock = vi.fn(async (input: URL | RequestInfo, init?: RequestInit) => {
      const body = JSON.parse(String(init?.body));
      const url = new URL(String(input));

      expect(url.searchParams.get("Action")).toBeNull();
      expect(body.Action).toBe("DescribeGitFiles");
      expect(body.DepotId).toBe(6);
      expect(body.Ref).toBe("master");

      return new Response(
        JSON.stringify({
          Response: {
            Items: [
              {
                Mode: "file",
                Name: "README.md",
                Path: "README.md",
                Sha: "blob-sha",
              },
            ],
            RequestId: "req-git-files",
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

    const result = await describeGitFiles(client, {
      DepotId: 6,
      Ref: "master",
    });

    expect(result.RequestId).toBe("req-git-files");
    expect(result.Items[0]?.Name).toBe("README.md");
  });
});