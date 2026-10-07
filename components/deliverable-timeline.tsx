import Link from "next/link";
import { isMilestoneComplete, type Deliverable, type DeliverableUpdate } from "@/lib/types";
import { formatShort } from "@/lib/format";
import { StatusBadge } from "./status-badge";

// The program window the whole timeline is scaled to: Jun 1 2026 → Jan 31 2027.
// Starts in June to cover the pre-funding backfill weeks (the last milestone,
// M6.1, is due 30 Jan 2027).
const WIN_START = Date.UTC(2026, 5, 1);
const WIN_END = Date.UTC(2027, 0, 31);
const SPAN = WIN_END - WIN_START;
const MONTHS = ["Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec", "Jan"];

// Leave a small gutter at each end so markers/labels never sit on the track edge.
const EDGE = 3;

const DUE_COLOR = "var(--status-progress)"; // amber — deadline still outstanding
const DONE_COLOR = "var(--status-done)"; // green — delivered, or a deadline already met

// Marker labels sit in rows above the track; a label that would run into a
// neighbour's is bumped up a row. Collisions depend on pixel widths, so rows
// are resolved for the track width at the low end of each Tailwind breakpoint
// that shows labels (page max-w-6xl px-6, card sm:p-8), and CSS picks the row
// for the current breakpoint through the --slot custom property.
const TRACK_PX = { sm: 511, md: 639, lg: 895, xl: 1038 } as const;
type Bp = keyof typeof TRACK_PX;
const BPS = Object.keys(TRACK_PX) as Bp[];
type PerBp = Record<Bp, number>;
// Geist Mono at text-[0.6rem] with tracking-wider advances 0.65em per character.
const CHAR_PX = 0.65 * 0.6 * 16;
const LABEL_PAD_PX = 4; // px-1 on each side of the label box
const LABEL_GAP_PX = 8;
// Label geometry in rem: where row 0 sits above the track, the pitch between
// rows, and the track's top margin at row 0.
const LABEL_TOP_REM = 1.5;
const ROW_REM = 1.25;
const TRACK_MT_REM = 2;
const SLOT_CLASS =
  "[--slot:0] sm:[--slot:var(--slot-sm)] md:[--slot:var(--slot-md)] lg:[--slot:var(--slot-lg)] xl:[--slot:var(--slot-xl)]";
const ROWS_CLASS =
  "[--rows:0] sm:[--rows:var(--rows-sm)] md:[--rows:var(--rows-md)] lg:[--rows:var(--rows-lg)] xl:[--rows:var(--rows-xl)]";

const clamp01 = (n: number) => Math.max(0, Math.min(1, n));
/** Map a raw window fraction (0–1) to a percentage inside the gutters. */
const xFromFrac = (f: number) => EDGE + f * (100 - 2 * EDGE);
const fracMs = (ms: number) => clamp01((ms - WIN_START) / SPAN);

/** Position of a date as a gutter-inset percentage along the window. */
function pct(ymd: string): number {
  return xFromFrac(fracMs(Date.parse(`${ymd}T00:00:00Z`)));
}

/** Week boundaries (Mondays) within the window, as percentages. */
function weekTicks(): number[] {
  const ticks: number[] = [];
  const d = new Date(WIN_START);
  d.setUTCDate(d.getUTCDate() + ((8 - d.getUTCDay()) % 7)); // first Monday in window
  while (d.getTime() <= WIN_END) {
    ticks.push(xFromFrac(fracMs(d.getTime())));
    d.setUTCDate(d.getUTCDate() + 7);
  }
  return ticks;
}

function monthMarks() {
  return MONTHS.map((m, i) => {
    const left = xFromFrac(fracMs(Date.UTC(2026, 5 + i, 1)));
    const right = xFromFrac(fracMs(Date.UTC(2026, 5 + i + 1, 1)));
    return { m, left, width: right - left };
  });
}
// Date.UTC normalizes month overflow (e.g. month 12 → Jan of next year), so the
// Jul→Jan window maps correctly without special-casing the year boundary.

const byBp = <T,>(f: (bp: Bp) => T): Record<Bp, T> =>
  Object.fromEntries(BPS.map((bp) => [bp, f(bp)])) as Record<Bp, T>;

