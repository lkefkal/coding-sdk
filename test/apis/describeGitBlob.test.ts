import { describe, expect, it, vi } from "vitest";

import { describeGitBlob } from "../../src/apis/git/describeGitBlob.js";
import { createCodingClient } from "../../src/client/createCodingClient.js";

describe("接口测试（describeGitBlob）", () => {
  it("会在 body 中发送 Action，并返回解码后的 Blob 详情", async () => {
    const fetchMock = vi.fn(async (input: URL | RequestInfo, init?: RequestInit) => {
      const body = JSON.parse(String(init?.body));
      const url = new URL(String(input));

      expect(url.searchParams.get("Action")).toBeNull();
      expect(body.Action).toBe("DescribeGitBlob");
      expect(body.DepotId).toBe(6);
      expect(body.BlobSha).toBe("blob-sha");

      return new Response(
        JSON.stringify({
          Response: {
            Data: {
              BlobSha: "blob-sha",
              Content: "YmFzZTY0LWNvbnRlbnQ=",
              Encoding: "base64",
              Size: 14,
            },
            RequestId: "req-git-blob",
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

    const result = await describeGitBlob(client, {
      BlobSha: "blob-sha",
      DepotId: 6,
    });

    expect(result.RequestId).toBe("req-git-blob");
    expect(result.Data.Encoding).toBe("base64");
  });
});