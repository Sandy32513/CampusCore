import { randomUUID } from "node:crypto";
import type { Request, Response, NextFunction } from "express";
import { ApiErrorResponse } from "@campuscore/shared";

const databaseConnectionCodes = new Set([
  "ECONNREFUSED",
  "ECONNRESET",
  "ETIMEDOUT",
  "EHOSTUNREACH",
  "ENOTFOUND",
  "PROTOCOL_CONNECTION_LOST",
  "PROTOCOL_ENQUEUE_AFTER_FATAL_ERROR",
  "ER_CON_COUNT_ERROR"
]);

interface ErrorDetails {
  code?: unknown;
  name?: unknown;
  type?: unknown;
}

function getErrorDetails(error: unknown): ErrorDetails {
  return typeof error === "object" && error !== null ? error as ErrorDetails : {};
}

function getRequestId(req: Request): string {
  const requestId = req.headers["x-request-id"];
  return typeof requestId === "string" && requestId.trim() ? requestId : randomUUID();
}

export function errorHandler(
  err: unknown,
  req: Request,
  res: Response<ApiErrorResponse>,
  _next: NextFunction
) {
  void _next;
  const details = getErrorDetails(err);
  const isDatabaseUnavailable =
    (typeof details.code === "string" && databaseConnectionCodes.has(details.code)) ||
    details.name === "KnexTimeoutError";
  const isInvalidJson = details.type === "entity.parse.failed";
  const isOversizedBody = details.type === "entity.too.large";
  const statusCode = isDatabaseUnavailable ? 503 : isInvalidJson ? 400 : isOversizedBody ? 413 : 500;
  const code = isDatabaseUnavailable
    ? "DB_UNAVAILABLE"
    : isInvalidJson
      ? "INVALID_JSON"
      : isOversizedBody
        ? "PAYLOAD_TOO_LARGE"
        : "INTERNAL_SERVER_ERROR";
  const message = isDatabaseUnavailable
    ? "The database is temporarily unavailable. Please try again."
    : isInvalidJson
      ? "Request body must contain valid JSON."
      : isOversizedBody
        ? "Request body exceeds the maximum allowed size."
        : "An unexpected error occurred";
  const requestId = getRequestId(req);
  if (typeof res.setHeader === "function") res.setHeader("X-Request-Id", requestId);

  res.status(statusCode).json({
    success: false,
    error: {
      code,
      message,
      requestId
    }
  });
}
