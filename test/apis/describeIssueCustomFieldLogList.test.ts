import { describe, expect, it, vi } from "vitest";

import { describeIssueCustomFieldLogList } from "../../src/apis/issues/describeIssueCustomFieldLogList.js";
import { createCodingClient } from "../../src/client/createCodingClient.js";

describe("describeIssueCustomFieldLogList", () => {
  it("会返回解码后的事项自定义属性变更日志", async () => {
    const fetchMock = vi.fn(async (input: URL | RequestInfo, init?: RequestInit) => {
      const body = JSON.parse(String(init?.body));
      const url = new URL(String(input));

      expect(url.searchParams.get("Action")).toBeNull();
      expect(body.Action).toBe("DescribeIssueCustomFieldLogList");
      expect(body.FieldName).toBe("测试成员");

      return new Response(
        JSON.stringify({
          Response: {
            FieldChangeLogList: [
              {
                ActionType: "UPDATE",
                Creator: 3,
                FieldId: 55,
                FieldName: "测试成员",
                FieldType: "TEXT_SINGLE_LINE",
                FieldValue: "成员2",
                IssueId: 26,
                UpdatedAt: 1703594277000,
              },
            ],
            RequestId: "req-issue-custom-field-log-list",
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

    const result = await describeIssueCustomFieldLogList(client, {
      FieldName: "测试成员",
      IssueCode: 5213,
      ProjectName: "test",
    });

    expect(result.RequestId).toBe("req-issue-custom-field-log-list");
    expect(result.FieldChangeLogList).toHaveLength(1);
    expect(result.FieldChangeLogList?.[0]?.FieldValue).toBe("成员2");
  });
});