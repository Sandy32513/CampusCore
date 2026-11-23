import fs from "fs";
import path from "path";
import crypto from "crypto";
import { Readable, Transform } from "node:stream";
import { pipeline } from "node:stream/promises";
import knex from "knex";
import type { Knex } from "knex";
import {
  BackupRecordDto,
  CreateBackupInput,
  VerifyBackupResultDto,
  RestoreBackupResultDto,
  QueryBackupsInput,
  UserDto,
  BackupType,
  BackupStatus
} from "@campuscore/shared";
import { getDb } from "../db/connection.js";
import { config } from "../config/env.js";
import { AuditService } from "./auditService.js";

export interface BackupRow {
  id: number;
  filename: string;
  filepath: string;
  file_size_bytes: number;
  backup_type: string;
  status: string;
  checksum_sha256: string | null;
  created_by_user_id: number | null;
  retention_days: number;
  notes: string | null;
  created_at: string | Date;
  completed_at: string | Date | null;
}

interface BackupQueryRow extends BackupRow {
  user_email?: string | null;
}

function formatBytes(bytes: number): string {
  if (bytes === 0) return "0 Bytes";
  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
}

function mapBackupRowToDto(r: BackupQueryRow): BackupRecordDto {
  const bytes = Number(r.file_size_bytes || 0);
  return {
    id: String(r.id),
    filename: r.filename,
    filepath: r.filepath,
    fileSizeBytes: bytes,
    fileSizeFormatted: formatBytes(bytes),
    backupType: r.backup_type as BackupType,
    status: r.status as BackupStatus,
    checksumSha256: r.checksum_sha256 ?? null,
    createdByUserId: r.created_by_user_id ? String(r.created_by_user_id) : null,
    createdByUserEmail: r.user_email ?? null,
    retentionDays: Number(r.retention_days || 30),
    notes: r.notes ?? null,
    createdAt: new Date(r.created_at).toISOString(),
    completedAt: r.completed_at ? new Date(r.completed_at).toISOString() : null
  };
}

function unwrapRawRows<T extends Record<string, unknown>>(result: unknown): T[] {
  if (!Array.isArray(result)) return [];
  if (Array.isArray(result[0])) return result[0] as T[];
  return result as T[];
}

function safeRestoreErrorCode(error: unknown): string {
  if (error && typeof error === "object" && "code" in error && typeof error.code === "string") {
    return error.code;
  }
  return error instanceof Error ? error.name : "UNKNOWN_ERROR";
}

async function* generateSqlDump(db: Knex, backupType: BackupType): AsyncGenerator<string> {
  const tableResult = await db.raw(
    "SELECT TABLE_NAME AS tableName FROM information_schema.tables WHERE TABLE_SCHEMA = DATABASE() AND TABLE_TYPE = 'BASE TABLE' ORDER BY TABLE_NAME"
  );
  const tables = unwrapRawRows<{ tableName: string }>(tableResult);
  if (tables.length === 0) throw new Error("The connected database has no base tables to back up");

  yield `-- CampusCore SMS MySQL 8.4 logical backup\n-- Database: ${config.db.database}\n-- Created: ${new Date().toISOString()}\nSET FOREIGN_KEY_CHECKS=0;\n`;

  for (const { tableName } of tables) {
    const createResult = await db.raw("SHOW CREATE TABLE ??", [tableName]);
    const createRow = unwrapRawRows<Record<string, string>>(createResult)[0];
    const createSql = Object.entries(createRow ?? {}).find(([key]) => key.toLowerCase().startsWith("create table"))?.[1];
    if (!createSql) throw new Error(`Could not read the schema for table ${tableName}`);

    yield `\n-- Structure for ${tableName.replace(/[\r\n]/g, " ")}\n${createSql};\n`;
    let rowCount = 0;
    const tableHash = crypto.createHash("sha256");
    if (backupType === "SCHEMA_ONLY") {
      yield `-- CC-AUDIT-MANIFEST ${Buffer.from(JSON.stringify({ tableName, rowCount, checksum: tableHash.digest("hex") })).toString("base64")}\n`;
      continue;
    }

    const primaryKeys = await getPrimaryKeyColumns(db, tableName);
    let query = db(tableName).select("*");
    for (const key of primaryKeys) query = query.orderBy(key, "asc");
    const rows = query.stream({ highWaterMark: 128 });
    for await (const row of rows) {
      const values = row as Record<string, unknown>;
      const columns = Object.keys(values);
      if (columns.length === 0) continue;
      updateRowHash(tableHash, values);
      rowCount += 1;
      const placeholders = columns.map(() => "?").join(", ");
      const bindings = [tableName, columns, ...columns.map((column) => values[column])] as Knex.RawBinding[];
      const insertSql = db.raw(
        `INSERT INTO ?? (??) VALUES (${placeholders})`,
        bindings
      ).toQuery();
      yield `${insertSql};\n`;
    }
    yield `-- CC-AUDIT-MANIFEST ${Buffer.from(JSON.stringify({ tableName, rowCount, checksum: tableHash.digest("hex") })).toString("base64")}\n`;
  }

  yield "\nSET FOREIGN_KEY_CHECKS=1;\n";
}

