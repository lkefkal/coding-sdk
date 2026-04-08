import { Effect } from "effect";

import {
  CodingApiError,
  DecodeError,
  UnauthorizedError,
} from "./errors.js";

export interface UnwrappedCodingResponse {
  readonly requestId: string | undefined;
  readonly payload: Record<string, unknown>;
}

/**
 * 判断未知值是否为普通对象记录。
 *
 * @param value 待判断的未知值。
 * @returns 如果值是对象记录，则返回 true。
 */
function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

/**
 * 以 Effect 形式解包 CODING Open API 的统一 Response 包装层。
 *
 * @param value 原始响应体。
 * @param action 当前调用的 action 名称。
 * @returns 包含解包结果或稳定响应错误类型的 Effect。
 */
export function unwrapCodingResponseEffect(
  value: unknown,
  action: string,
): Effect.Effect<UnwrappedCodingResponse, CodingApiError | DecodeError | UnauthorizedError> {
  if (!isRecord(value)) {
    return Effect.fail(
      new DecodeError(`${action} 的 CODING 响应必须是对象`, {
        action,
        phase: "envelope",
      }),
    );
  }

  const response = value.Response;

  if (!isRecord(response)) {
    return Effect.fail(
      new DecodeError(`${action} 的 CODING 响应缺少 Response 包装层`, {
        action,
        phase: "envelope",
      }),
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
      return Effect.fail(
        new UnauthorizedError(message, {
          action,
          code: error.Code,
          requestId,
        }),
      );
    }

    return Effect.fail(
      new CodingApiError(message, {
        action,
        code: error.Code,
        requestId,
      }),
    );
  }

  return Effect.succeed({
    requestId,
    payload: response,
  });
}