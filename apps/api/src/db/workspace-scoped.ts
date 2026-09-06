/**
 * Workspace-scoped repositories - the tenant-isolation enforcement mechanism
 * (06 PART 16.1). This is the most security-critical file in the codebase.
 *
 * The invariant: `workspace_id` is bound in the CONSTRUCTOR and is never a
 * method parameter. A handler receives an already-scoped repository, never a
 * raw D1 binding, so omitting the workspace filter is not something a caller
 * can forget - there is no method that accepts a workspace ID at all.
 *
 * Lookups by ID are AND-ed with workspace_id deliberately: asking for another
 * workspace's row by its exact ID must return nothing, not that row.
 *
 * Rules for anyone editing this file:
 *   - never add a method that accepts a workspaceId argument
 *   - never build SQL by interpolating anything; always bind with ?
 *   - never expose the raw D1 binding
 */
import type { AgentRow, ApiKeyRow, AuditEventRow, FileRow, FolderRow } from "./types";
import { escapeLikePattern } from "../lib/paths";

abstract class WorkspaceScoped {
  constructor(
    protected readonly db: D1Database,
    protected readonly workspaceId: string
  ) {
    if (!workspaceId) {
      // A blank scope would make `workspace_id = ''` match nothing, which fails
      // safe - but it means an upstream bug produced an empty scope. Fail loudly
      // rather than quietly returning empty result sets forever.
      throw new Error("WorkspaceScoped repository constructed without a workspace ID.");
    }
  }
}

export class WorkspaceScopedFiles extends WorkspaceScoped {
  async getById(id: string): Promise<FileRow | null> {
    return this.db
      .prepare(`SELECT * FROM files WHERE workspace_id = ? AND id = ? AND deleted_at IS NULL`)
      .bind(this.workspaceId, id)
      .first<FileRow>();
  }

  async getByPath(path: string): Promise<FileRow | null> {
    return this.db
      .prepare(`SELECT * FROM files WHERE workspace_id = ? AND path = ? AND deleted_at IS NULL`)
      .bind(this.workspaceId, path)
      .first<FileRow>();
  }

  async listByPrefix(pathPrefix: string, limit = 100, offset = 0): Promise<FileRow[]> {
    const result = await this.db
      .prepare(
        `SELECT * FROM files
         WHERE workspace_id = ? AND path LIKE ? ESCAPE '\\' AND deleted_at IS NULL
         ORDER BY created_at DESC LIMIT ? OFFSET ?`
      )
      .bind(this.workspaceId, `${escapeLikePattern(pathPrefix)}%`, limit, offset)
      .all<FileRow>();
    return result.results ?? [];
  }

