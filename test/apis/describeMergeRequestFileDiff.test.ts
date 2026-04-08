import { describe, expect, it, vi } from "vitest";

import { describeMergeRequestFileDiff } from "../../src/apis/mergeRequests/describeMergeRequestFileDiff.js";
import { createCodingClient } from "../../src/client/createCodingClient.js";

describe("接口测试（describeMergeRequestFileDiff）", () => {
  it("会在 body 中发送 Action，并返回解码后的文件修改记录", async () => {
    const fetchMock = vi.fn(async (input: URL | RequestInfo, init?: RequestInit) => {
      const body = JSON.parse(String(init?.body));
      const url = new URL(String(input));

      expect(url.searchParams.get("Action")).toBeNull();
      expect(body.Action).toBe("DescribeMergeRequestFileDiff");
      expect(body.MergeId).toBe(14);

      return new Response(
        JSON.stringify({
          Response: {
            MergeRequestFileDiff: {
              Deletions: 1,
              FileDiffs: [
                {
                  ChangeType: "MODIFY",
                  Deletions: 1,
                  DiffLines: [
                    {
                      Index: 0,
                      LeftNo: 0,
                      Prefix: "@@",
                      RightNo: 0,
                      Text: "@@ -1 +1,2 @@\n",
                    },
                  ],
                  Insertions: 2,
                  ObjectId: "eca17c1d2c9bf173632e632652af9438640965ae",
                  Path: "README.md",
                },
              ],
              Insertions: 2,
              NewSha: "b07628f387da9e6a4b2102707259c9c9546c172b",
              OldSha: "7433afcdccecf433d19587e6c7d58d0edf0e30f9",
            },
            RequestId: "req-merge-request-file-diff",
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

    const result = await describeMergeRequestFileDiff(client, {
      DepotId: 9,
      MergeId: 14,
    });

    expect(result.RequestId).toBe("req-merge-request-file-diff");
    expect(result.MergeRequestFileDiff.FileDiffs).toHaveLength(1);
    expect(result.MergeRequestFileDiff.FileDiffs[0]?.Path).toBe("README.md");
  });
});