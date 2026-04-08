import { describe, expect, it, vi } from "vitest";

import { createCodingClient } from "../../src/client/createCodingClient.js";
import { describeProjectCredentials } from "../../src/apis/projects/describeProjectCredentials.js";

describe("describeProjectCredentials", () => {
  it("会在 body 中发送 Action，并返回解码后的项目凭据列表", async () => {
    const fetchMock = vi.fn(async (input: URL | RequestInfo, init?: RequestInit) => {
      const body = JSON.parse(String(init?.body));
      const url = new URL(String(input));

      expect(url.searchParams.get("Action")).toBeNull();
      expect(body.Action).toBe("DescribeProjectCredentials");
      expect(body.ProjectId).toBe(12);

      return new Response(
        JSON.stringify({
          Response: {
            Data: {
              CredentialList: [
                {
                  CredentialId: "a9d83657-c4d5-480b-9c22-3f26ce1ff525",
                  Name: "凭据名",
                },
                {
                  CredentialId: "bafc85f6-68ff-49a4-8ae5-e0dbcb814301",
                  Name: "凭据名2",
                },
              ],
            },
            RequestId: "req-project-credentials",
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

    const result = await describeProjectCredentials(client, {
      ProjectId: 12,
    });

    expect(result.RequestId).toBe("req-project-credentials");
    expect(result.Data.CredentialList).toHaveLength(2);
    expect(result.Data.CredentialList[0]?.Name).toBe("凭据名");
  });
});