/**
 * The weekly print batch. Pure date arithmetic, shared by the API and the
 * order desk so both agree on which orders are "this week".
 *
 *   Tue 12:00  cutoff — orders paid before it are this week's batch
 *   Tue–Wed    print and pack
 *   Thu        carrier pickup (Coordinadora takes same-day requests before 11:00)
 *
 * Thursday rather than Friday so a parcel is not parked in a depot over the
 * weekend, and rather than Monday because most Colombian public holidays are
 * moved to a Monday. The worst case — paid Tuesday 12:01 — leaves nine days
 * later, inside the store's "ships in 1–10 days".
 *
 * All times are Bogotá (UTC−5, no daylight saving), whatever the server's or
 * the browser's zone.
 */

const BOGOTA_OFFSET_MS = -5 * 60 * 60 * 1000;
const DAY_MS = 24 * 60 * 60 * 1000;

/** 0 = Sunday … 6 = Saturday, as Date#getUTCDay. */
export const CUTOFF_WEEKDAY = 2;
export const CUTOFF_HOUR = 12;
/** Days from cutoff to carrier pickup. */
export const DISPATCH_AFTER_DAYS = 2;

export interface SwagBatchWindow {
  /** Orders created strictly before this instant belong to the batch. ISO, UTC. */
  cutoff: string;
  /** The Thursday the batch leaves, as a Bogotá calendar date (YYYY-MM-DD). */
  dispatchDate: string;
  /**
   * collecting  the cutoff has not passed: new orders still join this batch
   * producing   the cutoff has passed and the batch is on the press; new orders
   *             wait for next week
   */
  phase: 'collecting' | 'producing';
}

function bogotaDate(ms: number): string {
  return new Date(ms + BOGOTA_OFFSET_MS).toISOString().slice(0, 10);
}

/** The batch the desk should be working on at `now`. */
export function currentBatch(now: Date = new Date()): SwagBatchWindow {
  // Work in "Bogotá wall-clock as if it were UTC", then shift back.
  const local = new Date(now.getTime() + BOGOTA_OFFSET_MS);
  const dow = local.getUTCDay();
  // Monday-start week: Sunday belongs to the week whose Tuesday has passed.
  const daysSinceMonday = (dow + 6) % 7;
  const monday = Date.UTC(local.getUTCFullYear(), local.getUTCMonth(), local.getUTCDate()) - daysSinceMonday * DAY_MS;
  const cutoffLocal = monday + (CUTOFF_WEEKDAY - 1) * DAY_MS + CUTOFF_HOUR * 60 * 60 * 1000;
  // The batch stays "this week's" until the end of dispatch day.
  const dispatchEndLocal = monday + (CUTOFF_WEEKDAY - 1 + DISPATCH_AFTER_DAYS + 1) * DAY_MS;

  let cutoff = cutoffLocal;
  let phase: SwagBatchWindow['phase'] = 'collecting';
  if (local.getTime() >= cutoffLocal && local.getTime() < dispatchEndLocal) {
    phase = 'producing';
  } else if (local.getTime() >= dispatchEndLocal) {
    cutoff = cutoffLocal + 7 * DAY_MS;
  }

  const cutoffUtc = cutoff - BOGOTA_OFFSET_MS;
  return {
    cutoff: new Date(cutoffUtc).toISOString(),
    dispatchDate: bogotaDate(cutoffUtc + DISPATCH_AFTER_DAYS * DAY_MS),
    phase,
  };
}
