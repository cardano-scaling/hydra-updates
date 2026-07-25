import Link from "next/link";
import type { FC, SVGProps } from "react";
import type { ActivityItem, ActivityType, Deliverable, WeeklyCounters, WeeklyGroup } from "@/lib/types";
import { REACTIVE_GROUP } from "@/lib/types";
import { StatusBadge } from "./status-badge";
import {
  CommentIcon,
  GitCommitIcon,
  GitMergeIcon,
  GitPullRequestIcon,
  IssueClosedIcon,
  IssueOpenedIcon,
  RepoIcon,
  TagIcon,
} from "./octicons";

type IconType = FC<SVGProps<SVGSVGElement>>;

const COUNTER_LABELS: { key: keyof WeeklyCounters; label: string; Icon: IconType; color: string }[] = [
  { key: "prsMerged", label: "PRs merged", Icon: GitMergeIcon, color: "var(--gh-merged)" },
  { key: "prsOpened", label: "PRs opened", Icon: GitPullRequestIcon, color: "var(--gh-open)" },
  { key: "issuesClosed", label: "Closed", Icon: IssueClosedIcon, color: "var(--gh-closed)" },
  { key: "issuesOpened", label: "Opened", Icon: IssueOpenedIcon, color: "var(--gh-open)" },
  { key: "releases", label: "Releases", Icon: TagIcon, color: "var(--gh-release)" },
  { key: "reposTouched", label: "Repos", Icon: RepoIcon, color: "var(--gh-neutral)" },
  { key: "commits", label: "Commits", Icon: GitCommitIcon, color: "var(--gh-neutral)" },
  { key: "comments", label: "Comments", Icon: CommentIcon, color: "var(--gh-neutral)" },
];

/** Proof-of-work counters as a mono "data" strip (mirrors the home fact strip). */
export function CounterStrip({ counters }: { counters: WeeklyCounters }) {
  return (
    <dl className="grid grid-cols-3 gap-px overflow-hidden rounded-lg border border-border bg-border sm:grid-cols-4 lg:grid-cols-8">
      {COUNTER_LABELS.map(({ key, label, Icon, color }) => (
        // Number pinned to the top and label to the bottom: every value aligns
        // across the strip, and single-line labels don't leave a gap beneath
        // them (the slack sits between number and label instead).
        <div key={key} className="flex flex-col items-center justify-between gap-1 bg-surface px-3 py-4 text-center">
          <dd className="order-1 font-display text-2xl font-semibold text-foreground">
            {counters[key]}
          </dd>
          <dt className="order-2 flex items-center justify-center gap-1.5 font-mono text-[0.6rem] uppercase tracking-wider text-muted">
            <Icon className="shrink-0 text-[0.85rem]" style={{ color }} />
            {label}
          </dt>
        </div>
      ))}
    </dl>
  );
}

const ACTIVITY_META: Record<ActivityType, { label: string; color: string; Icon: IconType }> = {
  pr: { label: "Merged", color: "var(--gh-merged)", Icon: GitMergeIcon },
  "pr-opened": { label: "PR opened", color: "var(--gh-open)", Icon: GitPullRequestIcon },
  release: { label: "Release", color: "var(--gh-release)", Icon: TagIcon },
  "issue-closed": { label: "Issue closed", color: "var(--gh-closed)", Icon: IssueClosedIcon },
  "issue-opened": { label: "Issue opened", color: "var(--gh-open)", Icon: IssueOpenedIcon },
};

function ActivityRow({ item }: { item: ActivityItem }) {
  const meta = ACTIVITY_META[item.type];
  const Icon = meta.Icon;
  return (
    <li className="flex flex-col gap-1 py-3 sm:flex-row sm:items-baseline sm:gap-3">
      <span className="inline-flex shrink-0 items-center gap-1.5 font-mono text-[0.65rem] uppercase tracking-wider text-muted sm:w-28">
        <Icon className="text-[0.95rem]" style={{ color: meta.color }} />
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

/** The list of activity items + per-repo commit summary for one group/week. */
export function ActivityItemList({
  items,
  commitCounts,
}: {
  items: ActivityItem[];
  commitCounts: Record<string, number>;
}) {
  const commits = Object.entries(commitCounts);
  return (
    <>
      {items.length > 0 && (
        <ul className="divide-y divide-border">
          {items.map((item) => (
            <ActivityRow key={item.url} item={item} />
          ))}
        </ul>
      )}
      {commits.length > 0 && (
        <p className="mt-3 flex items-center gap-1.5 font-mono text-xs text-muted">
          <GitCommitIcon className="shrink-0 text-[0.95rem]" style={{ color: "var(--gh-neutral)" }} />
          {commits.map(([repo, n]) => `${n} commit${n === 1 ? "" : "s"} · ${repo}`).join("  ·  ")}
        </p>
      )}
    </>
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
        return (
          <section key={group.deliverable} className="rounded-lg border border-border bg-surface p-5">
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border pb-3">
              <h3 className="font-display text-base font-semibold text-foreground">
                {reactive ? (
                  <>
                    <span className="font-mono text-xs uppercase tracking-wider text-muted">Other</span>{" "}
                    / Reactive
                  </>
                ) : deliverable ? (
                  <Link href={`/deliverables/${deliverable.slug}/`} className="hover:text-primary">
                    <span className="font-mono text-xs tracking-wider text-primary">{deliverable.id}</span>{" "}
                    {deliverable.title}
                  </Link>
                ) : (
                  <>
                    <span className="font-mono text-xs tracking-wider text-primary">{group.deliverable}</span>
                  </>
                )}
              </h3>
              {deliverable && <StatusBadge status={deliverable.status} />}
            </div>

            <div className="pt-1">
              <ActivityItemList items={group.items} commitCounts={group.commitCounts} />
            </div>
          </section>
        );
      })}
    </div>
  );
}