function updateRowHash(hash: ReturnType<typeof crypto.createHash>, row: Record<string, unknown>): void {
  const normalized = Object.keys(row)
    .sort()
    .map((key) => [key, normalizeValue(row[key])]);
  hash.update(JSON.stringify(normalized));
  hash.update("\n");
}

function normalizeValue(value: unknown): unknown {
  if (value instanceof Date) return { type: "date", value: value.toISOString() };
  if (Buffer.isBuffer(value)) return { type: "buffer", value: value.toString("base64") };
  if (typeof value === "bigint") return { type: "bigint", value: value.toString() };
  if (Array.isArray(value)) return value.map(normalizeValue);
  if (value && typeof value === "object") {
    return Object.fromEntries(
      Object.entries(value as Record<string, unknown>)
        .sort(([left], [right]) => left.localeCompare(right))
        .map(([key, item]) => [key, normalizeValue(item)])
    );
  }
  return value;
}

export interface TableManifest {
  tableName: string;
  rowCount: number;
  checksum: string;
}

export function splitBackupSqlStatements(source: string): string[] {
  const statements: string[] = [];
  let statement = "";
  let quote: "'" | '"' | "`" | null = null;
  let lineComment = false;
  let blockComment = false;

  for (let index = 0; index < source.length; index += 1) {
    const char = source[index];
    const next = source[index + 1];

    if (lineComment) {
      if (char === "\n") lineComment = false;
      continue;
    }
    if (blockComment) {
      if (char === "*" && next === "/") {
        blockComment = false;
        index += 1;
      }
      continue;
    }
    if (quote) {
      statement += char;
      if (char === "\\" && next !== undefined) {
        statement += next;
        index += 1;
      } else if (char === quote) {
        if (next === quote) {
          statement += next;
          index += 1;
        } else {
          quote = null;
        }
      }
      continue;
    }

    if (char === "-" && next === "-" && (source[index + 2] === undefined || /\s/.test(source[index + 2]))) {
      lineComment = true;
      index += 1;
    } else if (char === "#") {
      lineComment = true;
    } else if (char === "/" && next === "*") {
      blockComment = true;
      index += 1;
    } else if (char === "'" || char === '"' || char === "`") {
      quote = char;
      statement += char;
    } else if (char === ";") {
      const trimmed = statement.trim();
      if (trimmed) statements.push(trimmed);
      statement = "";
    } else {
      statement += char;
    }
  }

  const trailing = statement.trim();
  if (trailing) statements.push(trailing);
  return statements;
}

export function parseBackupSql(buffer: Buffer): { statements: string[]; manifests: TableManifest[] } {
  const source = buffer.toString("utf8");
  const manifests: TableManifest[] = [];
  for (const match of source.matchAll(/^-- CC-AUDIT-MANIFEST ([A-Za-z0-9+/=]+)\s*$/gm)) {
    const value = JSON.parse(Buffer.from(match[1], "base64").toString("utf8")) as TableManifest;
    if (
      typeof value.tableName !== "string" ||
      !Number.isSafeInteger(value.rowCount) ||
      typeof value.checksum !== "string"
    ) {
      throw new Error("Backup manifest is invalid");
    }
    manifests.push(value);
  }
  if (manifests.length === 0) throw new Error("Backup does not include a table manifest");
  const statements = splitBackupSqlStatements(source);
  if (statements.length === 0) throw new Error("Backup contains no SQL statements");
  return { statements, manifests };
}

