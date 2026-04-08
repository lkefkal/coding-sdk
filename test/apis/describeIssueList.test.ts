import { describe, expect, it, vi } from "vitest";

import { describeIssueList } from "../../src/apis/issues/describeIssueList.js";
import { createCodingClient } from "../../src/client/createCodingClient.js";

describe("describeIssueList", () => {
  it("sends Action in the body and returns decoded issues", async () => {
    const fetchMock = vi.fn(async (input: URL | RequestInfo, init?: RequestInit) => {
      const body = JSON.parse(String(init?.body));
      const url = new URL(String(input));

      expect(url.searchParams.get("Action")).toBeNull();
      expect(body.Action).toBe("DescribeIssueList");
      expect(body.ProjectName).toBe("demo-project");

      return new Response(
        JSON.stringify({
          Response: {
            RequestId: "req-issues",
            IssueList: [
              {
                Code: 27,
                Name: "test-20200826-1",
                Type: "REQUIREMENT",
                Description: "",
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

    const result = await describeIssueList(client, {
      IssueType: "ALL",
      Limit: 10,
      Offset: 0,
      ProjectName: "demo-project",
      SortKey: "CODE",
      SortValue: "DESC",
    });

    expect(result.RequestId).toBe("req-issues");
    expect(result.IssueList).toHaveLength(1);
    expect(result.IssueList[0]?.Code).toBe(27);
  });
});