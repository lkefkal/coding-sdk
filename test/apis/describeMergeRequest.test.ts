import { describe, expect, it, vi } from "vitest";

import { describeMergeRequest } from "../../src/apis/mergeRequests/describeMergeRequest.js";
import { createCodingClient } from "../../src/client/createCodingClient.js";

describe("接口测试（describeMergeRequest）", () => {
  it("会在 body 中发送 Action，并返回解码后的合并请求详情", async () => {
    const fetchMock = vi.fn(async (input: URL | RequestInfo, init?: RequestInit) => {
      const body = JSON.parse(String(init?.body));
      const url = new URL(String(input));

      expect(url.searchParams.get("Action")).toBeNull();
      expect(body.Action).toBe("DescribeMergeRequest");
      expect(body.MergeId).toBe(14);

      return new Response(
        JSON.stringify({
          Response: {
            MergeRequestInfo: {
              ActionAt: 1703146788000,
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
              Conflicts: [],
              CreatedAt: 1703146788000,
              DepotId: 9,
              Describe: "",
              Granted: 0,
              Id: 7,
              Labels: [],
              MergeCommitSha: "00a63fdb71a48be17c4a3e563251a82bbe03cf2c",
              MergeId: 14,
              Mission: {
                Code: 0,
                Link: "",
                TargetId: 0,
                TargetProjectName: "",
                TargetType: "",
                Title: "",
              },
              Path: "/p/zyx/d/depot/git/merge/14",
              ProjectId: 52,
              Reminded: false,
              Reviewers: [],
              SourceBranch: "master-patch-1",
              SourceBranchSha: "b07628f387da9e6a4b2102707259c9c9546c172b",
              Status: "CANMERGE",
              StickingPoint: "PASS",
              TargetBranch: "master",
              TargetBranchProtected: false,
              TargetBranchSha: "7433afcdccecf433d19587e6c7d58d0edf0e30f9",
              Title: "更新文件 README.md",
              UpdatedAt: 1703146788000,
            },
            RequestId: "req-merge-request-detail",
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

    const result = await describeMergeRequest(client, {
      DepotId: 9,
      MergeId: 14,
    });

    expect(result.RequestId).toBe("req-merge-request-detail");
    expect(result.MergeRequestInfo.MergeId).toBe(14);
    expect(result.MergeRequestInfo.Status).toBe("CANMERGE");
  });
});