/**
 * AgentDrive API Worker — pipeline skeleton.
 *
 * Scope note: this file exists so the infra/CI pipeline has something real to
 * deploy and smoke-test end to end. Application logic (auth, REST resources,
 * MCP tools) is the job of docs/design/11-backend-implementation-prompt.md and
 * lands on top of this, not inside it.
 */

export interface Env {
  DB: D1Database;
  FILES: R2Bucket;
  CACHE: KVNamespace;
  JOBS: Queue;
  ENVIRONMENT: string;
}

export interface HealthReport {
  status: "ok";
  environment: string;
  commit: string;
  timestamp: string;
}

/** Build the health payload. Pure, so it is unit-testable without a Worker runtime. */
export function buildHealth(env: Pick<Env, "ENVIRONMENT">, now: Date): HealthReport {
  return {
    status: "ok",
    environment: env.ENVIRONMENT ?? "unknown",
    commit: (globalThis as { __COMMIT_SHA__?: string }).__COMMIT_SHA__ ?? "dev",
    timestamp: now.toISOString(),
  };
}

function json(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "content-type": "application/json; charset=utf-8" },
  });
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);

    if (url.pathname === "/v1/healthz") {
      return json(buildHealth(env, new Date()));
    }

    return json({ error: { code: "not_found", message: "No such route." } }, 404);
  },
} satisfies ExportedHandler<Env>;
