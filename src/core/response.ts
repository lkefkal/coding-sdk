import {
  CodingApiError,
  DecodeError,
  UnauthorizedError,
} from "./errors.js";

export interface UnwrappedCodingResponse {
  readonly requestId: string | undefined;
  readonly payload: Record<string, unknown>;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

/**
 * 解包 CODING Open API 的统一 Response 包装层。
 *
 * @param value 原始响应体。
 * @param action 当前调用的 action 名称。
 * @returns 解包后的业务负载与请求 ID。
 * @throws {DecodeError} 当响应结构不符合统一包装约定时抛出。
 * @throws {UnauthorizedError} 当响应中包含鉴权相关业务错误时抛出。
 * @throws {CodingApiError} 当响应中包含显式业务错误时抛出。
 */
export function unwrapCodingResponse(
  value: unknown,
  action: string,
): UnwrappedCodingResponse {
  if (!isRecord(value)) {
    throw new DecodeError(
      `${action} 的 CODING 响应必须是对象`,
      {
        action,
        phase: "envelope",
      },
    );
  }

  const response = value.Response;

  if (!isRecord(response)) {
    throw new DecodeError(
      `${action} 的 CODING 响应缺少 Response 包装层`,
      {
        action,
        phase: "envelope",
      },
    );
  }

  const requestId =
    typeof response.RequestId === "string" ? response.RequestId : undefined;
  const error = response.Error;

  if (isRecord(error) && typeof error.Code === "string") {
    const message =
      typeof error.Message === "string"
        ? error.Message
        : `CODING API action ${action} 调用失败`;

    if (
      error.Code === "AuthFailure" ||
      error.Code === "UnauthorizedOperation"
    ) {
      throw new UnauthorizedError(message, {
        action,
        code: error.Code,
        requestId,
      });
    }

    throw new CodingApiError(message, {
      action,
      code: error.Code,
      requestId,
    });
  }

  return {
    requestId,
    payload: response,
  };
}