"use client";

import { useSyncExternalStore } from "react";
import { daysUntil, formatCountdown } from "@/lib/format";

// The day count is the one figure on the site that rots between deploys: a
// static export bakes it at build time and it then drifts a day per day. So
// recompute it in the browser.
//
// useSyncExternalStore (rather than useState + useEffect) because React uses
// getServerSnapshot for both the server render *and* hydration, then swaps to
// getSnapshot — which is exactly the "value differs on the client" contract,
// with no hydration mismatch and no setState inside an effect.

// Nothing to subscribe to: the value can't change without a re-render, and a
// visitor leaving the page open across midnight is not worth a timer. Must be
// module-level so its identity is stable across renders.
const subscribe = () => () => {};

export function DueCountdown({
  dueDate,
  /** Build-time day count; what the server rendered and what no-JS visitors see. */
  builtDays,
}: {
  dueDate: string;
  builtDays: number;
}) {
  const days = useSyncExternalStore(
    subscribe,
    () => daysUntil(dueDate),
    () => builtDays,
  );

  // Red once the deadline has passed, amber inside a fortnight of it.
  const color =
    days < 0
      ? "var(--status-blocked)"
      : days <= 14
        ? "var(--status-progress)"
        : "var(--foreground)";

  return (
    <div className="bg-surface px-4 py-4">
      <dt className="font-mono text-[0.65rem] uppercase tracking-wider text-muted">
        {days < 0 ? "Overdue" : "Time remaining"}
      </dt>
      <dd className="mt-1 font-display text-2xl font-semibold" style={{ color }}>
        {formatCountdown(days)}
      </dd>
    </div>
  );
}