/** Inline `--<name>-<bp>` custom properties, read by SLOT_CLASS / ROWS_CLASS. */
function bpVars(name: string, values: PerBp): React.CSSProperties {
  return Object.fromEntries(BPS.map((bp) => [`--${name}-${bp}`, values[bp]])) as React.CSSProperties;
}

type Align = "left" | "center" | "right";

/** Keep marker labels inside the track edges. */
function labelAlign(p: number): Align {
  if (p <= 14) return "left";
  if (p >= 86) return "right";
  return "center";
}

function labelPos(align: Align, p: number): React.CSSProperties {
  if (align === "left") return { left: `${p}%` };
  if (align === "right") return { right: `${100 - p}%` };
  return { left: `${p}%`, transform: "translateX(-50%)" };
}

/** First-fit row for each label when laid out on a track `trackPx` wide. */
function assignRows(
  labels: { at: number; text: string; align: Align }[],
  trackPx: number,
): number[] {
  const boxes = labels.map(({ at, text, align }, i) => {
    const x = (at / 100) * trackPx;
    const w = text.length * CHAR_PX + 2 * LABEL_PAD_PX;
    const x0 = align === "left" ? x : align === "right" ? x - w : x - w / 2;
    return { i, x0, x1: x0 + w };
  });
  boxes.sort((a, b) => a.x0 - b.x0);
  const rows: number[] = [];
  const rowEnd: number[] = [];
  for (const b of boxes) {
    let r = rowEnd.findIndex((end) => end + LABEL_GAP_PX <= b.x0);
    if (r < 0) r = rowEnd.length;
    rowEnd[r] = b.x1;
    rows[b.i] = r;
  }
  return rows;
}

/** Keep a marker's tooltip inside the track edges. */
function tipStyle(p: number): React.CSSProperties {
  if (p < 22) return { left: 0 };
  if (p > 78) return { right: 0 };
  return { left: "50%", transform: "translateX(-50%)" };
}

/**
 * An intermediate improvement: a dot on the track that reveals a description on
 * hover/focus and links to the weekly update that reported it.
 */
function UpdateMarker({ u }: { u: DeliverableUpdate }) {
  const at = pct(u.date);
  return (
    <Link
      href={`/updates/${u.week.toLowerCase()}/`}
      aria-label={`Update ${formatShort(u.date)}: ${u.description}`}
      className="group absolute top-1/2 z-20 h-3 w-3 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-surface bg-primary ring-1 ring-primary/50 transition-transform hover:scale-125 focus-visible:scale-125 focus-visible:outline-none"
      style={{ left: `${at}%` }}
    >
      <span
        role="tooltip"
        className="pointer-events-none absolute bottom-full z-30 mb-2 hidden w-52 rounded-md border border-border bg-surface p-3 text-left shadow-lg group-hover:block group-focus-visible:block"
        style={tipStyle(at)}
      >
        <span className="block font-mono text-[0.6rem] uppercase tracking-wider text-primary">
          {formatShort(u.date)} · {u.week}
        </span>
        <span className="mt-1 block text-xs leading-snug text-foreground">{u.description}</span>
        <span className="mt-2 block font-mono text-[0.6rem] uppercase tracking-wider text-muted">
          View weekly update ↗
        </span>
      </span>
    </Link>
  );
}

interface MarkerSpec {
  key: string;
  at: number;
  color: string;
  /** Label text, e.g. "Shipped Jun 30". */
  text: string;
  align: Align;
  /** A hollow ring marks a ship date; a filled dot marks a deadline. */
  hollow: boolean;
  /** Tooltip from the dot on hover/focus: a mono heading and an optional line of detail. */
  tipHead: string;
  tipBody?: string;
}

