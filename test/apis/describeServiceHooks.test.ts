import { describe, expect, it, vi } from "vitest";

import { createCodingClient } from "../../src/client/createCodingClient.js";
import { describeServiceHooks } from "../../src/apis/serviceHooks/describeServiceHooks.js";

describe("describeServiceHooks", () => {
  it("会通过稳定入口返回解码后的 Service Hook 分页结果", async () => {
    const fetchMock = vi.fn(async (input: URL | RequestInfo, init?: RequestInit) => {
      const body = JSON.parse(String(init?.body));
      const url = new URL(String(input));

      expect(url.searchParams.get("Action")).toBeNull();
      expect(body.Action).toBe("DescribeServiceHooks");
      expect(body.ProjectId).toBe(1001);

      return new Response(
        JSON.stringify({
          Response: {
            Data: {
              PageNumber: 1,
              PageSize: 20,
              ServiceHook: [
                {
                  Action: "Notify",
                  ActionLabel: "通知",
                  ActionProperties: "{}",
                  CreatedAt: 1710000000,
                  CreatorBy: 1,
                  CreatorByUser: {
                    Avatar: "https://example.com/avatar.png",
                    Id: 1,
                    Name: "示例用户",
                    NamePinyin: "shiliyonghu",
                  },
                  Enabled: true,
                  Event: ["ISSUE_CREATED"],
                  EventLabel: ["事项已创建"],
                  FilterProperties: "{}",
                  Id: "hook-1",
                  LastSucceedAt: 1710000100,
                  Name: "示例 Hook",
                  Service: "WebHook",
                  ServiceName: "Webhook",
                  Status: 1,
                  TargetId: 1001,
                  TargetType: "PROJECT",
                  UpdatedAt: 1710000200,
                  UpdatedBy: 2,
                  UpdatedByUser: {
                    Avatar: "https://example.com/avatar-2.png",
                    Id: 2,
                    Name: "更新用户",
                    NamePinyin: "gengxinyonghu",
                  },
                  Version: 3,
                },
              ],
              TotalCount: 1,
            },
            RequestId: "req-service-hooks",
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

    const result = await describeServiceHooks(client, {
      PageNumber: 1,
      PageSize: 20,
      ProjectId: 1001,
      TargetType: "PROJECT",
    });

    expect(result.RequestId).toBe("req-service-hooks");
    expect(result.Data.TotalCount).toBe(1);
    expect(result.Data.ServiceHook[0]?.Id).toBe("hook-1");
  });
});