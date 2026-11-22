export interface HealthStatusData {
  status: "healthy" | "degraded" | "unhealthy";
  database: "connected" | "disconnected";
  version: string;
  uptime: number;
  timestamp: string;
}
