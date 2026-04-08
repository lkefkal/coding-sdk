import { describe, expect, it, vi } from "vitest";

import { describeIssueReferenceResources } from "../../src/apis/issues/describeIssueReferenceResources.js";
import { createCodingClient } from "../../src/client/createCodingClient.js";

describe("describeIssueReferenceResources", () => {
  it("会返回解码后的事项引用资源列表", async () => {
    const fetchMock = vi.fn(async (input: URL | RequestInfo, init?: RequestInit) => {
      const body = JSON.parse(String(init?.body));
      const url = new URL(String(input));

      expect(url.searchParams.get("Action")).toBeNull();
      expect(body.Action).toBe("DescribeIssueReferenceResources");
      expect(body.ProjectId).toBe(1001);

      return new Response(
        JSON.stringify({
          Response: {
            Data: [
              {
                ProjectId: 1001,
                ProjectName: "test",
                ResourceCode: 77,
                ResourceId: 88,
                ResourceName: "缺陷 77",
                ResourceStatus: "进行中",
                ResourceType: "Defect",
              },
            ],
            RequestId: "req-issue-reference-resources",
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

    const result = await describeIssueReferenceResources(client, {
      IssueCode: 5213,
      ProjectId: 1001,
      ProjectName: "test",
    });

    expect(result.RequestId).toBe("req-issue-reference-resources");
    expect(result.Data).toHaveLength(1);
    expect(result.Data?.[0]?.ResourceType).toBe("Defect");
  });
});