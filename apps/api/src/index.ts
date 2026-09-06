/**
 * AgentDrive API Worker.
 *
 * Routing is a switch, not a framework. There are two routes; a router library
 * would be more code than the thing it routes. It becomes worth revisiting when
 * the full 05 PART 13 surface lands.
 */

import { toErrorResponse, ApiError } from "./lib/errors";
import { newId } from "./lib/ids";
import { withAuth, type Requirement, type Handler } from "./middleware/auth";
import { whoami } from "./routes/whoami";
import { createWorkspace } from "./routes/create-workspace";

export interface Env {
  DB: D1Database;
  FILES: R2Bucket;
  CACHE: KVNamespace;
  JOBS: Queue;
  ENVIRONMENT: string;
  /**
   * Turnstile's server-side secret, pushed by CI via `wrangler secret put`.
   * Absent means POST /v1/workspaces refuses to run rather than running ungated.
   */
  TURNSTILE_SECRET_KEY?: string;
  /** Optional comma-separated hostname pinning for the Turnstile response. */
  TURNSTILE_ALLOWED_HOSTNAMES?: string;
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

/**
 * One ID per request, echoed in every error body and every log line, so a user
 * reporting "I got a 403" hands us the string that finds the exact request.
 */
function requestId(): string {
  return newId("request");
}

export default {
  async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
    const id = requestId();

    try {
      const url = new URL(request.url);
      const route = `${request.method} ${url.pathname}`;

      // Public. No credential is read, so nothing here can leak one.
      if (route === "GET /v1/healthz") {
        return json(buildHealth(env, new Date()));
      }

      const authed = (requirement: Requirement, handler: Handler): Promise<Response> =>
        withAuth(
          request,
          {
            db: env.DB,
            requestId: id,
            waitUntil: (promise) => ctx.waitUntil(promise),
          },
          requirement,
          handler
        );

      // Public, and the only route that creates anything without a credential.
      // Its gates - a per-IP rate limit and Turnstile - live inside the handler.
      if (route === "POST /v1/workspaces") {
        return await createWorkspace(request, {
          db: env.DB,
          kv: env.CACHE,
          turnstileSecret: env.TURNSTILE_SECRET_KEY,
          allowedHostnames: env.TURNSTILE_ALLOWED_HOSTNAMES,
        });
      }

      if (route === "GET /v1/whoami") {
        // Any valid credential; no particular capability. 13's table says "Self".
        return await authed({ op: null }, whoami);
      }

      throw new ApiError("NOT_FOUND", "No such route.");
    } catch (thrown) {
      return toErrorResponse(thrown, id);
    }
  },

  /**
   * Queue consumer.
   *
   * wrangler.toml declares this Worker as a consumer of agentdisk-dev-jobs, and
   * Cloudflare refuses that registration unless a `queue` handler is exported -
   * so this is required for the deploy to succeed, not optional scaffolding.
   *
   * Nothing produces messages yet. Real handlers (webhook delivery, async
   * processing, reconciliation) belong in src/jobs/. Until then this retries
   * rather than acks: silently dropping a message that something unexpectedly
   * enqueued would be worse than letting it redeliver and eventually land in
   * agentdisk-dev-jobs-dlq, where it is visible.
   */
  async queue(batch: MessageBatch<unknown>, _env: Env): Promise<void> {
    console.log(
      JSON.stringify({
        level: "warn",
        message: "Queue message received before any handler exists.",
        queue: batch.queue,
        count: batch.messages.length,
      })
    );
    batch.retryAll();
  },
} satisfies ExportedHandler<Env>;
