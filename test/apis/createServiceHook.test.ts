import { describe, expect, it, vi } from "vitest";

import { createServiceHook } from "../../src/apis/serviceHooks/createServiceHook.js";
import { createCodingClient } from "../../src/client/createCodingClient.js";

describe("接口测试（createServiceHook）", () => {
  it("会返回解码后的 Service Hook 创建结果", async () => {
    const fetchMock = vi.fn(async (input: URL | RequestInfo, init?: RequestInit) => {
      const body = JSON.parse(String(init?.body));
      const url = new URL(String(input));

      expect(url.searchParams.get("Action")).toBeNull();
      expect(body.Action).toBe("CreateServiceHook");
      expect(body.Service).toBe("WeCom");
      expect(body.Event).toEqual(["ISSUE_CREATED"]);

      return new Response(
        JSON.stringify({
          Response: {
            RequestId: "req-create-hook",
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
              Event: ["ISSUE_CREATED"],
              EventLabel: ["创建事项"],
              FilterProperties: "{}",
              Id: "hook-created",
              LastSucceedAt: 0,
              Name: "新建 Hook",
              Service: "WeCom",
              ServiceName: "企业微信",
              Status: 0,
              TargetId: 1001,
              TargetType: "PROJECT",
              UpdatedAt: 1710000000,
              UpdatedBy: 1,
              UpdatedByUser: {
                Avatar: "https://example.com/avatar.png",
                Id: 1,
                Name: "示例用户",
                NamePinyin: "shiliyonghu",
              },
              Version: 1,
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

    const result = await createServiceHook(client, {
      ActionProperty: "{}",
      Enabled: true,
      Event: ["ISSUE_CREATED"],
      ProjectId: 1001,
      Service: "WeCom",
      ServiceAction: "wecom_group_chat_robot",
      TargetType: "PROJECT",
    });

    expect(result.RequestId).toBe("req-create-hook");
    expect(result.ServiceHook.Id).toBe("hook-created");
  });
});