function Marker({
  at,
  color,
  text,
  align,
  hollow,
  tipHead,
  tipBody,
  rows,
}: Omit<MarkerSpec, "key"> & {
  /** Label row per breakpoint; row 0 sits just above the track. */
  rows: PerBp;
}) {
  const dotStyle = {
    left: `${at}%`,
    transform: "translate(-50%,-50%)",
    ...(hollow ? { borderColor: color } : { backgroundColor: color }),
  };
  return (
    // display: contents so --slot reaches the line, dot and label without adding a box.
    <span className={`contents ${SLOT_CLASS}`} style={bpVars("slot", rows)}>
      {/* The line runs up behind the label box and shows from its underline down. */}
      <span
        aria-hidden
        className="absolute bottom-0 w-0.5"
        style={{
          left: `${at}%`,
          top: `calc(-${LABEL_TOP_REM}rem - var(--slot) * ${ROW_REM}rem)`,
          backgroundColor: color,
          transform: "translateX(-50%)",
        }}
      />
      {/* The dot is the hover target (the line is not), matching the update markers. */}
      <span
        tabIndex={0}
        aria-label={tipBody ? `${tipHead}: ${tipBody}` : tipHead}
        className={`group absolute top-0 z-20 cursor-help rounded-full focus-visible:outline-none ${
          hollow ? "h-2.5 w-2.5 border-2 bg-surface" : "h-2 w-2"
        }`}
        style={dotStyle}
      >
        {/* Widens the hover/focus target without changing how the dot looks. */}
        <span aria-hidden className="absolute -inset-1.5 rounded-full" />
        {/* The bottom margin clears the date label in its row. */}
        <span
          role="tooltip"
          className="pointer-events-none absolute bottom-full z-30 hidden w-52 rounded-md border border-border bg-surface p-3 text-left shadow-lg group-hover:block group-focus-visible:block"
          style={{
            ...tipStyle(at),
            marginBottom: `calc(${LABEL_TOP_REM}rem + var(--slot) * ${ROW_REM}rem)`,
          }}
        >
          <span className="block font-mono text-[0.6rem] uppercase tracking-wider" style={{ color }}>
            {tipHead}
          </span>
          {tipBody && (
            <span className="mt-1 block text-xs leading-snug text-foreground">{tipBody}</span>
          )}
        </span>
      </span>
      {/* Underlined, and opaque so leaders from other markers pass behind it. */}
      <span
        className="absolute z-10 hidden whitespace-nowrap border-b bg-surface px-1 pb-0.5 font-mono text-[0.6rem] uppercase leading-none tracking-wider sm:block"
        style={{
          ...labelPos(align, at),
          color,
          borderBottomColor: `color-mix(in oklab, ${color} 60%, transparent)`,
          top: `calc(-${LABEL_TOP_REM}rem - var(--slot) * ${ROW_REM}rem)`,
        }}
      >
        {text}
      </span>
    </span>
  );
}

function Track({ d, ticks, today }: { d: Deliverable; ticks: number[]; today: number }) {
  // A workstream carries one or more milestones; each with a due or delivered
  // date becomes a marker. Ongoing work (no dated milestone) shows a spanning
  // bar instead.
  const dated = d.milestones.filter((m) => m.dueDate || m.deliveredDate);
  const hasDeadline = dated.length > 0;

  // The milestone id labels the deadline so multiple markers stay distinct; a
  // completed milestone's deadline goes green rather than staying amber.
  const markers = dated.flatMap((m) => {
    const out: MarkerSpec[] = [];
    if (m.dueDate) {
      const at = pct(m.dueDate);
      out.push({
        key: `${m.id}-due`,
        at,
        color: isMilestoneComplete(m) ? DONE_COLOR : DUE_COLOR,
        text: `${m.id} ${formatShort(m.dueDate)}`,
        align: labelAlign(at),
        hollow: false,
        tipHead: `${m.id} · Due ${formatShort(m.dueDate)}`,
        tipBody: m.title,
      });
    }
    if (m.deliveredDate) {
      out.push({
        key: `${m.id}-shipped`,
        at: pct(m.deliveredDate),
        color: DONE_COLOR,
        text: `Shipped ${formatShort(m.deliveredDate)}`,
        align: "center",
        hollow: true,
        tipHead: `${m.id} · Shipped ${formatShort(m.deliveredDate)}`,
        // The deadline marker carries the title; repeat it only when there is none.
        tipBody: m.dueDate ? undefined : m.title,
      });
    }
    return out;
  });
  const rowsByBp = byBp((bp) => assignRows(markers, TRACK_PX[bp]));
  const extraRows = byBp((bp) => Math.max(0, ...rowsByBp[bp]));

  return (
    // Extra label rows push the track down so they stay inside the row's padding.
    <div
      className={`relative h-14 rounded-lg border border-border bg-surface-2 shadow-inner ${ROWS_CLASS}`}
      style={{
        marginTop: `calc(${TRACK_MT_REM}rem + var(--rows) * ${ROW_REM}rem)`,
        ...bpVars("rows", extraRows),
      }}
    >
      {/* thin week ticks */}
      {ticks.map((left, i) => (
        <span
          key={i}
          aria-hidden
          className="absolute inset-y-2.5 w-px bg-border"
          style={{ left: `${left}%` }}
        />
      ))}

      {/* today line + a label under each track so the now-line is obvious on every row */}
      {today >= 0 && today <= 100 && (
        <>
          <span
            aria-hidden
            className="absolute inset-y-0 w-px bg-primary/50"
            style={{ left: `${today}%` }}
          />
          <span
            className="absolute top-full mt-0.5 -translate-x-1/2 whitespace-nowrap font-mono text-[0.55rem] uppercase tracking-wider text-primary/80"
            style={{ left: `${today}%` }}
          >
            Today
          </span>
        </>
      )}

      {/* ongoing work has no single deadline — show a spanning bar instead */}
      {!hasDeadline && (
        <span
          aria-hidden
          className="absolute inset-y-5 rounded-full"
          style={{ left: `${EDGE}%`, right: `${EDGE}%`, backgroundColor: DONE_COLOR, opacity: 0.22 }}
        />
      )}

      {/* progress connector from delivery to deadline, when delivered early */}
      {dated.map((m) => {
        const due = m.dueDate ? pct(m.dueDate) : null;
        const delivered = m.deliveredDate ? pct(m.deliveredDate) : null;
        if (delivered === null || due === null || delivered >= due) return null;
        return (
          <span
            key={m.id}
            aria-hidden
            className="absolute inset-y-6 rounded-full"
            style={{
              left: `${delivered}%`,
              width: `${due - delivered}%`,
              backgroundColor: DONE_COLOR,
              opacity: 0.25,
            }}
          />
        );
      })}

      {markers.map(({ key, ...k }, i) => (
        <Marker key={key} {...k} rows={byBp((bp) => rowsByBp[bp][i])} />
      ))}

      {/* intermediate improvements along the way */}
      {d.updates.map((u) => (
        <UpdateMarker key={`${u.date}-${u.week}`} u={u} />
      ))}
    </div>
  );
}

