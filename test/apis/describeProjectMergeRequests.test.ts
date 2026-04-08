import { describe, expect, it, vi } from "vitest";

import { createCodingClient } from "../../src/client/createCodingClient.js";
import { describeProjectMergeRequests } from "../../src/apis/projects/describeProjectMergeRequests.js";

describe("接口测试（describeProjectMergeRequests）", () => {
  it("会在 body 中发送 Action，并返回解码后的项目合并请求列表", async () => {
    const fetchMock = vi.fn(async (input: URL | RequestInfo, init?: RequestInit) => {
      const body = JSON.parse(String(init?.body));
      const url = new URL(String(input));

      expect(url.searchParams.get("Action")).toBeNull();
      expect(body.Action).toBe("DescribeProjectMergeRequests");
      expect(body.ProjectId).toBe(52);

      return new Response(
        JSON.stringify({
          Response: {
            Data: {
              List: [
                {
                  ActionAt: 1703231818000,
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
                  CreatedAt: 1703231818000,
                  DepotId: 9,
                  Describe: "",
                  Granted: 0,
                  Id: 11,
                  Labels: [],
                  MergeCommitSha: "58734a0dc6dc12b1490cf02bb789ec2e454fe946",
                  MergeId: 18,
                  Path: "/p/zyx/d/depot/git/merge/18",
                  ProjectId: 52,
                  Reminded: false,
                  Reviewers: [],
                  SourceBranch: "master-patch-4",
                  SourceBranchSha: "37464c4cce09bb9f9b572d15c6b336315ce9a4b6",
                  Status: "CANMERGE",
                  StickingPoint: "PASS",
                  TargetBranch: "master",
                  TargetBranchProtected: false,
                  TargetBranchSha: "3a80ce3199caaa14c18eaa87bdef8929327b3c53",
                  Title: "更新文件 README.md",
                  UpdateAt: 1703232622000,
                },
              ],
              PageNumber: 1,
              PageSize: 10,
              TotalPage: 1,
              TotalRow: 1,
            },
            RequestId: "req-project-merge-requests",
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

    const result = await describeProjectMergeRequests(client, {
      PageNumber: 1,
      PageSize: 10,
      ProjectId: 52,
    });

    expect(result.RequestId).toBe("req-project-merge-requests");
    expect(result.Data.List?.[0]?.MergeId).toBe(18);
  });
});