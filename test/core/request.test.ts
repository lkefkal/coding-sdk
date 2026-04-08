import { describe, expect, it, vi } from "vitest";

import { createCodingClient } from "../../src/client/createCodingClient.js";
import { defineActionSpec } from "../../src/core/actionSpec.js";
import {
  CodingApiError,
  TransportError,
  TimeoutError,
  UnauthorizedError,
} from "../../src/core/errors.js";
import { Schema } from "effect";

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

describe("请求调用测试（invokeAction）", () => {
  it("会解包 Response 包装层并返回解码后的负载", async () => {
    const fetchMock = vi.fn(async () =>
      new Response(
        JSON.stringify({
          Response: {
            RequestId: "req-1",
            Value: "ok",
          },
        }),
        { status: 200 },
      ),
    );
    const client = createCodingClient({
      baseUrl: "https://e.coding.net/open-api",
      fetch: fetchMock,
      token: "token-value",
    });

    const result = await client.invoke(spec, {
      ProjectName: "demo",
    });

    expect(result.Value).toBe("ok");
    expect(result.RequestId).toBe("req-1");
  });

  it("会把 CODING Response.Error 映射为带标签的业务错误", async () => {
    const client = createCodingClient({
      baseUrl: "https://e.coding.net/open-api",
      fetch: async () =>
        new Response(
          JSON.stringify({
            Response: {
              RequestId: "req-api",
              Error: {
                Code: "InvalidParameter",
                Message: "bad request",
              },
            },
          }),
          { status: 200 },
        ),
      token: "token-value",
    });

    await expect(
      client.invoke(spec, {
        ProjectName: "demo",
      }),
    ).rejects.toBeInstanceOf(CodingApiError);
  });

  it("会把 HTTP 401 映射为 UnauthorizedError", async () => {
    const client = createCodingClient({
      baseUrl: "https://e.coding.net/open-api",
      fetch: async () => new Response("nope", { status: 401, statusText: "Unauthorized" }),
      token: "token-value",
    });

    await expect(
      client.invoke(spec, {
        ProjectName: "demo",
      }),
    ).rejects.toBeInstanceOf(UnauthorizedError);
  });

  it("会把超时导致的中断映射为 TimeoutError", async () => {
    const fetchMock = vi.fn(
      (_input: URL | RequestInfo, init?: RequestInit) =>
        new Promise<Response>((_resolve, reject) => {
          init?.signal?.addEventListener("abort", () => {
            reject(new DOMException("Aborted", "AbortError"));
          });
        }),
    );

    const client = createCodingClient({
      baseUrl: "https://e.coding.net/open-api",
      fetch: fetchMock,
      token: "token-value",
      timeoutMs: 10,
    });

    await expect(
      client.invoke(spec, {
        ProjectName: "demo",
      }),
    ).rejects.toBeInstanceOf(TimeoutError);
  });

  it("当调用方主动取消进行中的请求时不会继续重试", async () => {
    const controller = new AbortController();
    const fetchMock = vi.fn(
      (_input: URL | RequestInfo, init?: RequestInit) =>
        new Promise<Response>((_resolve, reject) => {
          if (init?.signal?.aborted) {
            reject(new DOMException("Aborted", "AbortError"));
            return;
          }

          init?.signal?.addEventListener(
            "abort",
            () => {
              reject(new DOMException("Aborted", "AbortError"));
            },
            { once: true },
          );
        }),
    );

    const client = createCodingClient({
      baseUrl: "https://e.coding.net/open-api",
      fetch: fetchMock,
      token: "token-value",
      retry: {
        maxAttempts: 3,
      },
    });

    const result = client.invoke(
      spec,
      {
        ProjectName: "demo",
      },
      {
        signal: controller.signal,
      },
    );

    controller.abort();

    await expect(result).rejects.toBeInstanceOf(TransportError);
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });

  it("启用重试后会重试普通传输失败", async () => {
    const fetchMock = vi
      .fn<typeof fetch>()
      .mockRejectedValueOnce(new TypeError("network down"))
      .mockResolvedValueOnce(
        new Response(
          JSON.stringify({
            Response: {
              RequestId: "req-2",
              Value: "ok-after-retry",
            },
          }),
          { status: 200 },
        ),
      );

    const client = createCodingClient({
      baseUrl: "https://e.coding.net/open-api",
      fetch: fetchMock,
      token: "token-value",
      retry: {
        maxAttempts: 2,
        baseDelayMs: 0,
        maxDelayMs: 0,
      },
    });

    await expect(
      client.invoke(spec, {
        ProjectName: "demo",
      }),
    ).resolves.toEqual({
      RequestId: "req-2",
      Value: "ok-after-retry",
    });

    expect(fetchMock).toHaveBeenCalledTimes(2);
  });
});