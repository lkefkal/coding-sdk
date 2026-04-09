import { describe, expect, it, vi } from "vitest";

import { describeDepotDefaultBranch } from "../../src/apis/git/describeDepotDefaultBranch.js";
import { createCodingClient } from "../../src/client/createCodingClient.js";

describe("接口测试（describeDepotDefaultBranch）", () => {
  it("会同时在 query 和 body 中发送 Action，并返回解码后的默认分支", async () => {
    const fetchMock = vi.fn(async (input: URL | RequestInfo, init?: RequestInit) => {
      const body = JSON.parse(String(init?.body));
      const url = new URL(String(input));

      expect(url.searchParams.get("Action")).toBe("DescribeDepotDefaultBranch");
      expect(body.Action).toBe("DescribeDepotDefaultBranch");
      expect(body.DepotPath).toBe("team/project/repo");

      return new Response(
        JSON.stringify({
          Response: {
            BranchName: "master",
            RequestId: "req-depot-default-branch",
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

    const result = await describeDepotDefaultBranch(client, {
      DepotPath: "team/project/repo",
    });

    expect(result.RequestId).toBe("req-depot-default-branch");
    expect(result.BranchName).toBe("master");
  });
});