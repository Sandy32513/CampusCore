import knex from "knex";
import { afterAll, describe, expect, it } from "vitest";
import { applyStudentReadScope, studentReadScope } from "../../src/access/studentReadScope.js";

const sqlBuilder = knex({ client: "mysql2" });

afterAll(async () => sqlBuilder.destroy());

describe("student read access scope", () => {
  it.each(["SUPER_ADMIN", "ADMIN", "TEACHER", "STAFF"] as const)(
    "%s receives the documented staff read scope",
    (role) => {
      expect(studentReadScope({ id: "7", role })).toEqual({ kind: "all" });
    }
  );

  it("limits student sessions to the linked student account", () => {
    const scope = studentReadScope({ id: "17", role: "STUDENT" });
    const query = applyStudentReadScope(sqlBuilder("students as s").select("s.id"), scope as Exclude<typeof scope, { kind: "deny" }>);

    expect(query.toSQL()).toMatchObject({
      sql: "select `s`.`id` from `students` as `s` where `s`.`user_id` = ?",
      bindings: ["17"]
    });
  });

  it("denies parent sessions until a consent-backed link exists", () => {
    expect(studentReadScope({ id: "18", role: "PARENT" })).toEqual({ kind: "deny" });
  });
});
