import type { NextFunction, Request, Response } from "express";
import type { ApiErrorResponse } from "@campuscore/shared";
import { errorHandler } from "../../src/middleware/errorHandler.js";
import { AuthService } from "../../src/services/authService.js";
import { requireAuth } from "../../src/middleware/auth.js";

function createResponse() {
  const state: { statusCode: number; body?: ApiErrorResponse } = { statusCode: 200 };
  const response = {
    get statusCode() {
      return state.statusCode;
    },
    status(code: number) {
      state.statusCode = code;
      return response;
    },
    json(body: ApiErrorResponse) {
      state.body = body;
      return response;
    }
  };
  return { response: response as unknown as Response<ApiErrorResponse>, state };
}

const next = (() => undefined) as NextFunction;

describe("central error handler", () => {
  it("returns a stable 503 contract for database connection failures", () => {
    const request = { headers: { "x-request-id": "request-123" } } as Request;
    const { response, state } = createResponse();
    const error = Object.assign(new Error("connect ECONNREFUSED 127.0.0.1:3306"), {
      code: "ECONNREFUSED"
    });

    errorHandler(error, request, response, next);

    expect(state.statusCode).toBe(503);
    expect(state.body?.error).toEqual({
      code: "DB_UNAVAILABLE",
      message: "The database is temporarily unavailable. Please try again.",
      requestId: "request-123"
    });
  });

  it("does not expose internal messages for unexpected errors", () => {
    const request = { headers: {} } as Request;
    const { response, state } = createResponse();

    errorHandler(new Error("SQL password=private-value"), request, response, next);

    expect(state.statusCode).toBe(500);
    expect(state.body?.error.message).toBe("An unexpected error occurred");
    expect(JSON.stringify(state.body)).not.toContain("private-value");
  });

  it("forwards rejected session validation to Express error handling", async () => {
    const error = new Error("database connection failed");
    const validateSession = vi.spyOn(AuthService, "validateSession").mockRejectedValue(error);
    const request = {
      headers: { cookie: "campuscore_session=session-token" }
    } as Request;
    const response = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn().mockReturnThis()
    } as unknown as Response;
    const next = vi.fn() as unknown as NextFunction;

    await expect(requireAuth(request, response, next)).resolves.toBeUndefined();
    expect(next).toHaveBeenCalledWith(error);
    validateSession.mockRestore();
  });
});
