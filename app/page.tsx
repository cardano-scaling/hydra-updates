import Link from "next/link";
import { DeliverableTimeline } from "@/components/deliverable-timeline";
import { CounterStrip } from "@/components/weekly-update";
import {
    getConfig,
    getDeliverables,
    getLatestWeeklyUpdate,
    getNextDueMilestone,
    getStatusAsOf,
} from "@/lib/content";
import { daysUntil, formatDate, formatDateRange, weekParts } from "@/lib/format";
import { DueCountdown } from "@/components/due-countdown";
import type { DeliverableStatus } from "@/lib/types";

function formatAda(amount: number): string {
    const millions = amount / 1_000_000;
    return `₳${millions.toFixed(1)}M`;
}

/** "Q3-2026" + "Q4-2026" -> "Q3–Q4 2026"; spans two years -> "Q3 2026 – Q1 2027". */
function formatWindow(start: string, end: string): string {
    const [q1, y1] = start.split("-");
    const [q2, y2] = end.split("-");
    return y1 === y2 ? `${q1}–${q2} ${y1}` : `${q1} ${y1} – ${q2} ${y2}`;
}

export default function Home() {
    const config = getConfig();
    const deliverables = getDeliverables();
    const asOf = getStatusAsOf();
    const latest = getLatestWeeklyUpdate();
    const nextDue = getNextDueMilestone();

    const counts = deliverables.reduce<Record<DeliverableStatus, number>>(
        (acc, d) => {
            acc[d.status] += 1;
            return acc;
        },
        { "not-started": 0, "in-progress": 0, done: 0, blocked: 0 },
    );

    // Data-derived facts only — no fabricated GitHub numbers (PRD non-goal).
    const facts: { label: string; value: string }[] = [
        { label: "Treasury ask", value: formatAda(config.proposal.treasuryAskAda) },
        {
            label: "Window",
            value: formatWindow(config.proposal.windowStart, config.proposal.windowEnd),
        },
        { label: "Deliverables", value: String(deliverables.length) },
        { label: "In progress", value: String(counts["in-progress"]) },
        { label: "Done", value: String(counts.done) },
    ];

    return (
        <div className="mx-auto w-full max-w-6xl px-6">
            {/* Hero — the delivery manifest header. */}
            <section className="border-b border-border pt-8 pb-8">
                <p className="font-mono text-xs uppercase tracking-[0.25em] text-primary">
                    Delivery ledger
                </p>
                <h1 className="mt-4 max-w-3xl font-display text-4xl font-bold leading-tight tracking-tight text-foreground sm:text-5xl">
                    {config.site.title}
                </h1>
                <p className="mt-5 max-w-2xl text-lg leading-8 text-muted">
                    {config.site.tagline}
                </p>

                {/* Fact strip in the mono "data" voice. */}
                <dl className="mt-10 grid grid-cols-2 gap-px overflow-hidden rounded-lg border border-border bg-border sm:grid-cols-5">
                    {facts.map((fact) => (
                        <div key={fact.label} className="bg-surface px-4 py-4">
                            <dt className="font-mono text-[0.65rem] uppercase tracking-wider text-muted">
                                {fact.label}
                            </dt>
                            <dd className="mt-1 font-display text-2xl font-semibold text-foreground">
                                {fact.value}
                            </dd>
                        </div>
                    ))}
                </dl>
            </section>

            {/* Deliverable timeline. */}
            <section className="py-8">
                <div>
                    <h2 className="font-display text-2xl font-semibold tracking-tight text-foreground">
                        Deliverables
                    </h2>
                    <p className="mt-1 text-sm text-muted">
                        Committed deadlines vs. actual delivery across the program
                        {asOf ? ` · status as of ${asOf}` : ""}. Select one for its full activity.
                    </p>
                </div>

                <div className="mt-8">
                    <DeliverableTimeline deliverables={deliverables} />
                </div>
            </section>

            {/* What's next: the soonest committed deadline still outstanding. */}
            {nextDue && (
                <section className="border-t border-border py-8">
                    <div className="flex items-end justify-between gap-4">
                        <div>
                            <h2 className="font-display text-2xl font-semibold tracking-tight text-foreground">
                                Next due deliverable
                            </h2>
                            <p className="mt-1 text-sm text-muted">
                                <span className="font-mono text-xs tracking-wider text-primary">
                                    {nextDue.milestone.id}
                                </span>{" "}
                                · {nextDue.milestone.title}
                            </p>
                        </div>
                        <Link
                            href={`/deliverables/${nextDue.deliverable.slug}/`}
                            className="shrink-0 font-mono text-xs uppercase tracking-wider text-(--on-primary-link) hover:underline"
                        >
                            View deliverable ↗
                        </Link>
                    </div>

                    <dl className="mt-6 grid grid-cols-1 gap-px overflow-hidden rounded-lg border border-border bg-border sm:grid-cols-3">
                        <div className="bg-surface px-4 py-4">
                            <dt className="font-mono text-[0.65rem] uppercase tracking-wider text-muted">
                                Workstream
                            </dt>
                            <dd className="mt-1 font-display text-2xl font-semibold text-foreground">
                                {nextDue.deliverable.id}
                            </dd>
                            <dd className="text-sm text-muted">{nextDue.deliverable.title}</dd>
                        </div>
                        <div className="bg-surface px-4 py-4">
                            <dt className="font-mono text-[0.65rem] uppercase tracking-wider text-muted">
                                Committed deadline
                            </dt>
                            <dd className="mt-1 font-display text-2xl font-semibold text-foreground">
                                {formatDate(nextDue.milestone.dueDate!)}
                            </dd>
                        </div>
                        {/* Recomputed in the browser so it can't go stale between deploys. */}
                        <DueCountdown
                            dueDate={nextDue.milestone.dueDate!}
                            builtDays={daysUntil(nextDue.milestone.dueDate!)}
                        />
                    </dl>
                </section>
            )}

            {/* Latest weekly update — the living proof-of-work (FR-1). */}
            {latest && (
                <section className="border-t border-border py-8">
                    <div className="flex items-end justify-between gap-4">
                        <div>
                            <h2 className="font-display text-2xl font-semibold tracking-tight text-foreground">
                                Latest update
                            </h2>
                            <p className="mt-1 text-sm text-muted">
                                {weekParts(latest.week).label} · {formatDateRange(latest.weekStart, latest.weekEnd)}
                            </p>
                        </div>
                        <Link
                            href="/updates"
                            className="shrink-0 font-mono text-xs uppercase tracking-wider text-(--on-primary-link) hover:underline"
                        >
                            All updates ↗
                        </Link>
                    </div>

                    <div className="mt-6">
                        <CounterStrip counters={latest.counters} />
                    </div>

                    <Link
                        href={`/updates/${latest.slug}/`}
                        className="mt-4 inline-block font-mono text-xs uppercase tracking-wider text-(--on-primary-link) hover:underline"
                    >
                        Read {weekParts(latest.week).label} ↗
                    </Link>
                </section>
            )}
        </div>
    );
}
