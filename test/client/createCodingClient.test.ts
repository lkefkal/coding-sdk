import { describe, expect, it } from "vitest";
import { Schema } from "effect";

import { createCodingClient } from "../../src/client/createCodingClient.js";
import { defineActionSpec } from "../../src/core/actionSpec.js";

const requestSchema = Schema.Struct({
  ProjectName: Schema.String,
});

const responseSchema = Schema.Struct({
  RequestId: Schema.String,
  Value: Schema.String,
});

const spec = defineActionSpec({
  action: "TestAction",
  actionPlacement: "body",
  requestSchema,
  responseSchema,
});

describe("客户端创建测试（createCodingClient）", () => {
  it("会复制默认请求头与鉴权配置，避免创建后受外部突变影响", async () => {
    const auth = {
      scheme: "Bearer",
      value: "initial-token",
    };
    const headers = {
      "X-Test": "initial-header",
    };

    const fetchMock = async (_input: URL | RequestInfo, init?: RequestInit) => {
      const actualHeaders = new Headers(init?.headers);

      expect(actualHeaders.get("Authorization")).toBe("Bearer initial-token");
      expect(actualHeaders.get("X-Test")).toBe("initial-header");

      return new Response(
        JSON.stringify({
          Response: {
            RequestId: "req-headers-auth",
            Value: "ok",
          },
        }),
        { status: 200 },
      );
    };

    const client = createCodingClient({
      auth,
      baseUrl: "https://e.coding.net/open-api",
      fetch: fetchMock,
      headers,
    });

    auth.value = "mutated-token";
    headers["X-Test"] = "mutated-header";

    await expect(
      client.invoke(spec, {
        ProjectName: "demo",
      }),
    ).resolves.toEqual({
      RequestId: "req-headers-auth",
      Value: "ok",
    });
  });

  it("会复制重试数组，避免创建后受外部配置突变影响", async () => {
    const retryableStatusCodes = [503];
    const retryableTags = ["TimeoutError"];
    let attempts = 0;

    const fetchMock = async () => {
      attempts += 1;

      if (attempts === 1) {
        return new Response("busy", {
          status: 503,
          statusText: "Service Unavailable",
        });
      }

      return new Response(
        JSON.stringify({
          Response: {
            RequestId: "req-retry-snapshot",
            Value: "ok-after-retry",
          },
        }),
        { status: 200 },
      );
    };

    const client = createCodingClient({
      baseUrl: "https://e.coding.net/open-api",
      fetch: fetchMock,
      retry: {
        baseDelayMs: 0,
        maxAttempts: 2,
        maxDelayMs: 0,
        retryableStatusCodes,
        retryableTags,
      },
      token: "token-value",
    });

    retryableStatusCodes.length = 0;
    retryableTags.length = 0;

    await expect(
      client.invoke(spec, {
        ProjectName: "demo",
      }),
    ).resolves.toEqual({
      RequestId: "req-retry-snapshot",
      Value: "ok-after-retry",
    });

    expect(attempts).toBe(2);
  });
});