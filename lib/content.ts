import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { load as loadYaml } from "js-yaml";
import {
  ACTIVITY_TYPES,
  DELIVERABLE_STATUSES,
  type ActivityItem,
  type ActivityType,
  type Deliverable,
  type DeliverableStatus,
  type DeliverableUpdate,
  type Milestone,
  type GrowthMetric,
  type ImpactConfig,
  type ImpactSeries,
  type PastMetric,
  type Quarter,
  type SiteConfig,
  type TrackedRepo,
  type WeeklyCounters,
  type WeeklyGroup,
  type WeeklyUpdate,
} from "./types";

// Content is read from disk at build time (static export). No network, no runtime IO.
const CONTENT_DIR = join(process.cwd(), "content");

const QUARTERS: readonly Quarter[] = ["Q3-2026", "Q4-2026", "ongoing"];

function readYaml(fileName: string): unknown {
  const raw = readFileSync(join(CONTENT_DIR, fileName), "utf8");
  return loadYaml(raw);
}

/** Throw a build-failing error so malformed content never ships silently. */
function fail(fileName: string, message: string): never {
  throw new Error(`Invalid content in content/${fileName}: ${message}`);
}

function asString(v: unknown): v is string {
  return typeof v === "string" && v.length > 0;
}

function normalizeStatus(where: string, raw: unknown, fallback: DeliverableStatus): DeliverableStatus {
  if (raw == null) return fallback;
  if (!DELIVERABLE_STATUSES.includes(raw as DeliverableStatus)) {
    fail(
      "deliverables.yaml",
      `${where} has invalid status "${String(raw)}" (expected one of ${DELIVERABLE_STATUSES.join(", ")})`,
    );
  }
  return raw as DeliverableStatus;
}

function normalizeMilestone(raw: unknown, where: string): Milestone {
  if (typeof raw !== "object" || raw === null) fail("deliverables.yaml", `${where} is not an object`);
  const m = raw as Record<string, unknown>;
  for (const key of ["id", "title"]) {
    if (!asString(m[key])) fail("deliverables.yaml", `${where} is missing string "${key}"`);
  }
  const text = (v: unknown): string => (asString(v) ? v : "");
  return {
    id: m.id as string,
    title: m.title as string,
    dueDate: asString(m.dueDate) ? m.dueDate : null,
    deliveredDate: asString(m.deliveredDate) ? m.deliveredDate : null,
    status: normalizeStatus(`${where} milestone status`, m.status, "not-started"),
    description: text(m.description),
    evidence: text(m.evidence),
    acceptanceCriteria: text(m.acceptanceCriteria),
    team: text(m.team),
    thirdPartyAssurance: text(m.thirdPartyAssurance),
  };
}

function normalizeDeliverable(raw: unknown, index: number): Deliverable {
  const where = `deliverable #${index + 1}`;
  if (typeof raw !== "object" || raw === null) {
    fail("deliverables.yaml", `${where} is not an object`);
  }
  const d = raw as Record<string, unknown>;

  for (const key of ["id", "slug", "title", "summary", "description", "statusUpdatedAt"]) {
    if (!asString(d[key])) fail("deliverables.yaml", `${where} is missing string "${key}"`);
  }
  if (!DELIVERABLE_STATUSES.includes(d.status as DeliverableStatus)) {
    fail(
      "deliverables.yaml",
      `${where} has invalid status "${String(d.status)}" (expected one of ${DELIVERABLE_STATUSES.join(", ")})`,
    );
  }
  if (!QUARTERS.includes(d.quarter as Quarter)) {
    fail(
      "deliverables.yaml",
      `${where} has invalid quarter "${String(d.quarter)}" (expected one of ${QUARTERS.join(", ")})`,
    );
  }

  const milestones: Milestone[] = Array.isArray(d.milestones)
    ? d.milestones.map((m, i) => normalizeMilestone(m, `${where} milestones[${i}]`))
    : [];
  const updates: DeliverableUpdate[] = Array.isArray(d.updates)
    ? d.updates.flatMap((u) => {
        if (typeof u === "object" && u !== null) {
          const up = u as Record<string, unknown>;
          if (asString(up.date) && asString(up.description) && asString(up.week)) {
            return [{ date: up.date, description: up.description, week: up.week }];
          }
        }
        return [];
      })
    : [];
  const links = Array.isArray(d.links)
    ? d.links.flatMap((l) => {
        if (typeof l === "object" && l !== null) {
          const link = l as Record<string, unknown>;
          if (asString(link.label) && asString(link.url)) {
            return [{ label: link.label, url: link.url }];
          }
        }
        return [];
      })
    : [];

  return {
    id: d.id as string,
    slug: d.slug as string,
    title: d.title as string,
    quarter: d.quarter as Quarter,
    status: d.status as DeliverableStatus,
    statusUpdatedAt: d.statusUpdatedAt as string,
    milestones,
    updates,
    summary: d.summary as string,
    description: d.description as string,
    links,
  };
}

