import { describe, expect, it, vi } from "vitest";

import { modifyServiceHook } from "../../src/apis/serviceHooks/modifyServiceHook.js";
import { createCodingClient } from "../../src/client/createCodingClient.js";

describe("modifyServiceHook", () => {
  it("会返回解码后的 Service Hook 修改结果", async () => {
    const fetchMock = vi.fn(async (input: URL | RequestInfo, init?: RequestInit) => {
      const body = JSON.parse(String(init?.body));
      const url = new URL(String(input));

      expect(url.searchParams.get("Action")).toBeNull();
      expect(body.Action).toBe("ModifyServiceHook");
      expect(body.Id).toBe("hook-1");
      expect(body.Event).toEqual(["ISSUE_CREATED"]);

      return new Response(
        JSON.stringify({
          Response: {
            RequestId: "req-modify-hook",
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
              EventLabel: ["事项已创建"],
              FilterProperties: "{}",
              Id: "hook-1",
              LastSucceedAt: 0,
              Name: "修改后的 Hook",
              Service: "WeCom",
              ServiceName: "企业微信",
              Status: 0,
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

    const result = await modifyServiceHook(client, {
      ActionProperty: "{}",
      Enabled: true,
      Event: ["ISSUE_CREATED"],
      FilterProperty: "{}",
      Id: "hook-1",
      ProjectId: 1001,
      Service: "WeCom",
      ServiceAction: "wecom_group_chat_robot",
      TargetType: "PROJECT",
    });

    expect(result.RequestId).toBe("req-modify-hook");
    expect(result.ServiceHook.Name).toBe("修改后的 Hook");
  });
});