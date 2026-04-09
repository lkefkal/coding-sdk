import { describe, expect, it, vi } from "vitest";

import { describeGitTag } from "../../src/apis/git/describeGitTag.js";
import { createCodingClient } from "../../src/client/createCodingClient.js";

describe("接口测试（describeGitTag）", () => {
  it("会在 body 中发送 Action，并返回解码后的单个标签详情", async () => {
    const fetchMock = vi.fn(async (input: URL | RequestInfo, init?: RequestInit) => {
      const body = JSON.parse(String(init?.body));
      const url = new URL(String(input));

      expect(url.searchParams.get("Action")).toBeNull();
      expect(body.Action).toBe("DescribeGitTag");
      expect(body.DepotId).toBe(6);
      expect(body.TagName).toBe("v1.0.0");

      return new Response(
        JSON.stringify({
          Response: {
            GitTag: {
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
            RequestId: "req-git-tag",
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

    const result = await describeGitTag(client, {
      DepotId: 6,
      TagName: "v1.0.0",
    });

    expect(result.RequestId).toBe("req-git-tag");
    expect(result.GitTag.TagName).toBe("v1.0.0");
    expect(result.GitTag.Commit.ShortMessage).toBe("发布 v1.0.0");
  });
});