import "../../src/middleware/asyncErrors.js";
import express from "express";
import request from "supertest";
import { errorHandler } from "../../src/middleware/errorHandler.js";

describe("async Express route failures", () => {
  it("forwards a rejected route promise to the central error handler", async () => {
    const app = express();
    app.get("/failure", async () => {
      throw Object.assign(new Error("internal connection details"), { code: "ECONNREFUSED" });
    });
    app.use(errorHandler);

    const response = await request(app).get("/failure").set("X-Request-Id", "route-request-456");

    expect(response.status).toBe(503);
    expect(response.body.error).toEqual({
      code: "DB_UNAVAILABLE",
      message: "The database is temporarily unavailable. Please try again.",
      requestId: "route-request-456"
    });
  });
});