let deliverablesCache: Deliverable[] | null = null;

export function getDeliverables(): Deliverable[] {
  if (deliverablesCache) return deliverablesCache;
  const raw = readYaml("deliverables.yaml");
  if (!Array.isArray(raw)) fail("deliverables.yaml", "expected a top-level list");
  const slugs = new Set<string>();
  const deliverables = raw.map((entry, i) => {
    const d = normalizeDeliverable(entry, i);
    if (slugs.has(d.slug)) fail("deliverables.yaml", `duplicate slug "${d.slug}"`);
    slugs.add(d.slug);
    return d;
  });
  deliverablesCache = deliverables;
  return deliverables;
}

export function getDeliverableBySlug(slug: string): Deliverable | undefined {
  return getDeliverables().find((d) => d.slug === slug);
}

/** Split a GitHub repo URL into { owner, name }. */
function parseRepoUrl(url: string): { owner: string; name: string } | null {
  const m = url.match(/github\.com\/([^/]+)\/([^/]+?)(?:\.git)?\/?$/);
  if (!m) return null;
  return { owner: m[1], name: m[2] };
}

function normalizeTrackedRepo(raw: unknown, index: number): TrackedRepo {
  const where = `repos[${index}]`;
  if (typeof raw !== "object" || raw === null) fail("config.yaml", `${where} is not an object`);
  const r = raw as Record<string, unknown>;
  if (!asString(r.url)) fail("config.yaml", `${where} is missing string "url"`);
  const parsed = parseRepoUrl(r.url);
  if (!parsed) fail("config.yaml", `${where} url "${r.url}" is not a github.com repo URL`);
  const deliverable = r.deliverable == null ? null : String(r.deliverable);
  return {
    url: r.url,
    owner: parsed.owner,
    name: parsed.name,
    deliverable,
    teamOnly: r.teamOnly === true,
  };
}

let configCache: SiteConfig | null = null;

export function getConfig(): SiteConfig {
  if (configCache) return configCache;
  const raw = readYaml("config.yaml");
  if (typeof raw !== "object" || raw === null) fail("config.yaml", "expected an object");
  const c = raw as Record<string, unknown>;

  // site / proposal / links are authored by us and consumed lightly; trust them.
  // repos + roster feed the gatherer, so validate their shape strictly.
  const repos = Array.isArray(c.repos)
    ? c.repos.map((entry, i) => normalizeTrackedRepo(entry, i))
    : fail("config.yaml", `expected "repos" to be a list`);
  const roster = Array.isArray(c.roster) ? c.roster.filter(asString) : [];

  configCache = { ...(raw as SiteConfig), repos, roster };
  return configCache;
}

/** The curated repositories the gatherer tracks (ADR-4). */
export function getTrackedRepos(): TrackedRepo[] {
  return getConfig().repos;
}

/**
 * Tracked repos that roll up to a given deliverable id — derived from the same
 * `config.yaml` list the gatherer reads, so the deliverable page and the
 * gathered activity can never drift out of sync.
 */
export function getReposForDeliverable(deliverableId: string): TrackedRepo[] {
  return getTrackedRepos().filter((r) => r.deliverable === deliverableId);
}

/** Latest statusUpdatedAt across all deliverables — the site's "status as of" date. */
export function getStatusAsOf(): string {
  return getDeliverables()
    .map((d) => d.statusUpdatedAt)
    .sort()
    .at(-1) ?? "";
}

// --- Weekly updates --------------------------------------------------------

const WEEKLY_DIR = join(CONTENT_DIR, "weekly");

/**
 * Split a `---`-fenced YAML frontmatter block from a Markdown body. Reuses
 * js-yaml (no extra dependency) to stay consistent with the rest of the loader.
 */
