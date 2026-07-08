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

export interface Deliverable {
  id: string;
  slug: string;
  title: string;
  quarter: Quarter;
  status: DeliverableStatus;
  statusUpdatedAt: string; // YYYY-MM-DD
  summary: string;
  description: string;
  repos: string[];
  links: DeliverableLink[];
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
  team: string[];
  repos: unknown[];
  links: DeliverableLink[];
}
