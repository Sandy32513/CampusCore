import {
  SettingItemDto,
  PublicSettingsDto,
  SystemSettingsMap,
  UserDto
} from "@campuscore/shared";
import { getDb } from "../db/connection.js";
import { AuditService } from "./auditService.js";

export const defaultSettings: SettingItemDto[] = [
  { category: "INSTITUTION", key: "institution_name", value: "CampusCore University", isPublic: true, description: "Official name of the institution" },
  { category: "INSTITUTION", key: "institution_code", value: "CCU", isPublic: true, description: "Short accreditation or institutional code" },
  { category: "INSTITUTION", key: "contact_email", value: "admin@campuscore.edu", isPublic: true, description: "Primary institutional contact email" },
  { category: "INSTITUTION", key: "contact_phone", value: "+1-800-555-0199", isPublic: true, description: "Primary contact phone" },
  { category: "INSTITUTION", key: "address", value: "100 Innovation Way, Tech Campus", isPublic: true, description: "Physical campus address" },
  { category: "LOCALIZATION", key: "timezone", value: "UTC", isPublic: true, description: "Default institutional timezone" },
  { category: "LOCALIZATION", key: "date_format", value: "YYYY-MM-DD", isPublic: true, description: "Default date display format" },
  { category: "LOCALIZATION", key: "time_format", value: "24H", isPublic: true, description: "Default time display format" },
  { category: "LOCALIZATION", key: "currency", value: "USD", isPublic: true, description: "Default currency code" },
  { category: "LOCALIZATION", key: "currency_symbol", value: "$", isPublic: true, description: "Default currency symbol" },
  { category: "ACADEMIC", key: "attendance_threshold_pct", value: "75", isPublic: true, description: "Minimum attendance percentage required for exam eligibility" },
  { category: "SECURITY", key: "session_timeout_minutes", value: "480", isPublic: false, description: "Maximum session lifetime before re-authentication" },
  { category: "SECURITY", key: "allow_student_registration", value: "false", isPublic: false, description: "Whether public self-registration is enabled for students" }
];

export const inMemorySettings: SettingItemDto[] = JSON.parse(JSON.stringify(defaultSettings));

export class SettingsService {
  static async getAllSettings(): Promise<SystemSettingsMap> {
    try {
      const db = getDb();
      const rows = await db("system_settings").select("setting_key", "setting_value");
      if (rows && rows.length > 0) {
        const map: SystemSettingsMap = {};
        for (const r of rows) {
          map[r.setting_key] = r.setting_value;
        }
        return map;
      }
    } catch {
      // Memory fallback
    }

    const map: SystemSettingsMap = {};
    for (const s of inMemorySettings) {
      map[s.key] = s.value;
    }
    return map;
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
    try {
      const db = getDb();
      for (const [key, value] of Object.entries(updates)) {
        await db("system_settings")
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
      });

      return this.getAllSettings();
    } catch {
      // Memory fallback
    }

    for (const [key, value] of Object.entries(updates)) {
      const item = inMemorySettings.find((s) => s.key === key);
      if (item) {
        item.value = String(value);
      } else {
        inMemorySettings.push({
          key,
          value: String(value),
          category: "CUSTOM",
          isPublic: false
        });
      }
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
    });

    return this.getAllSettings();
  }
}
