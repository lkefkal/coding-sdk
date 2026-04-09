import { describe, expect, it, vi } from "vitest";

import { describeGitTagsByBranch } from "../../src/apis/git/describeGitTagsByBranch.js";
import { createCodingClient } from "../../src/client/createCodingClient.js";

describe("接口测试（describeGitTagsByBranch）", () => {
  it("会在 body 中发送 Action，并返回解码后的标签名称列表", async () => {
    const fetchMock = vi.fn(async (input: URL | RequestInfo, init?: RequestInit) => {
      const body = JSON.parse(String(init?.body));
      const url = new URL(String(input));

      expect(url.searchParams.get("Action")).toBeNull();
      expect(body.Action).toBe("DescribeGitTagsByBranch");
      expect(body.DepotId).toBe(6);
      expect(body.Branch).toBe("master");

      return new Response(
        JSON.stringify({
          Response: {
            RequestId: "req-git-tags-by-branch",
            Tags: ["v1.0.0", "v1.1.0"],
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

    const result = await describeGitTagsByBranch(client, {
      Branch: "master",
      DepotId: 6,
    });

    expect(result.RequestId).toBe("req-git-tags-by-branch");
    expect(result.Tags).toEqual(["v1.0.0", "v1.1.0"]);
  });
});