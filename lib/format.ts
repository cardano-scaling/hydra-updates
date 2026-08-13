// Small formatting helpers shared across pages. All dates are treated as UTC so
// build output is deterministic regardless of the build machine's timezone.

const DATE_OPTS: Intl.DateTimeFormatOptions = { month: "short", day: "numeric", timeZone: "UTC" };

/** "2026-06-29", "2026-07-05" -> "Jun 29 – Jul 5, 2026". */
export function formatDateRange(startYmd: string, endYmd: string): string {
  const start = new Date(`${startYmd}T00:00:00Z`);
  const end = new Date(`${endYmd}T00:00:00Z`);
  const s = start.toLocaleDateString("en-US", DATE_OPTS);
  const e = end.toLocaleDateString("en-US", { ...DATE_OPTS, year: "numeric" });
  return `${s} – ${e}`;
}

/** "2026-07-06" -> "Jul 6, 2026". */
export function formatDate(ymd: string): string {
  return new Date(`${ymd}T00:00:00Z`).toLocaleDateString("en-US", {
    ...DATE_OPTS,
    year: "numeric",
  });
}

/** "2026-07-06" -> "Jul 6". */
export function formatShort(ymd: string): string {
  return new Date(`${ymd}T00:00:00Z`).toLocaleDateString("en-US", DATE_OPTS);
}

/**
 * Whole days from today to a YYYY-MM-DD date; negative once it's past. Both
 * ends are snapped to UTC midnight so the result is a clean day count rather
 * than a fractional one. Evaluated at build time under `output: 'export'`, so
 * it's accurate as of the last deploy.
 */
export function daysUntil(ymd: string): number {
  const today = Date.parse(`${new Date().toISOString().slice(0, 10)}T00:00:00Z`);
  return Math.round((Date.parse(`${ymd}T00:00:00Z`) - today) / 86_400_000);
}

/** A day count as a short human phrase: "41 days", "Tomorrow", "3 days overdue". */
export function formatCountdown(days: number): string {
  if (days === 0) return "Today";
  if (days === 1) return "Tomorrow";
  if (days === -1) return "1 day overdue";
  if (days < 0) return `${-days} days overdue`;
  return `${days} days`;
}

/** ISO week key "2026-W27" -> { label: "Week 27", year: "2026" }. */
export function weekParts(week: string): { label: string; year: string } {
  const m = week.match(/^(\d{4})-W(\d+)$/i);
  if (!m) return { label: week, year: "" };
  return { label: `Week ${Number(m[2])}`, year: m[1] };
}
