import { describe, expect, it, vi } from "vitest";

import { describeGitTags } from "../../src/apis/git/describeGitTags.js";
import { createCodingClient } from "../../src/client/createCodingClient.js";

describe("接口测试（describeGitTags）", () => {
  it("会在 body 中发送 Action，并返回解码后的标签列表", async () => {
    const fetchMock = vi.fn(async (input: URL | RequestInfo, init?: RequestInit) => {
      const body = JSON.parse(String(init?.body));
      const url = new URL(String(input));

      expect(url.searchParams.get("Action")).toBeNull();
      expect(body.Action).toBe("DescribeGitTags");
      expect(body.DepotId).toBe(6);

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
                  Sha: "sha-tag-v1",
                  ShortMessage: "发布 v1.0.0",
                },
                Message: "发布 v1.0.0",
                TagName: "v1.0.0",
              },
              {
                Commit: {
                  AuthorEmail: "example@example.com",
                  AuthorName: "coding",
                  CommitDate: 1703142486000,
                  CommitterEmail: "example@example.com",
                  CommitterName: "coding",
                  CreatedAt: 1703142486000,
                  Parents: ["sha-tag-v1"],
                  Sha: "sha-tag-v2",
                  ShortMessage: "发布 v1.1.0",
                },
                Message: "发布 v1.1.0",
                TagName: "v1.1.0",
              },
            ],
            RequestId: "req-git-tags",
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

    const result = await describeGitTags(client, {
      DepotId: 6,
    });

    expect(result.RequestId).toBe("req-git-tags");
    expect(result.GitTags).toHaveLength(2);
    expect(result.GitTags[1]?.TagName).toBe("v1.1.0");
  });
});