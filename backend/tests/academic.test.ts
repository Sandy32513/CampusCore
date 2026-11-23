import { describe, it, expect, beforeAll, beforeEach } from "vitest";
import request from "supertest";
import { createApp } from "../src/app.js";

describe("Academic Year & Semester Integration Tests (V10)", () => {
  const app = createApp();
  let adminCookie: string;
  let studentCookie: string;
  let createdYearId: string;
  let fixtureCounter = 0;

  beforeAll(async () => {
    const adminLogin = await request(app)
      .post("/api/v1/auth/login")
      .send({ email: "admin@campuscore.edu", password: "Admin@123456" });
    adminCookie = adminLogin.headers["set-cookie"][0].split(";")[0];

    // Create student user
    await request(app)
      .post("/api/v1/users")
      .set("Cookie", adminCookie)
      .send({
        email: "academic.student@campuscore.edu",
        password: "StudentPass123!",
        firstName: "Academic",
        lastName: "Student",
        role: "STUDENT"
      });

    const studentLogin = await request(app)
      .post("/api/v1/auth/login")
      .send({ email: "academic.student@campuscore.edu", password: "StudentPass123!" });
    studentCookie = studentLogin.headers["set-cookie"][0].split(";")[0];
  });

  beforeEach(async () => {
    fixtureCounter += 1;
    const year = await request(app)
      .post("/api/v1/academic-years")
      .set("Cookie", adminCookie)
      .send({
        name: `QA-2027-${fixtureCounter}`,
        startDate: "2027-08-01",
        endDate: "2028-06-30",
        isCurrent: false
      });
    expect(year.status).toBe(201);
    createdYearId = year.body.data.academicYear.id;
  });

  it("GET /api/v1/academic-years should return list of academic years", async () => {
    const res = await request(app)
      .get("/api/v1/academic-years")
      .set("Cookie", adminCookie);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.academicYears).toBeInstanceOf(Array);
    expect(res.body.data.academicYears.length).toBeGreaterThanOrEqual(1);
  });

  it("GET /api/v1/academic-years/current should return current active academic year", async () => {
    const res = await request(app)
      .get("/api/v1/academic-years/current")
      .set("Cookie", studentCookie);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.academicYear.isCurrent).toBe(true);
    expect(res.body.data.academicYear.semesters).toBeInstanceOf(Array);
  });

  it("POST /api/v1/academic-years as Student should be rejected with 403 Forbidden", async () => {
    const res = await request(app)
      .post("/api/v1/academic-years")
      .set("Cookie", studentCookie)
      .send({
        name: "2027-2028",
        startDate: "2027-08-01",
        endDate: "2028-06-30"
      });

    expect(res.status).toBe(403);
    expect(res.body.success).toBe(false);
  });

  it("POST /api/v1/academic-years with invalid dates (start >= end) should fail validation", async () => {
    const res = await request(app)
      .post("/api/v1/academic-years")
      .set("Cookie", adminCookie)
      .send({
        name: "Invalid Year",
        startDate: "2028-06-30",
        endDate: "2027-08-01"
      });

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
    expect(res.body.error.code).toBe("VALIDATION_ERROR");
  });

  it("POST /api/v1/academic-years as Admin should create a new academic year", async () => {
    const res = await request(app)
      .post("/api/v1/academic-years")
      .set("Cookie", adminCookie)
      .send({
        name: "2027-2028",
        startDate: "2027-08-01",
        endDate: "2028-06-30",
        isCurrent: false
      });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.academicYear.name).toBe("2027-2028");
    createdYearId = res.body.data.academicYear.id;
  });

  it("PATCH /api/v1/academic-years/:id/set-current should set year as current", async () => {
    const res = await request(app)
      .patch(`/api/v1/academic-years/${createdYearId}/set-current`)
      .set("Cookie", adminCookie);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.academicYear.isCurrent).toBe(true);

    // Verify current year changed
    const currentRes = await request(app)
      .get("/api/v1/academic-years/current")
      .set("Cookie", adminCookie);
    expect(currentRes.body.data.academicYear.id).toBe(createdYearId);

    const resetCurrent = await request(app)
      .patch("/api/v1/academic-years/1/set-current")
      .set("Cookie", adminCookie);
    expect(resetCurrent.status).toBe(200);
  });

  it("POST /api/v1/academic-years/:yearId/semesters should reject dates outside academic year bounds", async () => {
    const res = await request(app)
      .post(`/api/v1/academic-years/${createdYearId}/semesters`)
      .set("Cookie", adminCookie)
      .send({
        name: "Out of Bounds Semester",
        termNumber: 1,
        startDate: "2026-01-01",
        endDate: "2026-05-01"
      });

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
    expect(res.body.error.code).toBe("DATE_OUT_OF_BOUNDS");
  });

  it("POST /api/v1/academic-years/:yearId/semesters as Admin should create semester", async () => {
    const res = await request(app)
      .post(`/api/v1/academic-years/${createdYearId}/semesters`)
      .set("Cookie", adminCookie)
      .send({
        name: "Fall 2027 QA",
        termNumber: 1,
        startDate: "2027-08-15",
        endDate: "2027-12-15",
        isActive: false
      });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.semester.name).toBe("Fall 2027 QA");
    expect(res.body.data.semester.termNumber).toBe(1);
  });

  it("PATCH /api/v1/semesters/:id/activate should activate semester", async () => {
    const semester = await request(app)
      .post(`/api/v1/academic-years/${createdYearId}/semesters`)
      .set("Cookie", adminCookie)
      .send({
        name: "Fall 2027 Activation QA",
        termNumber: 1,
        startDate: "2027-08-15",
        endDate: "2027-12-15",
        isActive: false
      });
    expect(semester.status).toBe(201);
    const semesterId = semester.body.data.semester.id;

    const res = await request(app)
      .patch(`/api/v1/semesters/${semesterId}/activate`)
      .set("Cookie", adminCookie);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.semester.isActive).toBe(true);
  });
});