async function listBaseTables(db: Knex): Promise<string[]> {
  const result = await db.raw(
    "SELECT TABLE_NAME AS tableName FROM information_schema.tables WHERE TABLE_SCHEMA = DATABASE() AND TABLE_TYPE = 'BASE TABLE' ORDER BY TABLE_NAME"
  );
  return unwrapRawRows<{ tableName: string }>(result).map((row) => row.tableName).sort();
}

async function getPrimaryKeyColumns(db: Knex, tableName: string): Promise<string[]> {
  const result = await db.raw("SHOW KEYS FROM ?? WHERE Key_name = 'PRIMARY'", [tableName]);
  return unwrapRawRows<Record<string, unknown>>(result)
    .sort((left, right) => Number(left.Seq_in_index) - Number(right.Seq_in_index))
    .map((row) => Object.entries(row).find(([key]) => key.toLowerCase() === "column_name")?.[1])
    .filter((key): key is string => typeof key === "string");
}

async function verifyRestoredTables(db: Knex, manifests: TableManifest[]): Promise<boolean> {
  const actualTables = await listBaseTables(db);
  const expectedTables = manifests.map((item) => item.tableName).sort();
  if (JSON.stringify(actualTables) !== JSON.stringify(expectedTables)) return false;

  for (const manifest of manifests) {
    const countRow = await db(manifest.tableName).count<{ count: number }>({ count: "*" }).first();
    if (Number(countRow?.count ?? 0) !== manifest.rowCount) return false;

    const primaryKeys = await getPrimaryKeyColumns(db, manifest.tableName);
    let query = db(manifest.tableName).select("*");
    for (const key of primaryKeys) query = query.orderBy(key, "asc");
    const hash = crypto.createHash("sha256");
    const rows = query.stream({ highWaterMark: 128 });
    for await (const row of rows) updateRowHash(hash, row as Record<string, unknown>);
    if (hash.digest("hex") !== manifest.checksum) return false;
  }

  return true;
}

export async function writeSqlDump(db: Knex, filepath: string, backupType: BackupType): Promise<{ size: number; checksum: string }> {
  const hash = crypto.createHash("sha256");
  let size = 0;
  const hashAndCount = new Transform({
    transform(chunk: Buffer, _encoding, callback) {
      hash.update(chunk);
      size += chunk.length;
      callback(null, chunk);
    }
  });

  await pipeline(
    Readable.from(generateSqlDump(db, backupType)),
    hashAndCount,
    fs.createWriteStream(filepath, { flags: "wx", mode: 0o600 })
  );

  return { size, checksum: hash.digest("hex") };
}

export class BackupService {
  private static getBackupDir(): string {
    const dir = path.resolve(process.cwd(), config.storageDir, "backups");
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    return dir;
  }

  private static resolveBackupFile(filepath: string): string {
    const directory = path.resolve(this.getBackupDir());
    const resolved = path.resolve(filepath);
    const relative = path.relative(directory, resolved);
    if (!relative || relative === ".." || relative.startsWith(`..${path.sep}`) || path.isAbsolute(relative)) {
      throw new Error("Backup file path is outside the configured backup directory");
    }
    return resolved;
  }

  static async listBackups(query: QueryBackupsInput): Promise<{ backups: BackupRecordDto[]; total: number }> {
    const { page = 1, pageSize = 20, status, backupType } = query;

    const db = getDb();
    let dbQuery = db("database_backups as b")
        .leftJoin("users as u", "b.created_by_user_id", "u.id")
        .select("b.*", "u.email as user_email");

    if (status) dbQuery = dbQuery.where("b.status", status);
    if (backupType) dbQuery = dbQuery.where("b.backup_type", backupType);

    const totalResult = await dbQuery.clone().clearSelect().count<{ count: number }>("b.id as count").first();
    const total = Number(totalResult?.count || 0);
    const rows = await dbQuery
        .offset((page - 1) * pageSize)
        .limit(pageSize)
        .orderBy("b.id", "desc");

    return {
      backups: rows.map(mapBackupRowToDto),
      total
    };
  }

