import { describe, expect, it, vi } from "vitest";

import { describeGitFileStat } from "../../src/apis/git/describeGitFileStat.js";
import { createCodingClient } from "../../src/client/createCodingClient.js";

describe("接口测试（describeGitFileStat）", () => {
  it("会同时在 query 和 body 中发送 Action，并返回解码后的文件存在性", async () => {
    const fetchMock = vi.fn(async (input: URL | RequestInfo, init?: RequestInit) => {
      const body = JSON.parse(String(init?.body));
      const url = new URL(String(input));

      expect(url.searchParams.get("Action")).toBe("DescribeGitFileStat");
      expect(body.Action).toBe("DescribeGitFileStat");
      expect(body.DepotPath).toBe("team/project/repo");
      expect(body.Path).toBe("README.md");
      expect(body.Ref).toBe("master");

      return new Response(
        JSON.stringify({
          Response: {
            Payload: {
              IsExist: true,
            },
            RequestId: "req-git-file-stat",
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

    const result = await describeGitFileStat(client, {
      DepotPath: "team/project/repo",
      Path: "README.md",
      Ref: "master",
    });

    expect(result.RequestId).toBe("req-git-file-stat");
    expect(result.Payload.IsExist).toBe(true);
  });
});