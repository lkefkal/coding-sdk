import { describe, expect, it, vi } from "vitest";

import { describeIssueLogList } from "../../src/apis/issues/describeIssueLogList.js";
import { createCodingClient } from "../../src/client/createCodingClient.js";

describe("describeIssueLogList", () => {
  it("会返回解码后的事项活动日志列表", async () => {
    const fetchMock = vi.fn(async (input: URL | RequestInfo, init?: RequestInit) => {
      const body = JSON.parse(String(init?.body));
      const url = new URL(String(input));

      expect(url.searchParams.get("Action")).toBeNull();
      expect(body.Action).toBe("DescribeIssueLogList");
      expect(body.IssueCode).toBe(5213);

      return new Response(
        JSON.stringify({
          Response: {
            IssueLogList: [
              {
                ActionType: "UPDATE",
                Content: "状态由未开始变为进行中",
                CreateAt: 1710000000,
                Creator: 1,
                IssueId: 5213,
                Target: "STATUS",
                TargetName: "状态",
                UpdatedAt: 1710000001,
              },
            ],
            RequestId: "req-issue-log-list",
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

    const result = await describeIssueLogList(client, {
      ActionType: "UPDATE",
      IssueCode: 5213,
      ProjectName: "test",
      Target: "STATUS",
    });

    expect(result.RequestId).toBe("req-issue-log-list");
    expect(result.IssueLogList).toHaveLength(1);
    expect(result.IssueLogList?.[0]?.TargetName).toBe("状态");
  });
});