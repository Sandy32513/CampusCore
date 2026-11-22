export interface SettingItemDto {
  key: string;
  value: string;
  category: string;
  isPublic: boolean;
  description?: string | null;
}

export type SystemSettingsMap = Record<string, string>;

export interface PublicSettingsDto {
  institutionName: string;
  institutionCode: string;
  contactEmail: string;
  contactPhone: string;
  address: string;
  timezone: string;
  dateFormat: string;
  timeFormat: string;
  currency: string;
  currencySymbol: string;
  attendanceThresholdPct: number;
}
