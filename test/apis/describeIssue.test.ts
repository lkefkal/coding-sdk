import { describe, expect, it, vi } from "vitest";

import { describeIssue } from "../../src/apis/issues/describeIssue.js";
import { createCodingClient } from "../../src/client/createCodingClient.js";

describe("接口测试（describeIssue）", () => {
  it("会返回解码后的事项详情", async () => {
    const fetchMock = vi.fn(async (input: URL | RequestInfo, init?: RequestInit) => {
      const body = JSON.parse(String(init?.body));
      const url = new URL(String(input));

      expect(url.searchParams.get("Action")).toBeNull();
      expect(body.Action).toBe("DescribeIssue");
      expect(body.IssueCode).toBe(5213);

      return new Response(
        JSON.stringify({
          Response: {
            RequestId: "req-issue-detail",
            Issue: {
              Assignee: {
                Avatar: "",
                Email: "",
                GlobalKey: "",
                Id: 1,
                Name: "处理人",
                Phone: "",
                Status: 1,
                TeamGlobalKey: "",
                TeamId: 0,
              },
              Assignees: [],
              Code: 5213,
              CompletedAt: 0,
              CreatedAt: 1710000000,
              Creator: {
                Avatar: "",
                Email: "",
                GlobalKey: "",
                Id: 2,
                Name: "创建人",
                Phone: "",
                Status: 1,
                TeamGlobalKey: "",
                TeamId: 0,
              },
              CustomFields: [],
              DefectType: {
                IconUrl: "",
                Id: 0,
                Name: "",
              },
              Description: "事项详情",
              DueDate: 0,
              Epic: {
                Assignee: null,
                Code: 0,
                IssueStatusId: null,
                IssueStatusName: null,
                Name: "",
                Priority: null,
                Type: "",
              },
              Files: [],
              IssueStatusId: 10,
              IssueStatusName: "未开始",
              IssueStatusType: "TODO",
              IssueTypeDetail: {
                Description: "任务",
                Id: 8500457,
                IsSystem: true,
                IssueType: "MISSION",
                Name: "任务",
              },
              IssueTypeId: 8500457,
              Iteration: {
                Code: 0,
                Id: 0,
                Name: "",
                Status: "",
              },
              IterationId: 0,
              Labels: [],
              Name: "事项详情标题",
              Parent: {
                Assignee: {
                  Avatar: "",
                  Email: "",
                  GlobalKey: "",
                  Id: 0,
                  Name: "",
                  Phone: "",
                  Status: 0,
                  TeamGlobalKey: "",
                  TeamId: 0,
                },
                Code: 0,
                IssueStatusId: 0,
                IssueStatusName: "",
                IssueStatusType: "",
                IssueTypeDetail: {
                  Description: "",
                  Id: 0,
                  IsSystem: false,
                  IssueType: "",
                  Name: "",
                },
                Name: "",
                Priority: null,
                Type: "",
              },
              ParentType: "MISSION",
              Priority: "1",
              Project: {
                Archived: false,
                CreatedAt: 0,
                Description: "",
                DisplayName: "test",
                EndDate: 0,
                Icon: "",
                Id: 11934829,
                IsDemo: false,
                MaxMember: 0,
                Name: "test",
                ProgramIds: [],
                StartDate: 0,
                Status: 0,
                TeamId: 0,
                TeamOwnerId: 0,
                Type: 0,
                UpdatedAt: 0,
                UserOwnerId: 0,
              },
              ProjectModule: {
                Id: 0,
                Name: "",
              },
              RequirementType: {
                Id: 0,
                Name: "",
              },
              StartDate: 0,
              StoryPoint: "",
              SubTasks: [],
              ThirdLinks: [],
              Type: "MISSION",
              UpdatedAt: 1710000100,
              Watchers: [],
              WorkingHours: 0,
            },
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

    const result = await describeIssue(client, {
      IssueCode: 5213,
      ProjectName: "test",
      ShowImageOutUrl: false,
    });

    expect(result.RequestId).toBe("req-issue-detail");
    expect(result.Issue.Code).toBe(5213);
    expect(result.Issue.IssueTypeDetail.Name).toBe("任务");
  });
});