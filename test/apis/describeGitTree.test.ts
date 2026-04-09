import { describe, expect, it, vi } from "vitest";

import { describeGitTree } from "../../src/apis/git/describeGitTree.js";
import { createCodingClient } from "../../src/client/createCodingClient.js";

describe("接口测试（describeGitTree）", () => {
  it("会在 body 中发送 Action，并返回解码后的树结构", async () => {
    const fetchMock = vi.fn(async (input: URL | RequestInfo, init?: RequestInit) => {
      const body = JSON.parse(String(init?.body));
      const url = new URL(String(input));

      expect(url.searchParams.get("Action")).toBeNull();
      expect(body.Action).toBe("DescribeGitTree");
      expect(body.DepotId).toBe(6);
      expect(body.Ref).toBe("master");
      expect(body.IsRecursive).toBe(false);

      return new Response(
        JSON.stringify({
          Response: {
            RequestId: "req-git-tree",
            Trees: [
              {
                Mode: "100644",
                Path: "README.md",
                Sha: "blob-sha",
                Type: "blob",
              },
            ],
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

    const result = await describeGitTree(client, {
      DepotId: 6,
      IsRecursive: false,
      Ref: "master",
    });

    expect(result.RequestId).toBe("req-git-tree");
    expect(result.Trees[0]?.Type).toBe("blob");
  });
});