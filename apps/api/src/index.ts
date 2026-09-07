/**
 * AgentDisk API Worker.
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
import { logoutAll } from "./routes/logout-all";
import { createWorkspace } from "./routes/create-workspace";
import { createWorkspaceForUser, listWorkspaces } from "./routes/workspaces";
import { createAgent, deleteAgent, getAgent, listAgents, patchAgent } from "./routes/agents";
import { createKey, listKeys, revokeKey } from "./routes/keys";
import {
  changeMemberRole,
  inviteMember,
  listWorkspaceMembers,
  removeWorkspaceMember,
} from "./routes/members";
import { resolveVerifiedUser } from "./auth/authenticate";
import { extractBearerToken, isApiKeyToken } from "./lib/keys";
import { unauthorized } from "./lib/errors";
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
import {
  copyFile,
  createFolder,
  deleteFolder,
  listFolders,
  moveFile,
} from "./routes/folders";
import { readSigningConfig, type R2SigningConfig } from "./storage/presign";
import { preflightResponse, withCorsHeaders } from "./lib/cors";

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

  /**
   * The Firebase project whose ID tokens this deployment accepts (16 PART 30.2).
   * Public configuration, not a secret - verification uses Google's public
   * JWKS - but environment-scoped, because dev and prod are two separate
   * Firebase projects and a token from one must not authenticate against the
   * other. Absent means user tokens are refused; API keys are unaffected.
   */
  FIREBASE_PROJECT_ID?: string;

  /**
   * Origins allowed to call this API from a browser, comma-separated and
   * including the scheme. Public configuration, per environment, so the dev API
   * cannot be driven from the prod dashboard or the other way round.
   */
  CORS_ALLOWED_ORIGINS?: string;
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

/**
 * The Firebase half of the same idea, and simpler because there is only one
 * value: either this deployment knows which project's tokens it accepts, or it
 * refuses user tokens outright. There is no half-configured state to detect.
 */
