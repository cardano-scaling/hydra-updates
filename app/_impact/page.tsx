import type { Metadata } from "next";
import { GrowthChart } from "@/components/growth-chart";
import { getImpact } from "@/lib/content";
import type { PastMetric } from "@/lib/types";

export const metadata: Metadata = {
  title: "Impact",
  description:
    "How the Developer Experience Initiative measures its impact: a direct onboarding experiment, plus proxy metrics relative to competing ecosystems and to Cardano's own past.",
};

function PastMetricCard({ metric }: { metric: PastMetric }) {
  const pending = metric.baseline === null && metric.target === null;
  return (
    <div className="rounded-lg border border-border bg-surface p-5">
      <h4 className="font-display text-base font-semibold text-foreground">{metric.name}</h4>
      <p className="mt-1 text-sm leading-6 text-muted">{metric.note}</p>
      <dl className="mt-4 flex flex-wrap gap-x-10 gap-y-2 font-mono text-xs">
        <div>
          <dt className="uppercase tracking-wider text-muted">Baseline</dt>
          <dd className="mt-0.5 font-display text-lg font-semibold text-foreground">
            {metric.baseline ?? "—"}
          </dd>
        </div>
        <div>
          <dt className="uppercase tracking-wider text-muted">Target</dt>
          <dd className="mt-0.5 font-display text-lg font-semibold text-foreground">
            {metric.target ?? "—"}
          </dd>
        </div>
      </dl>
      {pending && <p className="mt-3 font-mono text-xs text-muted">Pending measurement.</p>}
    </div>
  );
}

export default function ImpactPage() {
  const { direct, ecosystem, past } = getImpact();

  return (
    <div className="mx-auto w-full max-w-4xl px-6 py-14">
      <header className="border-b border-border pb-8">
        <p className="font-mono text-xs uppercase tracking-[0.25em] text-primary">Impact</p>
        <h1 className="mt-3 font-display text-4xl font-bold tracking-tight text-foreground">
          Impact
        </h1>
        <p className="mt-4 max-w-2xl text-base leading-7 text-muted">
          These are the ecosystem outcomes we want to move. We don&apos;t control them directly —
          they depend on the whole community — but they are the needle the initiative is built to
          push. We measure impact two ways: a <strong className="text-foreground">direct</strong>{" "}
          onboarding experiment, and <strong className="text-foreground">proxy</strong> metrics that
          control for industry-wide trends.
        </p>
      </header>

      {/* Direct */}
      <section className="mt-10">
        <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
          <h2 className="font-display text-2xl font-semibold tracking-tight text-foreground">
            Direct
          </h2>
          <span className="font-mono text-xs uppercase tracking-wider text-muted">
            {direct.title}
          </span>
        </div>
        <p className="mt-3 max-w-2xl text-sm leading-6 text-muted">{direct.summary}</p>

        <div className="mt-6 rounded-xl border border-border bg-surface p-6 shadow-sm sm:p-8">
          <p className="font-mono text-[0.65rem] uppercase tracking-wider text-[color:var(--on-primary-link)]">
            {direct.method}
          </p>
          <ul className="mt-4 space-y-2.5">
            {direct.characteristics.map((c) => (
              <li key={c} className="flex gap-2.5 text-sm leading-6 text-muted">
                <span aria-hidden className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
                {c}
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* Proxy */}
      <section className="mt-12">
        <h2 className="font-display text-2xl font-semibold tracking-tight text-foreground">
          Proxy
        </h2>
        <p className="mt-1 text-sm text-muted">
          Indirect signals — measured relative to competing ecosystems and to our own past.
        </p>

        {/* Relative to the ecosystem */}
        <div className="mt-8">
          <h3 className="font-display text-lg font-semibold text-foreground">
            Relative to the blockchain ecosystem
          </h3>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-muted">
            {ecosystem.note}
            {ecosystem.source && (
              <>
                {" "}
                <a
                  href={ecosystem.source}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-mono text-xs uppercase tracking-wider text-[color:var(--on-primary-link)] hover:underline"
                >
                  Methodology ↗
                </a>
              </>
            )}
          </p>

          <div className="mt-6 flex flex-col gap-6">
            {ecosystem.metrics.map((m) => (
              <div key={m.name} className="rounded-xl border border-border bg-surface p-6 shadow-sm sm:p-8">
                <div className="flex flex-wrap items-baseline justify-between gap-2">
                  <h4 className="font-display text-base font-semibold text-foreground">{m.name}</h4>
                  <span className="font-mono text-[0.65rem] uppercase tracking-wider text-[color:var(--status-done)]">
                    Target +{ecosystem.targetPct}%
                  </span>
                </div>
                {m.illustrative && (
                  <p className="mt-3 inline-flex items-center gap-2 rounded-md border border-border bg-surface-2 px-3 py-1.5 font-mono text-[0.65rem] uppercase tracking-wider text-muted">
                    Illustrative data · awaiting measurement
                  </p>
                )}
                <p className="mt-3 mb-4 font-mono text-[0.65rem] uppercase tracking-wider text-muted">
                  {m.yLabel}
                </p>
                <GrowthChart series={m.series} yLabel={m.yLabel} />
              </div>
            ))}
          </div>
        </div>

        {/* Relative to past years */}
        <div className="mt-10">
          <h3 className="font-display text-lg font-semibold text-foreground">
            Relative to past years
          </h3>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-muted">{past.note}</p>
          <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
            {past.metrics.map((m) => (
              <PastMetricCard key={m.name} metric={m} />
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