/**
 * Each deliverable rendered as a track on a shared Jun 2026→Jan 2027 timeline: thin
 * ticks mark weeks; amber is a deadline still outstanding; green is either the
 * date something shipped (a hollow ring) or a deadline already met (we aim to
 * ship before the deadline); blue dots are intermediate improvements linking to
 * their weekly update.
 */
export function DeliverableTimeline({ deliverables }: { deliverables: Deliverable[] }) {
  const ticks = weekTicks();
  const months = monthMarks();
  const today = pct(new Date().toISOString().slice(0, 10));

  return (
    <div className="rounded-xl border border-border bg-surface p-6 shadow-sm sm:p-8">
      {/* legend */}
      <div className="flex flex-wrap items-center gap-x-5 gap-y-1 font-mono text-[0.65rem] uppercase tracking-wider text-muted">
        <span className="inline-flex items-center gap-1.5">
          <span className="h-2.5 w-0.5" style={{ backgroundColor: DUE_COLOR }} /> Deadline (open)
        </span>
        <span className="inline-flex items-center gap-1.5">
          <span className="h-2.5 w-0.5" style={{ backgroundColor: DONE_COLOR }} /> Deadline (met)
        </span>
        <span className="inline-flex items-center gap-1.5">
          <span
            className="h-2.5 w-2.5 rounded-full border-2 bg-surface"
            style={{ borderColor: DONE_COLOR }}
          />{" "}
          Shipped
        </span>
        <span className="inline-flex items-center gap-1.5">
          <span className="h-2 w-2 rounded-full bg-primary" /> Update
        </span>
        <span className="inline-flex items-center gap-1.5">
          <span className="h-2.5 w-px bg-border" /> Week
        </span>
        <span className="inline-flex items-center gap-1.5">
          <span className="h-2.5 w-px bg-primary/50" /> Today
        </span>
      </div>

      {/* month axis */}
      <div className="relative mt-5 h-5 border-b border-border">
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
      <div className="flex flex-col divide-y divide-border">
        {deliverables.map((d, i) => (
          <div key={d.id} className="ledger-in py-8" style={{ animationDelay: `${i * 50}ms` }}>
            <div className="flex flex-wrap items-center justify-between gap-2">
              <Link
                href={`/deliverables/${d.slug}/`}
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
