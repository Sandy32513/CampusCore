import crypto from "node:crypto";
import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { Readable } from "node:stream";
import type { Knex } from "knex";
import { describe, expect, it, vi } from "vitest";
import { parseBackupSql, serializeSqlDumpValue, splitBackupSqlStatements, writeSqlDump } from "../../src/services/backupService.js";

describe("SQL backup serialization", () => {
  it("splits on statement delimiters outside quoted strings and ignores comments", () => {
    const statements = splitBackupSqlStatements(
      "-- header\nINSERT INTO `notes` (`body`) VALUES ('keep; this');\nSET FOREIGN_KEY_CHECKS=1;"
    );

    expect(statements).toEqual([
      "INSERT INTO `notes` (`body`) VALUES ('keep; this')",
      "SET FOREIGN_KEY_CHECKS=1"
    ]);
  });

  it("serializes JSON values as scalar SQL bindings", () => {
    expect(serializeSqlDumpValue({ message: "System initialized and seeded" })).toBe(
      '{"message":"System initialized and seeded"}'
    );
    expect(serializeSqlDumpValue(["first", "second"])).toBe('["first","second"]');
  });

  it("streams table schema and rows, then records a byte checksum and row manifest", async () => {
    const directory = await fs.mkdtemp(path.join(os.tmpdir(), "campuscore-backup-test-"));
    const filename = path.join(directory, "snapshot.sql");
    const dataRows = [{ id: 1, title: "Campus; Core" }];
    const raw = vi.fn((sql: string) => {
      let result: unknown;
      if (sql.startsWith("SELECT TABLE_NAME")) {
        result = [[{ tableName: "notes" }], []];
      } else if (sql.startsWith("SHOW CREATE TABLE")) {
        result = [[{ Table: "notes", "Create Table": "CREATE TABLE `notes` (`id` int NOT NULL, `title` text)" }], []];
      } else if (sql.startsWith("SHOW KEYS")) {
        result = [[], []];
      } else {
        result = [];
      }
      const promise = Promise.resolve(result);
      return Object.assign(promise, {
        toQuery: () => "INSERT INTO `notes` (`id`, `title`) VALUES (1, 'Campus; Core')"
      });
    });
    const dbFunction = vi.fn(() => {
      const builder = {
        select: vi.fn(() => builder),
        orderBy: vi.fn(() => builder),
        stream: vi.fn(() => Readable.from(dataRows))
      };
      return builder;
    });
    const db = Object.assign(dbFunction, { raw }) as unknown as Knex;

    try {
      const result = await writeSqlDump(db, filename, "FULL");
      const contents = await fs.readFile(filename);
      const parsed = parseBackupSql(contents);

      expect(result.size).toBe(contents.length);
      expect(result.checksum).toBe(crypto.createHash("sha256").update(contents).digest("hex"));
      expect(parsed.statements).toContain("CREATE TABLE `notes` (`id` int NOT NULL, `title` text)");
      expect(parsed.statements).toContain("INSERT INTO `notes` (`id`, `title`) VALUES (1, 'Campus; Core')");
      expect(parsed.manifests).toHaveLength(1);
      expect(parsed.manifests[0].tableName).toBe("notes");
      expect(parsed.manifests[0].rowCount).toBe(1);
      expect(raw).toHaveBeenCalled();
    } finally {
      await fs.rm(directory, { recursive: true, force: true });
    }
  });
});
