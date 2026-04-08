import { describe, expect, it, vi } from "vitest";

import { describeIssueWorkLogList } from "../../src/apis/issues/describeIssueWorkLogList.js";
import { createCodingClient } from "../../src/client/createCodingClient.js";

describe("接口测试（describeIssueWorkLogList）", () => {
  it("会返回解码后的事项工时日志列表", async () => {
    const fetchMock = vi.fn(async (input: URL | RequestInfo, init?: RequestInit) => {
      const body = JSON.parse(String(init?.body));
      const url = new URL(String(input));

      expect(url.searchParams.get("Action")).toBeNull();
      expect(body.Action).toBe("DescribeIssueWorkLogList");
      expect(body.IssueCode).toBe(5213);

      return new Response(
        JSON.stringify({
          Response: {
            RequestId: "req-issue-work-log-list",
            WorkLogs: [
              {
                CreatedAt: 1710000000,
                Id: 1,
                IssueCode: 5213,
                IssueId: 9,
                ProjectName: "test",
                RecordHours: 2,
                RemainingHours: 6,
                StartAt: 1710000000,
                UpdatedAt: 1710003600,
                UserId: 3,
                WorkingDesc: "补充联调记录",
              },
            ],
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

    const result = await describeIssueWorkLogList(client, {
      IssueCode: 5213,
      ProjectName: "test",
    });

    expect(result.RequestId).toBe("req-issue-work-log-list");
    expect(result.WorkLogs).toHaveLength(1);
    expect(result.WorkLogs[0]?.WorkingDesc).toBe("补充联调记录");
  });
});