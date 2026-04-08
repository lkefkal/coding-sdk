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

export function unwrapCodingResponse(
  value: unknown,
  action: string,
): UnwrappedCodingResponse {
  if (!isRecord(value)) {
    throw new DecodeError(
      `CODING response for ${action} must be an object`,
      {
        action,
        phase: "envelope",
      },
    );
  }

  const response = value.Response;

  if (!isRecord(response)) {
    throw new DecodeError(
      `CODING response for ${action} is missing the Response envelope`,
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
        : `CODING API action ${action} failed`;

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