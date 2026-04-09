import { describe, expect, it, vi } from "vitest";

import { describeGitCommitNote } from "../../src/apis/git/describeGitCommitNote.js";
import { createCodingClient } from "../../src/client/createCodingClient.js";

describe("接口测试（describeGitCommitNote）", () => {
  it("会在 body 中发送 Action，并返回解码后的提交注释", async () => {
    const fetchMock = vi.fn(async (input: URL | RequestInfo, init?: RequestInit) => {
      const body = JSON.parse(String(init?.body));
      const url = new URL(String(input));

      expect(url.searchParams.get("Action")).toBeNull();
      expect(body.Action).toBe("DescribeGitCommitNote");
      expect(body.DepotId).toBe(6);
      expect(body.CommitSha).toBe("commit-sha");
      expect(body.NotesRef).toBe("refs/notes/commits");

      return new Response(
        JSON.stringify({
          Response: {
            CommitNote: "这次提交修复了分页边界问题",
            RequestId: "req-git-commit-note",
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

    const result = await describeGitCommitNote(client, {
      CommitSha: "commit-sha",
      DepotId: 6,
      NotesRef: "refs/notes/commits",
    });

    expect(result.RequestId).toBe("req-git-commit-note");
    expect(result.CommitNote).toBe("这次提交修复了分页边界问题");
  });
});