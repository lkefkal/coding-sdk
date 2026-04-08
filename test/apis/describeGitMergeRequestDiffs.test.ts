import { describe, expect, it, vi } from "vitest";

import { describeGitMergeRequestDiffs } from "../../src/apis/mergeRequests/describeGitMergeRequestDiffs.js";
import { createCodingClient } from "../../src/client/createCodingClient.js";

describe("接口测试（describeGitMergeRequestDiffs）", () => {
  it("会在 body 中发送 Action，并返回解码后的 diff 概览", async () => {
    const fetchMock = vi.fn(async (input: URL | RequestInfo, init?: RequestInit) => {
      const body = JSON.parse(String(init?.body));
      const url = new URL(String(input));

      expect(url.searchParams.get("Action")).toBeNull();
      expect(body.Action).toBe("DescribeGitMergeRequestDiffs");
      expect(body.MergeId).toBe(14);

      return new Response(
        JSON.stringify({
          Response: {
            Diff: {
              Deletions: 0,
              Insertions: 1,
              IsLarge: false,
              NewSha: "e06ebced0f890db2265b8362b3e3f24f30374413",
              OldSha: "125e0345107601d7e3d451032e6a40ecf0b4c548",
              Paths: [
                {
                  BlobSha: "81f4282e8e0bcd8f765ca96b7ef2b8b9050f4a97",
                  ChangeType: "ADD",
                  Deletions: 0,
                  Insertions: 1,
                  Path: "src/qw.js",
                  Size: 2,
                },
              ],
            },
            RequestId: "req-merge-request-diffs",
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

    const result = await describeGitMergeRequestDiffs(client, {
      DepotId: 9,
      MergeId: 14,
    });

    expect(result.RequestId).toBe("req-merge-request-diffs");
    expect(result.Diff?.Paths?.[0]?.Path).toBe("src/qw.js");
  });
});