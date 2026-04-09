import { describe, expect, it, vi } from "vitest";

import { describeGitTagsBySha } from "../../src/apis/git/describeGitTagsBySha.js";
import { createCodingClient } from "../../src/client/createCodingClient.js";

describe("接口测试（describeGitTagsBySha）", () => {
  it("会在 body 中发送 Action，并返回解码后的提交标签列表", async () => {
    const fetchMock = vi.fn(async (input: URL | RequestInfo, init?: RequestInit) => {
      const body = JSON.parse(String(init?.body));
      const url = new URL(String(input));

      expect(url.searchParams.get("Action")).toBeNull();
      expect(body.Action).toBe("DescribeGitTagsBySha");
      expect(body.DepotId).toBe(6);
      expect(body.Sha).toBe("sha-master");

      return new Response(
        JSON.stringify({
          Response: {
            GitTags: [
              {
                Commit: {
                  AuthorEmail: "example@example.com",
                  AuthorName: "coding",
                  CommitDate: 1703142386000,
                  CommitterEmail: "example@example.com",
                  CommitterName: "coding",
                  CreatedAt: 1703142386000,
                  Parents: [],
                  Sha: "sha-master",
                  ShortMessage: "发布 v1.0.0",
                },
                Message: "发布 v1.0.0",
                TagName: "v1.0.0",
              },
            ],
            RequestId: "req-git-tags-by-sha",
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

    const result = await describeGitTagsBySha(client, {
      DepotId: 6,
      Sha: "sha-master",
    });

    expect(result.RequestId).toBe("req-git-tags-by-sha");
    expect(result.GitTags?.[0]?.TagName).toBe("v1.0.0");
  });
});