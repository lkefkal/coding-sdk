export type CodingSdkErrorTag =
  | "TransportError"
  | "HttpError"
  | "CodingApiError"
  | "DecodeError"
  | "UnauthorizedError"
  | "TimeoutError";

export interface CodingSdkErrorDetails {
  readonly action?: string | undefined;
  readonly requestId?: string | undefined;
  readonly cause?: unknown;
}

export abstract class CodingSdkError extends Error {
  abstract readonly _tag: CodingSdkErrorTag;
  readonly action: string | undefined;
  readonly requestId: string | undefined;
  override readonly cause: unknown;

  constructor(message: string, details: CodingSdkErrorDetails = {}) {
    super(message);
    this.name = new.target.name;
    this.action = details.action;
    this.requestId = details.requestId;
    this.cause = details.cause;
  }
}

export class TransportError extends CodingSdkError {
  readonly _tag = "TransportError" as const;
}

export interface HttpErrorDetails extends CodingSdkErrorDetails {
  readonly statusCode: number;
  readonly statusText: string;
  readonly responseBody?: string | undefined;
}

export class HttpError extends CodingSdkError {
  readonly _tag = "HttpError" as const;
  readonly statusCode: number;
  readonly statusText: string;
  readonly responseBody: string | undefined;

  constructor(message: string, details: HttpErrorDetails) {
    super(message, details);
    this.statusCode = details.statusCode;
    this.statusText = details.statusText;
    this.responseBody = details.responseBody;
  }
}

export interface CodingApiErrorDetails extends CodingSdkErrorDetails {
  readonly code: string;
}

export class CodingApiError extends CodingSdkError {
  readonly _tag = "CodingApiError" as const;
  readonly code: string;

  constructor(message: string, details: CodingApiErrorDetails) {
    super(message, details);
    this.code = details.code;
  }
}

export interface UnauthorizedErrorDetails extends CodingSdkErrorDetails {
  readonly code?: string | undefined;
  readonly statusCode?: number | undefined;
}

export class UnauthorizedError extends CodingSdkError {
  readonly _tag = "UnauthorizedError" as const;
  readonly code: string | undefined;
  readonly statusCode: number | undefined;

  constructor(message: string, details: UnauthorizedErrorDetails = {}) {
    super(message, details);
    this.code = details.code;
    this.statusCode = details.statusCode;
  }
}

export interface DecodeErrorDetails extends CodingSdkErrorDetails {
  readonly phase: "request" | "response" | "json" | "envelope";
}

export class DecodeError extends CodingSdkError {
  readonly _tag = "DecodeError" as const;
  readonly phase: "request" | "response" | "json" | "envelope";

  constructor(message: string, details: DecodeErrorDetails) {
    super(message, details);
    this.phase = details.phase;
  }
}

export class TimeoutError extends CodingSdkError {
  readonly _tag = "TimeoutError" as const;
}

export function isCodingSdkError(error: unknown): error is CodingSdkError {
  return error instanceof CodingSdkError;
}

export function toErrorMessage(error: unknown): string {
  if (error instanceof Error && error.message.length > 0) {
    return error.message;
  }

  if (typeof error === "string" && error.length > 0) {
    return error;
  }

  return "Unknown error";
}