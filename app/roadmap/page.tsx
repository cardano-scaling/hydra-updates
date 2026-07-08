import type { Metadata } from "next";
import Link from "next/link";
import { StatusBadge, statusColor } from "@/components/status-badge";
import { getConfig, getDeliverables } from "@/lib/content";
import type { Deliverable, Quarter } from "@/lib/types";

export const metadata: Metadata = {
  title: "Roadmap",
  description:
    "The Q3 → Q4 2026 timeline for the Cardano Developer Experience Initiative, distinguishing past, current, and upcoming milestones.",
};

type Phase = "past" | "current" | "upcoming" | "ongoing";

// Quarter bands for the six-month program. "Current" is decided at build time by
// comparing today's date to these bands; finer per-milestone dates can be added
// to content later without changing this page.
const BANDS: Record<Exclude<Quarter, "ongoing">, { label: string; months: string; start: string; end: string }> = {
  "Q3-2026": { label: "Q3 2026", months: "Jul – Sep 2026", start: "2026-07-01", end: "2026-09-30" },
  "Q4-2026": { label: "Q4 2026", months: "Oct – Dec 2026", start: "2026-10-01", end: "2026-12-31" },
};

const PHASE_META: Record<Phase, { label: string; className: string; dot: string }> = {
  past: { label: "Past", className: "border-border text-muted", dot: "var(--muted)" },
  current: {
    label: "Current",
    className: "border-primary text-[color:var(--on-primary-link)]",
    dot: "var(--primary)",
  },
  upcoming: { label: "Upcoming", className: "border-border text-muted", dot: "var(--surface-2)" },
  ongoing: {
    label: "Ongoing",
    className: "border-primary text-[color:var(--on-primary-link)]",
    dot: "var(--primary)",
  },
};

function phaseFor(quarter: Exclude<Quarter, "ongoing">, todayYmd: string): Phase {
  const band = BANDS[quarter];
  if (todayYmd > band.end) return "past";
  if (todayYmd < band.start) return "upcoming";
  return "current";
}

function DeliverableRow({ d }: { d: Deliverable }) {
  return (
    <li>
      <Link
        href={`/deliverables/#${d.slug}`}
        style={{ "--spine": statusColor(d.status) } as React.CSSProperties}
        className="group relative flex flex-wrap items-center justify-between gap-3 rounded-lg border border-border bg-surface p-4 pl-5 transition-colors before:absolute before:inset-y-0 before:left-0 before:w-1 before:rounded-l-lg before:bg-[color:var(--spine)] hover:border-primary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
      >
        <span className="min-w-0">
          <span className="font-mono text-xs tracking-wider text-primary">{d.id}</span>{" "}
          <span className="font-display text-base font-semibold text-foreground group-hover:text-primary">
            {d.title}
          </span>
        </span>
        <StatusBadge status={d.status} />
      </Link>
    </li>
  );
}

function PhaseNode({
  phase,
  title,
  subtitle,
  deliverables,
}: {
  phase: Phase;
  title: string;
  subtitle: string;
  deliverables: Deliverable[];
}) {
  const meta = PHASE_META[phase];
  return (
    <li className="relative pl-8">
      {/* Timeline dot on the rail. */}
      <span
        aria-hidden
        className="absolute left-0 top-1.5 h-3.5 w-3.5 -translate-x-1/2 rounded-full border-2 border-background"
        style={{ backgroundColor: meta.dot }}
      />
      <div className="flex flex-wrap items-baseline gap-3">
        <h2 className="font-display text-xl font-semibold tracking-tight text-foreground">
          {title}
        </h2>
        <span className="font-mono text-xs uppercase tracking-wider text-muted">{subtitle}</span>
        <span
          className={`rounded-full border px-2 py-0.5 font-mono text-[0.65rem] uppercase tracking-wider ${meta.className}`}
        >
          {meta.label}
        </span>
      </div>
      <ul className="mt-4 flex flex-col gap-3">
        {deliverables.map((d) => (
          <DeliverableRow key={d.id} d={d} />
        ))}
      </ul>
    </li>
  );
}

export default function RoadmapPage() {
  const deliverables = getDeliverables();
  const config = getConfig();
  const today = new Date().toISOString().slice(0, 10); // build-time date, UTC

  const byQuarter = (q: Quarter) => deliverables.filter((d) => d.quarter === q);

  return (
    <div className="mx-auto w-full max-w-4xl px-6 py-14">
      <header className="border-b border-border pb-8">
        <p className="font-mono text-xs uppercase tracking-[0.25em] text-primary">Timeline</p>
        <h1 className="mt-3 font-display text-4xl font-bold tracking-tight text-foreground">
          Roadmap
        </h1>
        <p className="mt-4 max-w-2xl text-base leading-7 text-muted">
          A focused six-month program: {config.proposal.windowStart.replace("-", " ")} →{" "}
          {config.proposal.windowEnd.replace("-", " ")}. Q3 lays the foundations; Q4 turns them
          into community collaboration and measurement. The Reactive workstream runs throughout.
        </p>
      </header>

      <ol className="mt-10 flex flex-col gap-10 border-l border-border pl-1">
        <PhaseNode
          phase={phaseFor("Q3-2026", today)}
          title={BANDS["Q3-2026"].label}
          subtitle={BANDS["Q3-2026"].months}
          deliverables={byQuarter("Q3-2026")}
        />
        <PhaseNode
          phase={phaseFor("Q4-2026", today)}
          title={BANDS["Q4-2026"].label}
          subtitle={BANDS["Q4-2026"].months}
          deliverables={byQuarter("Q4-2026")}
        />
        <PhaseNode
          phase="ongoing"
          title="Ongoing"
          subtitle="Throughout the program"
          deliverables={byQuarter("ongoing")}
        />
      </ol>
    </div>
  );
}