  static async getBackupById(id: string): Promise<BackupRecordDto | null> {
    const db = getDb();
    const row = await db("database_backups as b")
        .leftJoin("users as u", "b.created_by_user_id", "u.id")
        .where("b.id", id)
        .select("b.*", "u.email as user_email")
        .first();

    return row ? mapBackupRowToDto(row) : null;
  }

  static async createBackup(
    input: CreateBackupInput,
    actor?: { user: UserDto; ip?: string; userAgent?: string }
  ): Promise<{ backup?: BackupRecordDto; error?: string }> {
    const backupDir = this.getBackupDir();
    const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
    const filename = `backup_${config.db.database}_${timestamp}.sql`;
    const filepath = path.join(backupDir, filename);
    const backupType = input.backupType ?? "FULL";
    if (backupType === "INCREMENTAL") {
      return { error: "Incremental backup chains are not implemented; choose FULL or SCHEMA_ONLY" };
    }
    const retentionDays = input.retentionDays ?? 30;
    const notes = input.notes ?? "Scheduled or manual backup";
    const tempPath = `${filepath}.partial`;
    const db = getDb();
    let completedFile = false;
    let recordCreated = false;

    try {
      const { size, checksum } = await writeSqlDump(db, tempPath, backupType);
      await fs.promises.rename(tempPath, filepath);
      completedFile = true;

      const [insertId] = await db("database_backups").insert({
        filename,
        filepath,
        file_size_bytes: size,
        backup_type: backupType,
        status: "COMPLETED",
        checksum_sha256: checksum,
        created_by_user_id: actor?.user.id ? Number(actor.user.id) : null,
        retention_days: retentionDays,
        notes,
        completed_at: new Date()
      });
      recordCreated = true;

      const backup = await this.getBackupById(String(insertId));
      if (!backup) throw new Error("Backup record was not readable after creation");

      await AuditService.log({
        userId: actor?.user.id,
        userEmail: actor?.user.email,
        role: actor?.user.role,
        action: "DATABASE_BACKUP_CREATE",
        entity: "DATABASE_BACKUP",
        entityId: String(insertId),
        details: { filename, sizeBytes: size, checksum, backupType },
        ipAddress: actor?.ip,
        userAgent: actor?.userAgent,
        status: "SUCCESS"
      });

      return { backup };
    } catch (error) {
      await fs.promises.rm(tempPath, { force: true });
      if (completedFile && !recordCreated) await fs.promises.rm(filepath, { force: true });
      throw error;
    }
  }

  static async verifyBackup(id: string): Promise<VerifyBackupResultDto | null> {
    const backup = await this.getBackupById(id);
    if (!backup) return null;

    const filepath = this.resolveBackupFile(backup.filepath);
    const exists = fs.existsSync(filepath);
    let actualChecksum: string | null = null;
    let fileSizeBytes = backup.fileSizeBytes;

    if (exists) {
      const content = fs.readFileSync(filepath);
      actualChecksum = crypto.createHash("sha256").update(content).digest("hex");
      fileSizeBytes = content.length;
    }

    const isValid = exists && backup.checksumSha256 !== null && actualChecksum === backup.checksumSha256;

    return {
      id: backup.id,
      filename: backup.filename,
      exists,
      fileSizeBytes,
      expectedChecksum: backup.checksumSha256,
      actualChecksum,
      isValid,
      verifiedAt: new Date().toISOString()
    };
  }

