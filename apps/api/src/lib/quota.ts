/**
 * Quota checks - 02 PART 6.5, run in the authorization middleware before any
 * business logic, returning 429 LIMIT_EXCEEDED naming the dimension that was hit.
 *
 * Scope note: this enforces against the denormalized counters on the workspace
 * row. Those counters are maintained by whoever writes - the storage layer
 * increments storage/file counts, the rate limiter increments requests. Until
 * those writers exist the checks pass trivially, which is correct: the check is
 * live now, so the moment a counter starts moving it is already enforced. What
 * this file must not do is pretend to enforce a dimension nobody is measuring.
 */

import { ApiError } from "./errors";
import type { PlanLimits } from "./plans";
import type { WorkspaceRow } from "../db/types";

export type QuotaDimension = "storage" | "files" | "egress" | "requests" | "agents" | "keys";

export interface QuotaDemand {
  /** Bytes this request is about to add to stored size. */
  bytes?: number;
  /** Files this request is about to create. */
  files?: number;
  /** Bytes this request is about to account as egress. */
  egressBytes?: number;
}

function exceeded(
  limit: QuotaDimension,
  message: string,
  used: number,
  max: number
): ApiError {
  return new ApiError("LIMIT_EXCEEDED", message, { details: { limit, used, max } });
}

/**
 * Period counters (egress, requests) reset on a schedule. If the reset moment
 * has passed but the reconciliation job has not run yet, the stored counter is
 * stale and must read as zero - otherwise a workspace that hit its monthly cap
 * stays locked out past the end of the month, which is the kind of bug that
 * only shows up in production on the first of the month.
 */
function periodCounter(value: number, workspace: WorkspaceRow, now: number): number {
  return now >= workspace.period_reset_at ? 0 : value;
}

export function assertWithinQuota(
  workspace: WorkspaceRow,
  limits: PlanLimits,
  demand: QuotaDemand,
  now: number
): void {
  const requests = periodCounter(workspace.requests_period, workspace, now);
  if (requests >= limits.requestsPerPeriod) {
    throw exceeded(
      "requests",
      "This workspace has used its request allowance for the current period.",
      requests,
      limits.requestsPerPeriod
    );
  }

  if (demand.bytes !== undefined && demand.bytes > 0) {
    const projected = workspace.storage_bytes_used + demand.bytes;
    if (projected > limits.storageBytes) {
      throw exceeded(
        "storage",
        "This workspace has reached its storage limit. Upgrade to add more.",
        workspace.storage_bytes_used,
        limits.storageBytes
      );
    }
  }

  if (demand.files !== undefined && demand.files > 0) {
    const projected = workspace.file_count + demand.files;
    if (projected > limits.fileCount) {
      throw exceeded(
        "files",
        "This workspace has reached its file-count limit. Upgrade to add more.",
        workspace.file_count,
        limits.fileCount
      );
    }
  }

  if (demand.egressBytes !== undefined && demand.egressBytes > 0) {
    const egress = periodCounter(workspace.egress_bytes_period, workspace, now);
    if (egress + demand.egressBytes > limits.egressBytesPerPeriod) {
      throw exceeded(
        "egress",
        "This workspace has used its egress allowance for the current period.",
        egress,
        limits.egressBytesPerPeriod
      );
    }
  }
}

/** Per-file size cap - checked before a presigned URL is ever issued (06 PART 16.13). */
export function assertFileSizeAllowed(sizeBytes: number, limits: PlanLimits): void {
  if (sizeBytes > limits.maxFileBytes) {
    throw new ApiError("PAYLOAD_TOO_LARGE", "That file is larger than this plan allows.", {
      details: { limit: "storage", used: sizeBytes, max: limits.maxFileBytes },
    });
  }
}
