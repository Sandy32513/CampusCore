import type { Knex } from "knex";
import type { UserDto } from "@campuscore/shared";

export type StudentReadScope =
  | { kind: "all" }
  | { kind: "self"; userId: string }
  | { kind: "deny" };

export function studentReadScope(user: Pick<UserDto, "id" | "role">): StudentReadScope {
  switch (user.role) {
    case "SUPER_ADMIN":
    case "ADMIN":
    case "TEACHER":
    case "STAFF":
      return { kind: "all" };
    case "STUDENT":
      return { kind: "self", userId: user.id };
    case "PARENT":
      // V6 has not supplied a consent-backed parent/student relationship yet.
      return { kind: "deny" };
  }
}

export function applyStudentReadScope<TRecord extends object, TResult>(
  query: Knex.QueryBuilder<TRecord, TResult>,
  scope: Exclude<StudentReadScope, { kind: "deny" }>
): Knex.QueryBuilder<TRecord, TResult> {
  return scope.kind === "self" ? query.where("s.user_id", scope.userId) : query;
}
