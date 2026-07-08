import type { ActivityItem, ActivityType, Deliverable, WeeklyCounters, WeeklyGroup } from "@/lib/types";
import { REACTIVE_GROUP } from "@/lib/types";
import { StatusBadge } from "./status-badge";

const COUNTER_LABELS: { key: keyof WeeklyCounters; label: string }[] = [
  { key: "prsMerged", label: "PRs merged" },
  { key: "issuesClosed", label: "Issues closed" },
  { key: "issuesOpened", label: "Issues opened" },
  { key: "releases", label: "Releases" },
  { key: "reposTouched", label: "Repos touched" },
  { key: "commits", label: "Commits" },
];

/** Proof-of-work counters as a mono "data" strip (mirrors the home fact strip). */
export function CounterStrip({ counters }: { counters: WeeklyCounters }) {
  return (
    <dl className="grid grid-cols-3 gap-px overflow-hidden rounded-lg border border-border bg-border sm:grid-cols-6">
      {COUNTER_LABELS.map(({ key, label }) => (
        <div key={key} className="bg-surface px-4 py-4">
          <dt className="font-mono text-[0.6rem] uppercase tracking-wider text-muted">{label}</dt>
          <dd className="mt-1 font-display text-2xl font-semibold text-foreground">
            {counters[key]}
          </dd>
        </div>
      ))}
    </dl>
  );
}

const ACTIVITY_META: Record<ActivityType, { label: string; color: string }> = {
  pr: { label: "PR merged", color: "var(--status-done)" },
  release: { label: "Release", color: "var(--primary)" },
  "issue-closed": { label: "Issue closed", color: "var(--status-done)" },
  "issue-opened": { label: "Issue opened", color: "var(--status-todo)" },
};

function ActivityRow({ item }: { item: ActivityItem }) {
  const meta = ACTIVITY_META[item.type];
  return (
    <li className="flex flex-col gap-1 py-3 sm:flex-row sm:items-baseline sm:gap-3">
      <span className="inline-flex shrink-0 items-center gap-2 font-mono text-[0.65rem] uppercase tracking-wider text-muted sm:w-28">
        <span aria-hidden className="h-2 w-2 rounded-full" style={{ backgroundColor: meta.color }} />
        {meta.label}
      </span>
      <span className="min-w-0">
        <a
          href={item.url}
          target="_blank"
          rel="noopener noreferrer"
          className="text-sm text-foreground hover:text-[color:var(--on-primary-link)] hover:underline"
        >
          {item.title}
        </a>
        <span className="mt-0.5 block font-mono text-xs text-muted">
          {item.repo}
          {item.author ? ` · @${item.author}` : ""}
        </span>
      </span>
    </li>
  );
}

/**
 * Gathered activity grouped by deliverable (ADR-6). Each group shows the
 * deliverable's manual status alongside the evidence; the Reactive bucket has
 * no deliverable. Commit volume is summarized per repo (ADR-7).
 */
export function ActivityGroups({
  groups,
  deliverables,
}: {
  groups: WeeklyGroup[];
  deliverables: Deliverable[];
}) {
  const byId = new Map(deliverables.map((d) => [d.id, d]));

  return (
    <div className="flex flex-col gap-5">
      {groups.map((group) => {
        const reactive = group.deliverable === REACTIVE_GROUP;
        const deliverable = reactive ? undefined : byId.get(group.deliverable);
        const commits = Object.entries(group.commitCounts);
        return (
          <section key={group.deliverable} className="rounded-lg border border-border bg-surface p-5">
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border pb-3">
              <h3 className="font-display text-base font-semibold text-foreground">
                {reactive ? (
                  <>
                    <span className="font-mono text-xs uppercase tracking-wider text-muted">Other</span>{" "}
                    / Reactive
                  </>
                ) : (
                  <>
                    <span className="font-mono text-xs tracking-wider text-primary">
                      {group.deliverable}
                    </span>{" "}
                    {deliverable?.title ?? group.deliverable}
                  </>
                )}
              </h3>
              {deliverable && <StatusBadge status={deliverable.status} />}
            </div>

            {group.items.length > 0 && (
              <ul className="divide-y divide-border">
                {group.items.map((item) => (
                  <ActivityRow key={item.url} item={item} />
                ))}
              </ul>
            )}

            {commits.length > 0 && (
              <p className="mt-3 font-mono text-xs text-muted">
                {commits.map(([repo, n]) => `${n} commit${n === 1 ? "" : "s"} · ${repo}`).join("  ·  ")}
              </p>
            )}
          </section>
        );
      })}
    </div>
  );
}
