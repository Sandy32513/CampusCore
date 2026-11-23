import type {
  PublicSettingsDto,
  SystemSettingsMap,
  UserDto
} from "@campuscore/shared";
import { getDb } from "../db/connection.js";
import { AuditService } from "./auditService.js";

export class SettingsService {
  static async getAllSettings(): Promise<SystemSettingsMap> {
    const rows = await getDb()("system_settings").select("setting_key", "setting_value");
    const settings: SystemSettingsMap = {};
    for (const row of rows) settings[row.setting_key] = row.setting_value;
    return settings;
  }

  static async getPublicSettings(): Promise<PublicSettingsDto> {
    const all = await this.getAllSettings();
    return {
      institutionName: all.institution_name || "CampusCore University",
      institutionCode: all.institution_code || "CCU",
      contactEmail: all.contact_email || "admin@campuscore.edu",
      contactPhone: all.contact_phone || "+1-800-555-0199",
      address: all.address || "100 Innovation Way, Tech Campus",
      timezone: all.timezone || "UTC",
      dateFormat: all.date_format || "YYYY-MM-DD",
      timeFormat: all.time_format || "24H",
      currency: all.currency || "USD",
      currencySymbol: all.currency_symbol || "$",
      attendanceThresholdPct: Number(all.attendance_threshold_pct || 75)
    };
  }

  static async updateSettings(
    updates: Record<string, string>,
    actor?: { user: UserDto; ip?: string; userAgent?: string }
  ): Promise<SystemSettingsMap> {
    const db = getDb();
    await db.transaction(async (trx) => {
      for (const [key, value] of Object.entries(updates)) {
        await trx("system_settings")
          .where({ setting_key: key })
          .update({ setting_value: String(value), updated_at: new Date() });
      }

      await AuditService.log({
        userId: actor?.user.id,
        userEmail: actor?.user.email,
        role: actor?.user.role,
        action: "SYSTEM_SETTINGS_UPDATE",
        entity: "SYSTEM_SETTINGS",
        entityId: "1",
        details: { changes: updates },
        ipAddress: actor?.ip,
        userAgent: actor?.userAgent,
        status: "SUCCESS"
      }, trx);
    });

    return this.getAllSettings();
  }
}