function parseFrontmatter(
  fileName: string,
  raw: string,
): { data: Record<string, unknown>; body: string } {
  const match = raw.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n?([\s\S]*)$/);
  if (!match) fail(fileName, "missing YAML frontmatter (--- fenced block)");
  const data = loadYaml(match[1]);
  if (typeof data !== "object" || data === null) {
    fail(fileName, "frontmatter is not an object");
  }
  return { data: data as Record<string, unknown>, body: match[2].trim() };
}

function normalizeCounters(fileName: string, raw: unknown): WeeklyCounters {
  const c = (typeof raw === "object" && raw !== null ? raw : {}) as Record<string, unknown>;
  const num = (key: keyof WeeklyCounters): number =>
    typeof c[key] === "number" && Number.isFinite(c[key]) ? (c[key] as number) : 0;
  return {
    prsMerged: num("prsMerged"),
    issuesClosed: num("issuesClosed"),
    issuesOpened: num("issuesOpened"),
    releases: num("releases"),
    reposTouched: num("reposTouched"),
    commits: num("commits"),
    comments: num("comments"),
  };
}

function normalizeActivityItem(fileName: string, where: string, raw: unknown): ActivityItem | null {
  if (typeof raw !== "object" || raw === null) return null;
  const i = raw as Record<string, unknown>;
  if (!ACTIVITY_TYPES.includes(i.type as ActivityType)) {
    fail(fileName, `${where} has invalid type "${String(i.type)}"`);
  }
  if (!asString(i.title) || !asString(i.url) || !asString(i.repo)) {
    fail(fileName, `${where} is missing string "title", "url", or "repo"`);
  }
  return {
    type: i.type as ActivityType,
    title: i.title,
    url: i.url,
    repo: i.repo,
    author: asString(i.author) ? i.author : "",
  };
}

function normalizeGroup(fileName: string, index: number, raw: unknown): WeeklyGroup {
  const where = `activity[${index}]`;
  if (typeof raw !== "object" || raw === null) fail(fileName, `${where} is not an object`);
  const g = raw as Record<string, unknown>;
  if (!asString(g.deliverable)) fail(fileName, `${where} is missing string "deliverable"`);
  const items = Array.isArray(g.items)
    ? g.items
        .map((it, i) => normalizeActivityItem(fileName, `${where}.items[${i}]`, it))
        .filter((it): it is ActivityItem => it !== null)
    : [];
  const commitCounts: Record<string, number> = {};
  if (typeof g.commitCounts === "object" && g.commitCounts !== null) {
    for (const [repo, count] of Object.entries(g.commitCounts as Record<string, unknown>)) {
      if (typeof count === "number" && Number.isFinite(count)) commitCounts[repo] = count;
    }
  }
  return { deliverable: g.deliverable, items, commitCounts };
}

function normalizeWeekly(fileName: string, raw: string): WeeklyUpdate {
  const { data, body } = parseFrontmatter(fileName, raw);
  for (const key of ["week", "weekStart", "weekEnd", "generatedAt"]) {
    if (!asString(data[key])) fail(fileName, `frontmatter is missing string "${key}"`);
  }
  const groups = Array.isArray(data.activity)
    ? data.activity.map((g, i) => normalizeGroup(fileName, i, g))
    : [];
  const week = data.week as string;
  return {
    week,
    slug: week.toLowerCase(),
    weekStart: data.weekStart as string,
    weekEnd: data.weekEnd as string,
    generatedAt: data.generatedAt as string,
    counters: normalizeCounters(fileName, data.counters),
    groups,
    body,
  };
}

let weeklyCache: WeeklyUpdate[] | null = null;

/** All weekly updates, most recent first. Missing directory → empty list. */
export function getWeeklyUpdates(): WeeklyUpdate[] {
  if (weeklyCache) return weeklyCache;
  let files: string[];
  try {
    files = readdirSync(WEEKLY_DIR).filter((f) => f.endsWith(".md"));
  } catch {
    files = [];
  }
  const weeks = new Set<string>();
  const updates = files.map((file) => {
    const raw = readFileSync(join(WEEKLY_DIR, file), "utf8");
    const update = normalizeWeekly(`weekly/${file}`, raw);
    if (weeks.has(update.slug)) fail(`weekly/${file}`, `duplicate week "${update.week}"`);
    weeks.add(update.slug);
    return update;
  });
  updates.sort((a, b) => (a.week < b.week ? 1 : a.week > b.week ? -1 : 0));
  weeklyCache = updates;
  return updates;
}

export function getWeeklyUpdateBySlug(slug: string): WeeklyUpdate | undefined {
  return getWeeklyUpdates().find((u) => u.slug === slug.toLowerCase());
}

