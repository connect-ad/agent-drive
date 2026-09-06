/**
 * AgentDrive API Worker.
 *
 * Routing is hand-written rather than a framework: the surface is small, every
 * path is one of two shapes, and a router library would be more code than the
 * thing it routes. What it does NOT do is pattern-match on strings - the path
 * is split into segments once and matched structurally, so a route can never
 * be reached by a URL that merely looks similar.
 */

import { toErrorResponse, ApiError } from "./lib/errors";
import { newId } from "./lib/ids";
import { withAuth, type Requirement, type Handler } from "./middleware/auth";
import { whoami } from "./routes/whoami";
import { createWorkspace } from "./routes/create-workspace";
import {
  completeFile,
  createFile,
  deleteFile,
  downloadFile,
  getFile,
  listFiles,
  patchFile,
  restoreFile,
} from "./routes/files";
import { readSigningConfig, type R2SigningConfig } from "./storage/presign";

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

  /**
   * R2 S3-endpoint identifiers, injected from `terraform output -json`. Not
   * secrets: they name the endpoint presigned URLs are signed against.
   */
  R2_ACCOUNT_ID?: string;
  R2_BUCKET_NAME?: string;
  /**
   * The S3 key pair that actually signs those URLs, pushed by CI via
   * `wrangler secret put`. The FILES binding cannot presign - R2Bucket has no
   * such method - so presigning needs a credential the binding does not carry.
   */
  R2_ACCESS_KEY_ID?: string;
  R2_SECRET_ACCESS_KEY?: string;
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

/** A handler for a route that names one file in its URL. */
type FileHandler = (
  ctx: Parameters<Handler>[0],
  request: Request,
  fileId: string
) => Promise<Response>;

/**
 * Read the R2 signing credentials, or explain why there are none.
 *
 * Null (nothing configured) is a supported state - dev runs that way until the
 * signing token exists, and the presign path refuses cleanly. A HALF-configured
 * deployment is not: that is a mistake, and it becomes a 500 naming the missing
 * variables in the log rather than a confusing signature failure later.
 */
function signingConfig(env: Env): R2SigningConfig | null {
  try {
    return readSigningConfig(env);
  } catch (err) {
    throw new ApiError("INTERNAL_ERROR", "Something went wrong on our end.", {
      internalReason: err instanceof Error ? err.message : String(err),
    });
  }
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
            files: env.FILES,
            signing: () => signingConfig(env),
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

      // Everything below is /v1/files. Segments, not string prefixes: matching
      // on `pathname.startsWith("/v1/files")` would also match "/v1/filesX".
      const segments = url.pathname.split("/").filter((segment) => segment !== "");
      if (segments[0] === "v1" && segments[1] === "files") {
        const fileId = segments[2];
        const action = segments[3];

        if (fileId === undefined) {
          if (request.method === "POST") return await authed({ op: "write" }, createFile);
          if (request.method === "GET") return await authed({ op: "list" }, listFiles);
          throw new ApiError("NOT_FOUND", "No such route.");
        }

        // A handler bound to the ID from the URL, so no handler parses the path
        // itself and none can disagree with the router about which file it is.
        const onFile = (requirement: Requirement, handler: FileHandler): Promise<Response> =>
          authed(requirement, (authCtx, req) => handler(authCtx, req, fileId));

        if (action === undefined) {
          if (request.method === "GET") return await onFile({ op: "read" }, getFile);
          if (request.method === "PATCH") return await onFile({ op: "write" }, patchFile);
          if (request.method === "DELETE") return await onFile({ op: "delete" }, deleteFile);
          throw new ApiError("NOT_FOUND", "No such route.");
        }

        if (segments.length === 4 && request.method === "POST" && action === "complete") {
          return await onFile({ op: "write" }, completeFile);
        }
        if (segments.length === 4 && request.method === "GET" && action === "download") {
          return await onFile({ op: "read" }, downloadFile);
        }
        // Restore takes `delete` scope, not `write`: it is the inverse of a
        // delete, so it is the same capability (13's table).
        if (segments.length === 4 && request.method === "POST" && action === "restore") {
          return await onFile({ op: "delete" }, restoreFile);
        }
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