  static async restoreBackup(
    id: string,
    actor?: { user: UserDto; ip?: string; userAgent?: string },
    targetDatabase?: string
  ): Promise<RestoreBackupResultDto | null> {
    const verification = await this.verifyBackup(id);
    if (!verification) return null;

    if (!verification.isValid) {
      return {
        id,
        filename: verification.filename,
        restored: false,
        message: "Backup file integrity verification failed; no restore was attempted",
        restoredAt: new Date().toISOString()
      };
    }

    if (!targetDatabase || !/^sms_audit_[a-z0-9_]{1,54}$/.test(targetDatabase)) {
      return {
        id,
        filename: verification.filename,
        restored: false,
        message: "Restore requires a pre-provisioned sms_audit_* scratch database; no data was changed",
        restoredAt: new Date().toISOString()
      };
    }
    if (targetDatabase.toLowerCase() === config.db.database.toLowerCase()) {
      return {
        id,
        filename: verification.filename,
        restored: false,
        message: "The configured application database cannot be used as a restore target",
        restoredAt: new Date().toISOString()
      };
    }

    let targetDb: Knex | undefined;
    let restorePhase = "load-backup-record";
    try {
      const backupRow = await this.getBackupById(id);
      if (!backupRow) return null;
      restorePhase = "resolve-backup-file";
      const backupFile = this.resolveBackupFile(backupRow.filepath);
      restorePhase = "parse-backup-sql";
      const { statements, manifests } = parseBackupSql(fs.readFileSync(backupFile));
      restorePhase = "connect-to-scratch-database";
      targetDb = knex({
        client: "mysql2",
        connection: {
          host: config.db.host,
          port: config.db.port,
          user: config.db.user,
          password: config.db.password,
          database: targetDatabase,
          charset: "utf8mb4"
        },
        pool: { min: 1, max: 1 }
      });

      restorePhase = "verify-scratch-database-connection";
      const databaseResult = await targetDb.raw("SELECT DATABASE() AS databaseName");
      const connectedDatabase = unwrapRawRows<{ databaseName: string }>(databaseResult)[0]?.databaseName;
      if (connectedDatabase !== targetDatabase) throw new Error("Scratch database connection mismatch");

      restorePhase = "clear-scratch-tables";
      await targetDb.raw("SET FOREIGN_KEY_CHECKS=0");
      for (const tableName of await listBaseTables(targetDb)) {
        await targetDb.raw("DROP TABLE IF EXISTS ??", [tableName]);
      }
      restorePhase = "execute-backup-sql";
      for (const statement of statements) await targetDb.raw(statement);
      await targetDb.raw("SET FOREIGN_KEY_CHECKS=1");

      restorePhase = "verify-restored-manifests";
      if (!(await verifyRestoredTables(targetDb, manifests))) {
        return {
          id,
          filename: verification.filename,
          restored: false,
          message: "Scratch restore did not match the backup table, row-count, and checksum manifest",
          restoredAt: new Date().toISOString()
        };
      }

      restorePhase = "write-restore-audit-event";
      await AuditService.log({
        userId: actor?.user.id,
        userEmail: actor?.user.email,
        role: actor?.user.role,
        action: "DATABASE_BACKUP_RESTORE",
        entity: "DATABASE_BACKUP",
        entityId: id,
        details: { filename: verification.filename, checksum: verification.actualChecksum, targetDatabase },
        ipAddress: actor?.ip,
        userAgent: actor?.userAgent,
        status: "SUCCESS"
      });

      return {
        id,
        filename: verification.filename,
        restored: true,
        message: `Backup restored and verified in scratch database ${targetDatabase}`,
        restoredAt: new Date().toISOString()
      };
    } catch (error) {
      console.error("Scratch backup restore failed", {
        phase: restorePhase,
        errorCode: safeRestoreErrorCode(error)
      });
      return {
        id,
        filename: verification.filename,
        restored: false,
        message: "Scratch restore failed; the application database was not targeted",
        restoredAt: new Date().toISOString()
      };
    } finally {
      await targetDb?.destroy();
    }
  }

  static async deleteBackup(
    id: string,
    actor?: { user: UserDto; ip?: string; userAgent?: string }
  ): Promise<{ success: boolean; error?: string }> {
    const backup = await this.getBackupById(id);
    if (!backup) return { success: false, error: "NOT_FOUND" };

    const db = getDb();
    await db("database_backups").where({ id }).del();

    await AuditService.log({
      userId: actor?.user.id,
      userEmail: actor?.user.email,
      role: actor?.user.role,
      action: "DATABASE_BACKUP_DELETE",
      entity: "DATABASE_BACKUP",
      entityId: id,
      details: { filename: backup.filename },
      ipAddress: actor?.ip,
      userAgent: actor?.userAgent,
      status: "SUCCESS"
    });

    const filepath = this.resolveBackupFile(backup.filepath);
    if (fs.existsSync(filepath)) fs.unlinkSync(filepath);

    return { success: true };
  }
}
