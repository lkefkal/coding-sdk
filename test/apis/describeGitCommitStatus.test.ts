import { describe, expect, it, vi } from "vitest";

import { describeGitCommitStatus } from "../../src/apis/git/describeGitCommitStatus.js";
import { createCodingClient } from "../../src/client/createCodingClient.js";

describe("接口测试（describeGitCommitStatus）", () => {
  it("会在 body 中发送 Action，并返回解码后的提交状态列表", async () => {
    const fetchMock = vi.fn(async (input: URL | RequestInfo, init?: RequestInit) => {
      const body = JSON.parse(String(init?.body));
      const url = new URL(String(input));

      expect(url.searchParams.get("Action")).toBeNull();
      expect(body.Action).toBe("DescribeGitCommitStatus");
      expect(body.DepotId).toBe(6);
      expect(body.CommitSha).toBe("commit-sha");

      return new Response(
        JSON.stringify({
          Response: {
            RequestId: "req-git-commit-status",
            StatusCheckResults: [
              {
                CommitSha: "commit-sha",
                Context: "ci/build",
                CreateDate: 1703142386000,
                DepotId: 6,
                Description: "构建成功",
                State: "COMMIT_STATE_SUCCESS",
                TargetURL: "https://coding.example/p/project/ci/job/1/build/1/pipeline",
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

    const result = await describeGitCommitStatus(client, {
      CommitSha: "commit-sha",
      DepotId: 6,
    });

    expect(result.RequestId).toBe("req-git-commit-status");
    expect(result.StatusCheckResults?.[0]?.State).toBe("COMMIT_STATE_SUCCESS");
    expect(result.StatusCheckResults?.[0]?.TargetURL).toContain("/pipeline");
  });
});