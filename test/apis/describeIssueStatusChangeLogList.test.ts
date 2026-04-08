import { describe, expect, it, vi } from "vitest";

import { describeIssueStatusChangeLogList } from "../../src/apis/issues/describeIssueStatusChangeLogList.js";
import { createCodingClient } from "../../src/client/createCodingClient.js";

describe("describeIssueStatusChangeLogList", () => {
  it("会返回解码后的事项状态变更记录", async () => {
    const fetchMock = vi.fn(async (input: URL | RequestInfo, init?: RequestInit) => {
      const body = JSON.parse(String(init?.body));
      const url = new URL(String(input));

      expect(url.searchParams.get("Action")).toBeNull();
      expect(body.Action).toBe("DescribeIssueStatusChangeLogList");
      expect(body.IssueCode).toEqual([5213]);

      return new Response(
        JSON.stringify({
          Response: {
            Logs: {
              List: [
                {
                  CreatedAt: 1710000000,
                  IssueCode: 5213,
                  IssueStatus: {
                    CreatedAt: 1710000000,
                    Description: "处理中",
                    Id: 3,
                    Index: 2,
                    IsSystem: true,
                    Name: "进行中",
                    Type: "PROCESSING",
                    UpdatedAt: 1710003600,
                  },
                  StatusId: 3,
                  StatusName: "进行中",
                },
              ],
            },
            RequestId: "req-issue-status-change-log-list",
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

    const result = await describeIssueStatusChangeLogList(client, {
      IssueCode: [5213],
      ProjectName: "test",
    });

    expect(result.RequestId).toBe("req-issue-status-change-log-list");
    expect(result.Logs?.List).toHaveLength(1);
    expect(result.Logs?.List?.[0]?.IssueStatus?.Name).toBe("进行中");
  });
});