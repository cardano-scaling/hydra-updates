import Link from "next/link";
import type { Deliverable } from "@/lib/types";
import { formatShort } from "@/lib/format";
import { StatusBadge } from "./status-badge";

// The program window the whole timeline is scaled to: Jul 1 → Dec 31 2026.
const WIN_START = Date.UTC(2026, 6, 1);
const WIN_END = Date.UTC(2026, 11, 31);
const SPAN = WIN_END - WIN_START;
const MONTHS = ["Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

const DUE_COLOR = "var(--status-progress)"; // amber — the committed deadline
const DONE_COLOR = "var(--status-done)"; // green — actual delivery

/** Position of a date as a 0–100% offset along the window (clamped). */
function pct(ymd: string): number {
  const t = Date.parse(`${ymd}T00:00:00Z`);
  return Math.max(0, Math.min(100, ((t - WIN_START) / SPAN) * 100));
}

/** Week boundaries (Mondays) within the window, as percentages. */
function weekTicks(): number[] {
  const ticks: number[] = [];
  const d = new Date(WIN_START);
  d.setUTCDate(d.getUTCDate() + ((8 - d.getUTCDay()) % 7)); // first Monday in window
  while (d.getTime() <= WIN_END) {
    ticks.push(((d.getTime() - WIN_START) / SPAN) * 100);
    d.setUTCDate(d.getUTCDate() + 7);
  }
  return ticks;
}

function monthMarks() {
  return MONTHS.map((m, i) => {
    const start = Date.UTC(2026, 6 + i, 1);
    const next = Date.UTC(2026, 6 + i + 1, 1);
    return { m, left: ((start - WIN_START) / SPAN) * 100, width: ((next - start) / SPAN) * 100 };
  });
}

/** Keep marker labels inside the track edges. */
function labelStyle(p: number): React.CSSProperties {
  if (p <= 12) return { left: `${p}%` };
  if (p >= 88) return { right: `${100 - p}%` };
  return { left: `${p}%`, transform: "translateX(-50%)" };
}

function Marker({
  at,
  color,
  label,
  date,
}: {
  at: number;
  color: string;
  label: string;
  date: string;
}) {
  return (
    <>
      <span
        aria-hidden
        className="absolute inset-y-0 w-0.5"
        style={{ left: `${at}%`, backgroundColor: color, transform: "translateX(-50%)" }}
      />
      <span
        aria-hidden
        className="absolute top-0 h-2 w-2 -translate-y-1/2 rounded-full"
        style={{ left: `${at}%`, backgroundColor: color, transform: "translate(-50%,-50%)" }}
      />
      <span
        className="absolute -top-5 hidden whitespace-nowrap font-mono text-[0.6rem] uppercase tracking-wider sm:block"
        style={{ ...labelStyle(at), color }}
      >
        {label} {formatShort(date)}
      </span>
    </>
  );
}

function Track({ d, ticks, today }: { d: Deliverable; ticks: number[]; today: number }) {
  const due = d.dueDate ? pct(d.dueDate) : null;
  const delivered = d.deliveredDate ? pct(d.deliveredDate) : null;

  return (
    <div className="relative mt-6 h-10 rounded-md border border-border bg-surface-2/40">
      {/* thin week ticks */}
      {ticks.map((left, i) => (
        <span
          key={i}
          aria-hidden
          className="absolute inset-y-1.5 w-px bg-border/70"
          style={{ left: `${left}%` }}
        />
      ))}

      {/* today */}
      {today >= 0 && today <= 100 && (
        <span
          aria-hidden
          className="absolute inset-y-0 w-px bg-primary/50"
          style={{ left: `${today}%` }}
        />
      )}

      {/* ongoing work has no single deadline — show a spanning bar instead */}
      {!d.dueDate && (
        <span
          aria-hidden
          className="absolute inset-y-3 left-1 right-1 rounded-full"
          style={{ backgroundColor: DONE_COLOR, opacity: 0.22 }}
        />
      )}

      {/* progress connector from delivery to deadline, when delivered early */}
      {due !== null && delivered !== null && delivered < due && (
        <span
          aria-hidden
          className="absolute inset-y-4 rounded-full"
          style={{
            left: `${delivered}%`,
            width: `${due - delivered}%`,
            backgroundColor: DONE_COLOR,
            opacity: 0.25,
          }}
        />
      )}

      {due !== null && <Marker at={due} color={DUE_COLOR} label="Due" date={d.dueDate!} />}
      {delivered !== null && (
        <Marker at={delivered} color={DONE_COLOR} label="Shipped" date={d.deliveredDate!} />
      )}
    </div>
  );
}

/**
 * Each deliverable rendered as a track on a shared Jul→Dec 2026 timeline: thin
 * ticks mark weeks; the amber line is the committed deadline; the green line is
 * when it actually shipped (we aim to ship before the deadline).
 */
export function DeliverableTimeline({ deliverables }: { deliverables: Deliverable[] }) {
  const ticks = weekTicks();
  const months = monthMarks();
  const today = pct(new Date().toISOString().slice(0, 10));

  return (
    <div>
      {/* legend */}
      <div className="flex flex-wrap items-center gap-x-5 gap-y-1 font-mono text-[0.65rem] uppercase tracking-wider text-muted">
        <span className="inline-flex items-center gap-1.5">
          <span className="h-2.5 w-0.5" style={{ backgroundColor: DUE_COLOR }} /> Deadline
        </span>
        <span className="inline-flex items-center gap-1.5">
          <span className="h-2.5 w-0.5" style={{ backgroundColor: DONE_COLOR }} /> Shipped
        </span>
        <span className="inline-flex items-center gap-1.5">
          <span className="h-2.5 w-px bg-border" /> Week
        </span>
        <span className="inline-flex items-center gap-1.5">
          <span className="h-2.5 w-px bg-primary/50" /> Today
        </span>
      </div>

      {/* month axis */}
      <div className="relative mt-4 h-5 border-b border-border">
        {months.map((mo) => (
          <span
            key={mo.m}
            className="absolute top-0 font-mono text-[0.65rem] uppercase tracking-wider text-muted"
            style={{ left: `${mo.left}%`, width: `${mo.width}%`, textAlign: "center" }}
          >
            {mo.m}
          </span>
        ))}
      </div>

      {/* one row per deliverable */}
      <div className="mt-2 flex flex-col divide-y divide-border">
        {deliverables.map((d, i) => (
          <div key={d.id} className="ledger-in py-6" style={{ animationDelay: `${i * 50}ms` }}>
            <div className="flex flex-wrap items-center justify-between gap-2">
              <Link
                href={`/deliverables/#${d.slug}`}
                className="group inline-flex items-baseline gap-2"
              >
                <span className="font-mono text-xs tracking-wider text-primary">{d.id}</span>
                <span className="font-display text-lg font-semibold tracking-tight text-foreground group-hover:text-primary">
                  {d.title}
                </span>
              </Link>
              <StatusBadge status={d.status} />
            </div>
            <p className="mt-2 max-w-3xl text-sm leading-6 text-muted">{d.description}</p>
            <Track d={d} ticks={ticks} today={today} />
          </div>
        ))}
      </div>
    </div>
  );
}
