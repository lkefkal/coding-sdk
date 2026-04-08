import { describe, expect, it, vi } from "vitest";

import { createCodingClient } from "../../src/client/createCodingClient.js";
import { defineActionSpec } from "../../src/core/actionSpec.js";
import {
  CodingApiError,
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

describe("invokeAction", () => {
  it("unwraps the Response envelope and decodes the payload", async () => {
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

  it("maps CODING Response.Error to a tagged API error", async () => {
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

  it("maps HTTP 401 to UnauthorizedError", async () => {
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

  it("maps timeout aborts to TimeoutError", async () => {
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
});