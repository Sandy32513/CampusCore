import { execFileSync, spawn } from "node:child_process";
import { once } from "node:events";
import { createServer, type AddressInfo } from "node:net";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { setTimeout as delay } from "node:timers/promises";
import { describe, expect, it } from "vitest";
import { getDb } from "../src/db/connection.js";

const enabled = process.env.CI_DB_OUTAGE_PROBE === "1";
const backendDirectory = resolve(dirname(fileURLToPath(import.meta.url)), "..");

interface HealthBody {
  data?: {
    status?: string;
    database?: string;
  };
}

describe.skipIf(!enabled)("live MySQL outage and API recovery", () => {
  it("returns 503 while the CI database is stopped and recovers without restarting the API", async () => {
    assertAuditCiTarget();
    const containerId = findMySqlServiceContainer();
    const port = await reserveLocalPort();
    const baseUrl = `http://127.0.0.1:${port}`;
    const api = spawn(process.execPath, ["--import", "tsx", "src/index.ts"], {
      cwd: backendDirectory,
      env: {
        ...process.env,
        NODE_ENV: "test",
        API_PORT: String(port),
        APP_BASE_URL: baseUrl,
        CORS_ORIGINS: baseUrl
      },
      stdio: "ignore"
    });

    let stopAttempted = false;
    let probeError: unknown;
    try {
      const healthy = await waitForHealth(api, baseUrl, "healthy", "connected", 15000);
      expect(healthy.response.status).toBe(200);

      stopAttempted = true;
      docker(["stop", containerId], 20000);

      const unavailable = await waitForHealth(api, baseUrl, "degraded", "disconnected", 15000);
      expect(unavailable.response.status).toBe(200);

      const response = await fetch(`${baseUrl}/api/v1/users`, {
        headers: {
          Cookie: "campuscore_session=mysql-recovery-probe",
          "X-Request-Id": "mysql-recovery-probe"
        },
        signal: AbortSignal.timeout(5000)
      });
      const body = await response.json();
      expect(response.status).toBe(503);
      expect(body.error).toMatchObject({
        code: "DB_UNAVAILABLE",
        message: "The database is temporarily unavailable. Please try again.",
        requestId: "mysql-recovery-probe"
      });

      docker(["start", containerId], 20000);
      await waitForContainerHealth(containerId, 40000);
      stopAttempted = false;
      const recovered = await waitForHealth(api, baseUrl, "healthy", "connected", 45000);
      expect(recovered.response.status).toBe(200);
    } catch (error) {
      probeError = error;
    } finally {
      if (stopAttempted) {
        try {
          docker(["start", containerId], 20000);
          await waitForContainerHealth(containerId, 40000);
          await waitForHealth(api, baseUrl, "healthy", "connected", 45000);
        } catch (recoveryError) {
          probeError = recoveryError;
        }
      }

      await stopProcess(api);
      await getDb().destroy();
    }

    if (probeError) throw probeError;
  }, 180000);
});

function assertAuditCiTarget(): void {
  const database = process.env.DB_NAME;
  const testDatabase = process.env.DB_TEST_NAME;
  if (
    process.env.GITHUB_ACTIONS !== "true" ||
    !database ||
    database !== testDatabase ||
    !/^sms_audit_[a-z0-9_]+$/i.test(database) ||
    process.env.DB_HOST !== "127.0.0.1" ||
    process.env.DB_PORT !== "3306"
  ) {
    throw new Error("Live outage probe requires the isolated GitHub Actions sms_audit_* MySQL service");
  }
}

function findMySqlServiceContainer(): string {
  const output = execFileSync(
    "docker",
    ["ps", "--filter", "ancestor=mysql:8.4", "--format", "{{.ID}}"],
    { encoding: "utf8", timeout: 5000 }
  );
  const containerIds = output.split(/\r?\n/).map((id) => id.trim()).filter(Boolean);
  if (containerIds.length !== 1 || !/^[a-f0-9]{12,64}$/i.test(containerIds[0])) {
    throw new Error(`Expected one running CI MySQL 8.4 container; found ${containerIds.length}`);
  }
  return containerIds[0];
}

function docker(args: string[], timeout: number): void {
  execFileSync("docker", args, { stdio: "ignore", timeout });
}

async function waitForContainerHealth(containerId: string, timeout: number): Promise<void> {
  const deadline = Date.now() + timeout;
  let lastStatus = "unknown";
  while (Date.now() < deadline) {
    lastStatus = execFileSync(
      "docker",
      ["inspect", "--format", "{{if .State.Health}}{{.State.Health.Status}}{{else}}{{.State.Status}}{{end}}", containerId],
      { encoding: "utf8", timeout: 5000 }
    ).trim();
    if (lastStatus === "healthy") return;
    if (lastStatus === "exited" || lastStatus === "dead") {
      throw new Error(`CI MySQL container failed to recover (state ${lastStatus})`);
    }
    await delay(500);
  }
  throw new Error(`CI MySQL container did not become healthy (last state ${lastStatus})`);
}

async function waitForHealth(
  api: ReturnType<typeof spawn>,
  baseUrl: string,
  status: "healthy" | "degraded",
  database: "connected" | "disconnected",
  timeout: number
): Promise<{ response: Response; body: HealthBody }> {
  const deadline = Date.now() + timeout;
  let lastState = "not responding";
  while (Date.now() < deadline) {
    if (api.exitCode !== null) throw new Error(`Probe API exited before ${status} state (code ${api.exitCode})`);
    try {
      const response = await fetch(`${baseUrl}/health`, { signal: AbortSignal.timeout(1000) });
      const body = await response.json() as HealthBody;
      lastState = `${body.data?.status || "unknown"}/${body.data?.database || "unknown"}`;
      if (body.data?.status === status && body.data.database === database) return { response, body };
    } catch (error) {
      lastState = String(error);
    }
    await delay(250);
  }
  throw new Error(`Probe API did not reach ${status}/${database}; last state: ${lastState}`);
}

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
