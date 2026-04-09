import { describe, expect, it, vi } from "vitest";

import { describeGitRef } from "../../src/apis/git/describeGitRef.js";
import { createCodingClient } from "../../src/client/createCodingClient.js";

describe("接口测试（describeGitRef）", () => {
  it("会在 body 中发送 Action，并返回解码后的 ref 信息", async () => {
    const fetchMock = vi.fn(async (input: URL | RequestInfo, init?: RequestInit) => {
      const body = JSON.parse(String(init?.body));
      const url = new URL(String(input));

      expect(url.searchParams.get("Action")).toBeNull();
      expect(body.Action).toBe("DescribeGitRef");
      expect(body.DepotId).toBe(6);
      expect(body.Revision).toBe("master");

      return new Response(
        JSON.stringify({
          Response: {
            GitRef: {
              AnnotatedTag: false,
              DisplayName: "refs/heads/master",
              FullMessage: "初始化仓库\n",
              Name: "refs/heads/master",
              ObjectId: "sha-master",
              RefObjectId: "sha-master",
              ShortMessage: "初始化仓库",
            },
            RequestId: "req-git-ref",
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

    const result = await describeGitRef(client, {
      DepotId: 6,
      Revision: "master",
    });

    expect(result.RequestId).toBe("req-git-ref");
    expect(result.GitRef.DisplayName).toBe("refs/heads/master");
    expect(result.GitRef.AnnotatedTag).toBe(false);
  });
});