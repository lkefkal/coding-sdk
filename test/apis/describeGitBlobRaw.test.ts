import { describe, expect, it, vi } from "vitest";

import { describeGitBlobRaw } from "../../src/apis/git/describeGitBlobRaw.js";
import { createCodingClient } from "../../src/client/createCodingClient.js";

describe("接口测试（describeGitBlobRaw）", () => {
  it("会在 body 中发送 Action，并返回解码后的 Blob 原始内容", async () => {
    const fetchMock = vi.fn(async (input: URL | RequestInfo, init?: RequestInit) => {
      const body = JSON.parse(String(init?.body));
      const url = new URL(String(input));

      expect(url.searchParams.get("Action")).toBeNull();
      expect(body.Action).toBe("DescribeGitBlobRaw");
      expect(body.DepotId).toBe(6);
      expect(body.BlobSha).toBe("blob-sha");

      return new Response(
        JSON.stringify({
          Response: {
            Content: "raw blob content",
            RequestId: "req-git-blob-raw",
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

    const result = await describeGitBlobRaw(client, {
      BlobSha: "blob-sha",
      DepotId: 6,
    });

    expect(result.RequestId).toBe("req-git-blob-raw");
    expect(result.Content).toBe("raw blob content");
  });
});