export function getLatestWeeklyUpdate(): WeeklyUpdate | undefined {
  return getWeeklyUpdates()[0];
}

// --- Proposal --------------------------------------------------------------

let proposalCache: string | null = null;

/** The proposal rendered as Markdown (ADR-12). Read once at build time. */
export function getProposalMarkdown(): string {
  if (proposalCache !== null) return proposalCache;
  const raw = readFileSync(join(CONTENT_DIR, "proposal", "proposal.md"), "utf8");
  if (!raw.trim()) fail("proposal/proposal.md", "proposal is empty");
  proposalCache = raw;
  return proposalCache;
}

let alignmentCache: string | null = null;

/** The Community Alignment / DevX strategy document, as Markdown. */
export function getCommunityAlignmentMarkdown(): string {
  if (alignmentCache !== null) return alignmentCache;
  const raw = readFileSync(join(CONTENT_DIR, "pledge.md"), "utf8");
  if (!raw.trim()) fail("pledge.md", "document is empty");
  alignmentCache = raw;
  return alignmentCache;
}

// --- Impact ----------------------------------------------------------------

function asNumberOrNull(v: unknown): number | null {
  return typeof v === "number" && Number.isFinite(v) ? v : null;
}

function normalizeSeries(raw: unknown): ImpactSeries[] {
  if (!Array.isArray(raw)) return [];
  return raw.flatMap((s) => {
    if (typeof s !== "object" || s === null) return [];
    const obj = s as Record<string, unknown>;
    if (!asString(obj.name)) return [];
    const points = Array.isArray(obj.points)
      ? obj.points.flatMap((p) => {
          if (typeof p !== "object" || p === null) return [];
          const pt = p as Record<string, unknown>;
          if (asString(pt.label) && typeof pt.value === "number" && Number.isFinite(pt.value)) {
            return [{ label: pt.label, value: pt.value }];
          }
          return [];
        })
      : [];
    return [{ name: obj.name, points }];
  });
}

function normalizeGrowthMetric(raw: unknown): GrowthMetric[] {
  if (typeof raw !== "object" || raw === null) return [];
  const m = raw as Record<string, unknown>;
  if (!asString(m.name)) return [];
  return [
    {
      name: m.name,
      yLabel: asString(m.yLabel) ? m.yLabel : "",
      illustrative: m.illustrative !== false,
      series: normalizeSeries(m.series),
    },
  ];
}

function normalizePastMetric(raw: unknown): PastMetric[] {
  if (typeof raw !== "object" || raw === null) return [];
  const m = raw as Record<string, unknown>;
  if (!asString(m.name)) return [];
  return [
    {
      name: m.name,
      note: asString(m.note) ? m.note : "",
      baseline: asNumberOrNull(m.baseline),
      target: asNumberOrNull(m.target),
    },
  ];
}

let impactCache: ImpactConfig | null = null;

/** Ecosystem impact KPIs. Values may be illustrative until measured. */
export function getImpact(): ImpactConfig {
  if (impactCache) return impactCache;
  const raw = readYaml("impact.yaml");
  if (typeof raw !== "object" || raw === null) fail("impact.yaml", "expected an object");
  const c = raw as Record<string, unknown>;
  const direct = (c.direct ?? {}) as Record<string, unknown>;
  const ecosystem = (c.ecosystem ?? {}) as Record<string, unknown>;
  const past = (c.past ?? {}) as Record<string, unknown>;

  impactCache = {
    direct: {
      title: asString(direct.title) ? direct.title : "",
      summary: asString(direct.summary) ? direct.summary : "",
      method: asString(direct.method) ? direct.method : "",
      characteristics: Array.isArray(direct.characteristics)
        ? direct.characteristics.filter(asString)
        : [],
    },
    ecosystem: {
      note: asString(ecosystem.note) ? ecosystem.note : "",
      source: asString(ecosystem.source) ? ecosystem.source : "",
      controls: Array.isArray(ecosystem.controls) ? ecosystem.controls.filter(asString) : [],
      targetPct: asNumberOrNull(ecosystem.targetPct) ?? 0,
      metrics: Array.isArray(ecosystem.metrics)
        ? ecosystem.metrics.flatMap(normalizeGrowthMetric)
        : [],
    },
    past: {
      note: asString(past.note) ? past.note : "",
      metrics: Array.isArray(past.metrics) ? past.metrics.flatMap(normalizePastMetric) : [],
    },
  };
  return impactCache;
}
