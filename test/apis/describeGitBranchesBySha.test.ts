import { describe, expect, it, vi } from "vitest";

import { describeGitBranchesBySha } from "../../src/apis/git/describeGitBranchesBySha.js";
import { createCodingClient } from "../../src/client/createCodingClient.js";

describe("接口测试（describeGitBranchesBySha）", () => {
  it("会在 body 中发送 Action，并返回解码后的分支引用列表", async () => {
    const fetchMock = vi.fn(async (input: URL | RequestInfo, init?: RequestInit) => {
      const body = JSON.parse(String(init?.body));
      const url = new URL(String(input));

      expect(url.searchParams.get("Action")).toBeNull();
      expect(body.Action).toBe("DescribeGitBranchesBySha");
      expect(body.DepotId).toBe(6);
      expect(body.Sha).toBe("sha-master");

      return new Response(
        JSON.stringify({
          Response: {
            Refs: [
              {
                Ref: "master",
              },
              {
                Ref: "release/1.0",
              },
            ],
            RequestId: "req-git-branches-by-sha",
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

    const result = await describeGitBranchesBySha(client, {
      DepotId: 6,
      Sha: "sha-master",
    });

    expect(result.RequestId).toBe("req-git-branches-by-sha");
    expect(result.Refs).toHaveLength(2);
    expect(result.Refs[1]?.Ref).toBe("release/1.0");
  });
});