function firebaseConfig(env: Env): { cache: KVNamespace; projectId: string } | null {
  const projectId = env.FIREBASE_PROJECT_ID;
  if (projectId === undefined || projectId === "") return null;
  return { cache: env.CACHE, projectId };
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

    // Before everything, including authentication. A preflight carries no
    // Authorization header - the browser has not sent the real request yet - so
    // any credential check here would reject every cross-origin call there is.
    if (request.method === "OPTIONS") {
      return preflightResponse(request, env);
    }

    // The routing body, lifted so that every exit - a handler's response and
    // an error envelope alike - leaves through the same CORS wrapper below.
    const respond = async (): Promise<Response> => {
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
            firebase: firebaseConfig(env),
          },
          requirement,
          handler
        );

      // One path, two callers, told apart by whether a credential was offered.
      //
      // Unauthenticated it is the Turnstile-gated sandbox: an agent
      // provisioning itself a trial workspace, which is the product's own
      // agent-first onboarding (05 PART 4.3) and is why the route accepts no
      // credential at all. Its gates - a per-IP rate limit and Turnstile - live
      // inside that handler.
      //
      // Authenticated it is a person adding a workspace to the billing account
      // they already own. Keeping both on one path rather than inventing a
      // second means a client that later gains a credential does not have to
      // learn a different URL for the same noun.
      if (url.pathname === "/v1/workspaces" && (request.method === "POST" || request.method === "GET")) {
        const token = extractBearerToken(request);

        if (token === null || isApiKeyToken(token)) {
          if (request.method !== "POST") throw new ApiError("NOT_FOUND", "No such route.");
          // An API key is deliberately not accepted here either: an agent key
          // is scoped to one workspace and must not be able to mint siblings.
          if (token !== null) throw unauthorized("api keys cannot create workspaces");
          return await createWorkspace(request, {
            db: env.DB,
            kv: env.CACHE,
            turnstileSecret: env.TURNSTILE_SECRET_KEY,
            allowedHostnames: env.TURNSTILE_ALLOWED_HOSTNAMES,
          });
        }

        const firebase = firebaseConfig(env);
        if (firebase === null) {
          throw unauthorized("no FIREBASE_PROJECT_ID configured; user tokens cannot be verified");
        }
        const now = Date.now();
        const { user } = await resolveVerifiedUser(token, {
          db: env.DB,
          cache: firebase.cache,
          projectId: firebase.projectId,
          now,
        });

        return request.method === "GET"
          ? await listWorkspaces(env.DB, user)
          : await createWorkspaceForUser(request, env.DB, user, now);
      }

      // 30.4. A user ending their own sessions; refused for an API key, which
      // must never acquire authority over the person who issued it.
      if (route === "POST /v1/me/logout-all") {
        return await authed({ op: null }, logoutAll);
      }

      if (route === "GET /v1/whoami") {
        // Any valid credential; no particular capability. 13's table says "Self".
        return await authed({ op: null }, whoami);
      }

      const segments = url.pathname.split("/").filter((segment) => segment !== "");

      // Members. Every one of these is owner-only, enforced inside the handlers
      // rather than by a scope op: an agent key holds no role at all, so there
      // is nothing for a scope to express. The chain still runs in full - a
      // member of another workspace cannot reach this one's roster.
      if (segments[0] === "v1" && segments[1] === "members") {
        const membershipId = segments[2];
        if (membershipId === undefined) {
          if (request.method === "GET") return await authed({ op: null }, listWorkspaceMembers);
          if (request.method === "POST") return await authed({ op: null }, inviteMember);
          throw new ApiError("NOT_FOUND", "No such route.");
        }
        if (segments[3] !== undefined) throw new ApiError("NOT_FOUND", "No such route.");

        if (request.method === "PATCH") {
          return await authed({ op: null }, (authCtx, req) =>
            changeMemberRole(authCtx, req, membershipId)
          );
        }
        if (request.method === "DELETE") {
          return await authed({ op: null }, (authCtx, req) =>
            removeWorkspaceMember(authCtx, req, membershipId)
          );
        }
        throw new ApiError("NOT_FOUND", "No such route.");
      }

      // Agents. Listing and reading need `read`; anything that changes one
      // needs `write`, because an agent is the thing a credential acts as and
      // renaming or disabling it changes what other credentials can do.
      if (segments[0] === "v1" && segments[1] === "agents") {
        const agentId = segments[2];
        if (agentId === undefined) {
          if (request.method === "GET") return await authed({ op: "list" }, listAgents);
          if (request.method === "POST") return await authed({ op: "write" }, createAgent);
          throw new ApiError("NOT_FOUND", "No such route.");
        }
        if (segments[3] !== undefined) throw new ApiError("NOT_FOUND", "No such route.");

        const onAgent = (requirement: Requirement, handler: FileHandler): Promise<Response> =>
          authed(requirement, (authCtx, req) => handler(authCtx, req, agentId));

        if (request.method === "GET") return await onAgent({ op: "read" }, getAgent);
        if (request.method === "PATCH") return await onAgent({ op: "write" }, patchAgent);
        if (request.method === "DELETE") return await onAgent({ op: "delete" }, deleteAgent);
        throw new ApiError("NOT_FOUND", "No such route.");
      }

      // Keys. Minting has its own scope op rather than reusing `write`: the
      // authority to create a credential is categorically different from the
      // authority to write a file, and a key that can do the latter must not
      // silently be able to do the former.
      if (segments[0] === "v1" && segments[1] === "keys") {
        const keyId = segments[2];
        if (keyId === undefined) {
          if (request.method === "GET") return await authed({ op: "list" }, listKeys);
          if (request.method === "POST") return await authed({ op: "keys:create" }, createKey);
          throw new ApiError("NOT_FOUND", "No such route.");
        }
        if (segments[3] !== undefined) throw new ApiError("NOT_FOUND", "No such route.");
        if (request.method === "DELETE") {
          return await authed({ op: "keys:create" }, (authCtx, req) =>
            revokeKey(authCtx, req, keyId)
          );
        }
        throw new ApiError("NOT_FOUND", "No such route.");
      }

      // Everything below is /v1/files. Segments, not string prefixes: matching
      // on `pathname.startsWith("/v1/files")` would also match "/v1/filesX".
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
        // Move needs write on BOTH ends and copy needs read on the source plus
        // write on the destination (13's table); both second checks are inside
        // the handlers, which are the only place the destination is known.
        if (segments.length === 4 && request.method === "POST" && action === "move") {
          return await onFile({ op: "write" }, moveFile);
        }
        if (segments.length === 4 && request.method === "POST" && action === "copy") {
          return await onFile({ op: "read" }, copyFile);
        }
      }

      if (segments[0] === "v1" && segments[1] === "folders") {
        const folderId = segments[2];

        if (folderId === undefined) {
          if (request.method === "POST") return await authed({ op: "write" }, createFolder);
          if (request.method === "GET") return await authed({ op: "list" }, listFolders);
          throw new ApiError("NOT_FOUND", "No such route.");
        }

        if (segments.length === 3 && request.method === "DELETE") {
          return await authed({ op: "delete" }, (authCtx, req) =>
            deleteFolder(authCtx, req, folderId)
          );
        }
      }

      throw new ApiError("NOT_FOUND", "No such route.");
    };

    // Errors get the headers too. A 401 the browser refuses to let script read
    // is indistinguishable from a network failure, and "that credential isn't
    // valid" is exactly what a developer needs to see in their console.
    try {
      return withCorsHeaders(await respond(), request, env);
    } catch (thrown) {
      return withCorsHeaders(toErrorResponse(thrown, id), request, env);
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
