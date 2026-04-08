import { describe, expect, it, vi } from "vitest";

import { describeGitMergeRequestDiffDetail } from "../../src/apis/mergeRequests/describeGitMergeRequestDiffDetail.js";
import { createCodingClient } from "../../src/client/createCodingClient.js";

describe("describeGitMergeRequestDiffDetail", () => {
  it("会在 body 中发送 Action，并返回解码后的单文件 diff 详情", async () => {
    const fetchMock = vi.fn(async (input: URL | RequestInfo, init?: RequestInit) => {
      const body = JSON.parse(String(init?.body));
      const url = new URL(String(input));

      expect(url.searchParams.get("Action")).toBeNull();
      expect(body.Action).toBe("DescribeGitMergeRequestDiffDetail");
      expect(body.Path).toBe("README.md");

      return new Response(
        JSON.stringify({
          Response: {
            Detail: {
              ChangeType: "modify",
              Content: "diff --git a/README.md b/README.md",
              Deletions: 1,
              Insertions: 2,
              Lines: [
                {
                  Index: 0,
                  LeftNo: 0,
                  Prefix: "@@",
                  RightNo: 0,
                  Text: "@@ -1 +1,2 @@\n",
                },
              ],
              NewMode: "100644",
              OldMode: "100644",
              Path: "README.md",
            },
            RequestId: "req-merge-request-diff-detail",
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

    const result = await describeGitMergeRequestDiffDetail(client, {
      DepotId: 9,
      MergeId: 14,
      Path: "README.md",
    });

    expect(result.RequestId).toBe("req-merge-request-diff-detail");
    expect(result.Detail.Path).toBe("README.md");
    expect(result.Detail.Lines[0]?.Text).toBe("@@ -1 +1,2 @@\n");
  });
});