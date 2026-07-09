// Shared content types for the DevX Initiative tracker.

export const DELIVERABLE_STATUSES = [
  "not-started",
  "in-progress",
  "done",
  "blocked",
] as const;
export type DeliverableStatus = (typeof DELIVERABLE_STATUSES)[number];

export type Quarter = "Q3-2026" | "Q4-2026" | "ongoing";

export interface DeliverableLink {
  label: string;
  url: string;
}

/**
 * An intermediate improvement made while working toward a deliverable's
 * milestone. Shown as a marker on the home timeline; links to the weekly
 * update that reported it.
 */
export interface DeliverableUpdate {
  date: string; // YYYY-MM-DD
  description: string;
  week: string; // ISO week key of the weekly update to link to, e.g. "2026-W27"
}

export interface Deliverable {
  id: string;
  slug: string;
  title: string;
  quarter: Quarter;
  status: DeliverableStatus;
  statusUpdatedAt: string; // YYYY-MM-DD
  /** Committed milestone deadline (YYYY-MM-DD), or null for ongoing work. */
  dueDate: string | null;
  /** When it was actually delivered (YYYY-MM-DD), or null if not yet. */
  deliveredDate: string | null;
  /** Intermediate improvements along the way, shown on the timeline. */
  updates: DeliverableUpdate[];
  summary: string;
  description: string;
  repos: string[];
  links: DeliverableLink[];
}

/**
 * A curated repository the gatherer tracks (ADR-4/5/6). `deliverable` is the id
 * of the deliverable it maps to (D1…D8) or null to fall into the Reactive bucket.
 * `teamOnly` (ADR-5): for shared/external repos, count only roster-authored work.
 */
export interface TrackedRepo {
  url: string;
  owner: string;
  name: string;
  deliverable: string | null;
  teamOnly: boolean;
}

export interface SiteConfig {
  site: {
    title: string;
    tagline: string;
    description: string;
    repoUrl: string;
  };
  proposal: {
    treasuryAskAda: number;
    treasuryAskUsd: number;
    windowStart: string;
    windowEnd: string;
    lead: string;
    collaborators: string[];
  };
  /** GitHub logins used to attribute contributions in shared repos (ADR-5). */
  roster: string[];
  repos: TrackedRepo[];
  links: DeliverableLink[];
}

// --- Weekly updates (gathered activity, ADR-6/7) ---------------------------

export const ACTIVITY_TYPES = [
  "pr",
  "issue-opened",
  "issue-closed",
  "release",
] as const;
export type ActivityType = (typeof ACTIVITY_TYPES)[number];

/** The special group key for activity that maps to no deliverable (ADR-6). */
export const REACTIVE_GROUP = "reactive";

export interface ActivityItem {
  type: ActivityType;
  title: string;
  url: string;
  repo: string; // "owner/name"
  author: string;
}

export interface WeeklyGroup {
  /** A deliverable id (D1…D8) or REACTIVE_GROUP. */
  deliverable: string;
  items: ActivityItem[];
  /** Per-repo raw commit counts — noise summarized, not itemized (ADR-7). */
  commitCounts: Record<string, number>;
}

export interface WeeklyCounters {
  prsMerged: number;
  issuesClosed: number;
  issuesOpened: number;
  releases: number;
  reposTouched: number;
  commits: number;
}

export interface WeeklyUpdate {
  week: string; // ISO week key, e.g. "2026-W28"
  slug: string; // URL-safe, lowercased, e.g. "2026-w28"
  weekStart: string; // YYYY-MM-DD (Monday)
  weekEnd: string; // YYYY-MM-DD (Sunday)
  generatedAt: string; // YYYY-MM-DD
  counters: WeeklyCounters;
  groups: WeeklyGroup[];
  /** Human-authored narrative (Markdown body below the frontmatter). */
  body: string;
}