  async insert(row: FileRow): Promise<void> {
    if (row.workspace_id !== this.workspaceId) {
      // Defence in depth: the caller built a row for another workspace. Writing
      // it would be a cross-tenant write even though every read is scoped, so
      // refuse rather than silently rewriting the field.
      throw new Error("Refusing to insert a file row belonging to another workspace.");
    }
    await this.db
      .prepare(
        `INSERT INTO files (
           id, workspace_id, folder_id, name, path, r2_object_key, size_bytes,
           mime_type, checksum_sha256, caption, custom_metadata, status,
           created_by, created_at, updated_at, deleted_at
         ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
      )
      .bind(
        row.id, this.workspaceId, row.folder_id, row.name, row.path, row.r2_object_key,
        row.size_bytes, row.mime_type, row.checksum_sha256, row.caption,
        row.custom_metadata, row.status, row.created_by, row.created_at,
        row.updated_at, row.deleted_at
      )
      .run();
  }

  async markActive(id: string, sizeBytes: number, checksum: string | null, now: number): Promise<boolean> {
    const result = await this.db
      .prepare(
        `UPDATE files SET status = 'active', size_bytes = ?, checksum_sha256 = ?, updated_at = ?
         WHERE workspace_id = ? AND id = ? AND status = 'pending'`
      )
      .bind(sizeBytes, checksum, now, this.workspaceId, id)
      .run();
    return (result.meta.changes ?? 0) > 0;
  }

  /** Soft delete (10.7). The R2 object is purged later by the queue consumer. */
  async softDelete(id: string, now: number): Promise<boolean> {
    const result = await this.db
      .prepare(
        `UPDATE files SET status = 'deleted', deleted_at = ?, updated_at = ?
         WHERE workspace_id = ? AND id = ? AND deleted_at IS NULL`
      )
      .bind(now, now, this.workspaceId, id)
      .run();
    return (result.meta.changes ?? 0) > 0;
  }

  /** Restore within the grace window (12.6). */
  async restore(id: string, now: number): Promise<boolean> {
    const result = await this.db
      .prepare(
        `UPDATE files SET status = 'active', deleted_at = NULL, updated_at = ?
         WHERE workspace_id = ? AND id = ? AND deleted_at IS NOT NULL`
      )
      .bind(now, this.workspaceId, id)
      .run();
    return (result.meta.changes ?? 0) > 0;
  }

  /** Move or rename: a pure metadata update, zero R2 operations (12.1). */
  async move(id: string, newPath: string, newName: string, folderId: string | null, now: number): Promise<boolean> {
    const result = await this.db
      .prepare(
        `UPDATE files SET path = ?, name = ?, folder_id = ?, updated_at = ?
         WHERE workspace_id = ? AND id = ? AND deleted_at IS NULL`
      )
      .bind(newPath, newName, folderId, now, this.workspaceId, id)
      .run();
    return (result.meta.changes ?? 0) > 0;
  }
}

export class WorkspaceScopedFolders extends WorkspaceScoped {
  async getById(id: string): Promise<FolderRow | null> {
    return this.db
      .prepare(`SELECT * FROM folders WHERE workspace_id = ? AND id = ?`)
      .bind(this.workspaceId, id)
      .first<FolderRow>();
  }

  async getByPath(path: string): Promise<FolderRow | null> {
    return this.db
      .prepare(`SELECT * FROM folders WHERE workspace_id = ? AND path = ?`)
      .bind(this.workspaceId, path)
      .first<FolderRow>();
  }

  async listChildren(parentFolderId: string | null): Promise<FolderRow[]> {
    const statement =
      parentFolderId === null
        ? this.db
            .prepare(`SELECT * FROM folders WHERE workspace_id = ? AND parent_folder_id IS NULL ORDER BY name`)
            .bind(this.workspaceId)
        : this.db
            .prepare(`SELECT * FROM folders WHERE workspace_id = ? AND parent_folder_id = ? ORDER BY name`)
            .bind(this.workspaceId, parentFolderId);
    const result = await statement.all<FolderRow>();
    return result.results ?? [];
  }

  async insert(row: FolderRow): Promise<void> {
    if (row.workspace_id !== this.workspaceId) {
      throw new Error("Refusing to insert a folder row belonging to another workspace.");
    }
    await this.db
      .prepare(
        `INSERT INTO folders (id, workspace_id, parent_folder_id, name, path, created_by, created_at)
         VALUES (?, ?, ?, ?, ?, ?, ?)`
      )
      .bind(row.id, this.workspaceId, row.parent_folder_id, row.name, row.path, row.created_by, row.created_at)
      .run();
  }

  async delete(id: string): Promise<boolean> {
    const result = await this.db
      .prepare(`DELETE FROM folders WHERE workspace_id = ? AND id = ?`)
      .bind(this.workspaceId, id)
      .run();
    return (result.meta.changes ?? 0) > 0;
  }
}

export class WorkspaceScopedAgents extends WorkspaceScoped {
  async getById(id: string): Promise<AgentRow | null> {
    return this.db
      .prepare(`SELECT * FROM agents WHERE workspace_id = ? AND id = ?`)
      .bind(this.workspaceId, id)
      .first<AgentRow>();
  }

  async list(): Promise<AgentRow[]> {
    const result = await this.db
      .prepare(`SELECT * FROM agents WHERE workspace_id = ? ORDER BY created_at DESC`)
      .bind(this.workspaceId)
      .all<AgentRow>();
    return result.results ?? [];
  }

  async insert(row: AgentRow): Promise<void> {
    if (row.workspace_id !== this.workspaceId) {
      throw new Error("Refusing to insert an agent row belonging to another workspace.");
    }
    await this.db
      .prepare(
        `INSERT INTO agents (id, workspace_id, name, description, status, created_by_user_id, last_seen_at, created_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)`
      )
      .bind(row.id, this.workspaceId, row.name, row.description, row.status,
            row.created_by_user_id, row.last_seen_at, row.created_at)
      .run();
  }
}

export class WorkspaceScopedApiKeys extends WorkspaceScoped {
  async list(): Promise<ApiKeyRow[]> {
    const result = await this.db
      .prepare(`SELECT * FROM api_keys WHERE workspace_id = ? ORDER BY created_at DESC`)
      .bind(this.workspaceId)
      .all<ApiKeyRow>();
    return result.results ?? [];
  }

  async getById(id: string): Promise<ApiKeyRow | null> {
    return this.db
      .prepare(`SELECT * FROM api_keys WHERE workspace_id = ? AND id = ?`)
      .bind(this.workspaceId, id)
      .first<ApiKeyRow>();
  }

  async revoke(id: string, now: number): Promise<boolean> {
    const result = await this.db
      .prepare(`UPDATE api_keys SET revoked_at = ? WHERE workspace_id = ? AND id = ? AND revoked_at IS NULL`)
      .bind(now, this.workspaceId, id)
      .run();
    return (result.meta.changes ?? 0) > 0;
  }
}

export class WorkspaceScopedAuditEvents extends WorkspaceScoped {
  async append(row: AuditEventRow): Promise<void> {
    if (row.workspace_id !== this.workspaceId) {
      throw new Error("Refusing to append an audit event belonging to another workspace.");
    }
    await this.db
      .prepare(
        `INSERT INTO audit_events (
           id, workspace_id, actor_type, actor_id, action, resource_type,
           resource_id, result, ip, client, request_id, metadata, created_at
         ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
      )
      .bind(row.id, this.workspaceId, row.actor_type, row.actor_id, row.action,
            row.resource_type, row.resource_id, row.result, row.ip, row.client,
            row.request_id, row.metadata, row.created_at)
      .run();
  }

  async list(limit = 50): Promise<AuditEventRow[]> {
    const result = await this.db
      .prepare(`SELECT * FROM audit_events WHERE workspace_id = ? ORDER BY created_at DESC LIMIT ?`)
      .bind(this.workspaceId, limit)
      .all<AuditEventRow>();
    return result.results ?? [];
  }
}

/**
 * The denormalized usage counters on the workspace row (05 PART 11.1).
 *
 * Scoped like everything else: the workspace ID is bound in the constructor, so
 * no caller can adjust another workspace's quota.
 *
 * Deltas are applied with `MAX(0, current + delta)` rather than a bare add. The
 * counters are denormalized, the reconciliation job (10.8) is what makes them
 * eventually true, and a transient double-decrement must not leave a workspace
 * with negative usage that then reads as free storage.
 */
export class WorkspaceScopedCounters extends WorkspaceScoped {
  async apply(delta: { bytes?: number; files?: number; egressBytes?: number }, now: number): Promise<void> {
    const bytes = delta.bytes ?? 0;
    const files = delta.files ?? 0;
    const egress = delta.egressBytes ?? 0;
    if (bytes === 0 && files === 0 && egress === 0) return;

    await this.db
      .prepare(
        `UPDATE workspaces
            SET storage_bytes_used  = MAX(0, storage_bytes_used + ?),
                file_count          = MAX(0, file_count + ?),
                egress_bytes_period = MAX(0, egress_bytes_period + ?),
                updated_at          = ?
          WHERE id = ?`
      )
      .bind(bytes, files, egress, now, this.workspaceId)
      .run();
  }
}

/**
 * The single place a request's repositories are built. Called once per request,
 * after authorization has resolved which workspace the caller may act in -
 * never from a client-supplied field.
 */
export function createWorkspaceContext(db: D1Database, workspaceId: string) {
  return {
    files: new WorkspaceScopedFiles(db, workspaceId),
    folders: new WorkspaceScopedFolders(db, workspaceId),
    agents: new WorkspaceScopedAgents(db, workspaceId),
    apiKeys: new WorkspaceScopedApiKeys(db, workspaceId),
    auditEvents: new WorkspaceScopedAuditEvents(db, workspaceId),
    counters: new WorkspaceScopedCounters(db, workspaceId),
  };
}

export type WorkspaceContext = ReturnType<typeof createWorkspaceContext>;
