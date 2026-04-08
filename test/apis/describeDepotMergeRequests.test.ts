import { describe, expect, it, vi } from "vitest";

import { describeDepotMergeRequests } from "../../src/apis/mergeRequests/describeDepotMergeRequests.js";
import { createCodingClient } from "../../src/client/createCodingClient.js";

describe("describeDepotMergeRequests", () => {
  it("会同时在 query 和 body 中发送 Action，并返回解码后的合并请求列表", async () => {
    const fetchMock = vi.fn(async (input: URL | RequestInfo, init?: RequestInit) => {
      const body = JSON.parse(String(init?.body));
      const url = new URL(String(input));

      expect(url.searchParams.get("Action")).toBe("DescribeDepotMergeRequests");
      expect(body.Action).toBe("DescribeDepotMergeRequests");
      expect(body.DepotId).toBe(6);

      return new Response(
        JSON.stringify({
          Response: {
            Data: {
              List: [
                {
                  ActionAt: 1703127300000,
                  ActionAuthor: {
                    Avatar: "/static/fruit_avatar/Fruit-20.png",
                    Email: "example@example.com",
                    GlobalKey: "coding-coding",
                    Id: 2,
                    Name: "coding",
                    Status: "INACTIVE",
                    TeamId: 0,
                  },
                  Author: {
                    Avatar: "/static/fruit_avatar/Fruit-20.png",
                    Email: "example@example.com",
                    GlobalKey: "coding-coding",
                    Id: 2,
                    Name: "coding",
                    Status: "INACTIVE",
                    TeamId: 0,
                  },
                  BaseSha: "",
                  CommentCount: 0,
                  CreatedAt: 1703127300000,
                  DepotId: 6,
                  Describe: "",
                  Granted: 0,
                  Id: 6,
                  Labels: [],
                  MergeCommitSha: "",
                  MergeId: 13,
                  Path: "/p/zyx/d/repo_01/git/merge/13",
                  ProjectId: 52,
                  Reminded: false,
                  Reviewers: [],
                  SourceBranch: "master-patch-5",
                  SourceBranchSha: "82e5044e6065852117e5db4f9820c45cdb40e981",
                  Status: "CANNOTMERGE",
                  StickingPoint: "MERGE_FAILED",
                  TargetBranch: "master",
                  TargetBranchProtected: false,
                  TargetBranchSha: "f6c97b661e77740ad7d9126ccf017498b4a5cedd",
                  Title: "更新文件 README.md",
                  UpdateAt: 1703225649000,
                },
              ],
              PageNumber: 1,
              PageSize: 10,
              TotalPage: 1,
              TotalRow: 1,
            },
            RequestId: "req-merge-request-list",
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

    const result = await describeDepotMergeRequests(client, {
      DepotId: 6,
      PageNumber: 1,
      PageSize: 10,
    });

    expect(result.RequestId).toBe("req-merge-request-list");
    expect(result.Data.List).toHaveLength(1);
    expect(result.Data.List?.[0]?.MergeId).toBe(13);
  });
});