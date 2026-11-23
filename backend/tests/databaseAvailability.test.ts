import { spawn } from "node:child_process";
import { once } from "node:events";
import { createServer, type AddressInfo } from "node:net";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { setTimeout as delay } from "node:timers/promises";
import { describe, expect, it } from "vitest";

const backendDirectory = resolve(dirname(fileURLToPath(import.meta.url)), "..");

describe("HTTP behavior with an unavailable MySQL endpoint", () => {
  it("reports degraded health and returns a redacted 503 for a database-backed request", async () => {
    const port = await reserveLocalPort();
    const baseUrl = `http://127.0.0.1:${port}`;
    const auditDatabase = "sms_audit_unavailable_probe";
    const api = spawn(process.execPath, ["--import", "tsx", "src/index.ts"], {
      cwd: backendDirectory,
      env: {
        ...process.env,
        NODE_ENV: "test",
        API_PORT: String(port),
        APP_BASE_URL: baseUrl,
        CORS_ORIGINS: baseUrl,
        DB_HOST: "127.0.0.1",
        DB_PORT: "1",
        DB_NAME: auditDatabase,
        DB_TEST_NAME: auditDatabase,
        DB_APP_USER: "audit_probe",
        DB_APP_PASSWORD: ""
      },
      stdio: "ignore"
    });

    try {
      const healthResponse = await waitForHealth(api, `${baseUrl}/health`);
      expect(healthResponse.status).toBe(200);
      const health = await healthResponse.json();
      expect(health.data.status).toBe("degraded");
      expect(health.data.database).toBe("disconnected");

      const response = await fetch(`${baseUrl}/api/v1/users`, {
        headers: {
          Cookie: "campuscore_session=audit-outage-probe",
          "X-Request-Id": "mysql-unavailable-probe"
        },
        signal: AbortSignal.timeout(3000)
      });
      const body = await response.json();

      expect(response.status).toBe(503);
      expect(response.headers.get("X-Request-Id")).toBe("mysql-unavailable-probe");
      expect(body).toEqual({
        success: false,
        error: {
          code: "DB_UNAVAILABLE",
          message: "The database is temporarily unavailable. Please try again.",
          requestId: "mysql-unavailable-probe"
        }
      });
    } finally {
      await stopProcess(api);
    }
  }, 15000);
});

async function reserveLocalPort(): Promise<number> {
  const server = createServer();
  await new Promise<void>((resolveListen, reject) => {
    server.once("error", reject);
    server.listen(0, "127.0.0.1", resolveListen);
  });

  const address = server.address() as AddressInfo;
  await new Promise<void>((resolveClose, reject) => {
    server.close((error) => error ? reject(error) : resolveClose());
  });
  return address.port;
}

async function waitForHealth(api: ReturnType<typeof spawn>, url: string) {
  const deadline = Date.now() + 8000;
  let lastError: unknown;

  while (Date.now() < deadline) {
    if (api.exitCode !== null) throw new Error(`The probe API exited before listening (code ${api.exitCode})`);
    try {
      return await fetch(url, { signal: AbortSignal.timeout(750) });
    } catch (error) {
      lastError = error;
      await delay(100);
    }
  }

  throw new Error(`The probe API did not start in time: ${String(lastError)}`);
}

async function stopProcess(api: ReturnType<typeof spawn>): Promise<void> {
  if (api.exitCode !== null || api.signalCode !== null) return;

  const exited = once(api, "exit");
  api.kill();
  const stopped = await Promise.race([exited.then(() => true), delay(3000).then(() => false)]);
  if (!stopped) {
    api.kill("SIGKILL");
    await Promise.race([exited, delay(1000)]);
  }
}
