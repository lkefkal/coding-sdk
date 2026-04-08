import { describe, expect, it, vi } from "vitest";

import { createCodingClient } from "../../src/client/createCodingClient.js";
import { describeServiceHook } from "../../src/apis/serviceHooks/describeServiceHook.js";

describe("接口测试（describeServiceHook）", () => {
  it("会返回解码后的单个 Service Hook 详情", async () => {
    const fetchMock = vi.fn(async (input: URL | RequestInfo, init?: RequestInit) => {
      const body = JSON.parse(String(init?.body));
      const url = new URL(String(input));

      expect(url.searchParams.get("Action")).toBeNull();
      expect(body.Action).toBe("DescribeServiceHook");
      expect(body.Id).toBe("hook-1");

      return new Response(
        JSON.stringify({
          Response: {
            RequestId: "req-service-hook",
            ServiceHook: {
              Action: "wecom_group_chat_robot",
              ActionLabel: "发送到企业微信群聊",
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
              Event: ["GIT_PUSHED"],
              EventLabel: ["代码推送"],
              FilterProperties: "{}",
              Id: "hook-1",
              LastSucceedAt: 1710000100,
              Name: "示例 Hook",
              Service: "WeCom",
              ServiceName: "企业微信",
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

    const result = await describeServiceHook(client, {
      Id: "hook-1",
      ProjectId: 1001,
      TargetType: "PROJECT",
    });

    expect(result.RequestId).toBe("req-service-hook");
    expect(result.ServiceHook.Id).toBe("hook-1");
    expect(result.ServiceHook.Service).toBe("WeCom");
  });
});