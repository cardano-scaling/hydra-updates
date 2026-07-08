#!/usr/bin/env -S npx tsx
/**
 * Weekly GitHub activity gatherer (docs/ARCHITECTURE.md ADR-5…ADR-8).
 *
 * Reads the curated repo list + roster from content/config.yaml, queries the
 * public GitHub API for the target calendar week (default: the prior Mon–Sun),
 * groups activity by deliverable, and writes content/weekly/YYYY-Www.md with
 * an empty Highlights section for a human to fill in before merge.
 *
 * Run:  GITHUB_TOKEN=$(gh auth token) npx tsx scripts/gather.ts [options]
 * Options:
 *   --week 2026-W28      gather a specific ISO week instead of the prior one
 *   --repo owner/name    override the tracked repo list (repeatable); for
 *                        testing. Uses deliverable=null, teamOnly=false.
 *   --dry-run            print the generated file to stdout, don't write it
 */

import { writeFileSync, mkdirSync } from "node:fs";
import { join } from "node:path";
import { dump as dumpYaml } from "js-yaml";
import { getConfig } from "../lib/content";
import {
  REACTIVE_GROUP,
  type ActivityItem,
  type TrackedRepo,
  type WeeklyCounters,
} from "../lib/types";

const API = "https://api.github.com";
const BOT_LOGINS = new Set(["dependabot", "dependabot[bot]", "github-actions[bot]"]);
const isBot = (login: string) => login.endsWith("[bot]") || BOT_LOGINS.has(login);

// --- args ------------------------------------------------------------------

interface Args {
  week?: string;
  repos: string[];
  dryRun: boolean;
}

function parseArgs(argv: string[]): Args {
  const args: Args = { repos: [], dryRun: false };
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a === "--week") args.week = argv[++i];
    else if (a === "--repo") args.repos.push(argv[++i]);
    else if (a === "--dry-run") args.dryRun = true;
    else throw new Error(`Unknown argument: ${a}`);
  }
  return args;
}

// --- ISO week math (all UTC) ----------------------------------------------

function isoWeekOf(d: Date): { year: number; week: number } {
  const date = new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate()));
  const day = (date.getUTCDay() + 6) % 7; // Mon=0 … Sun=6
  date.setUTCDate(date.getUTCDate() - day + 3); // move to the week's Thursday
  const firstThursday = new Date(Date.UTC(date.getUTCFullYear(), 0, 4));
  const firstDay = (firstThursday.getUTCDay() + 6) % 7;
  firstThursday.setUTCDate(firstThursday.getUTCDate() - firstDay + 3);
  const week = 1 + Math.round((date.getTime() - firstThursday.getTime()) / (7 * 864e5));
  return { year: date.getUTCFullYear(), week };
}

function mondayOfISOWeek(year: number, week: number): Date {
  const jan4 = new Date(Date.UTC(year, 0, 4)); // Jan 4 is always in ISO week 1
  const day = (jan4.getUTCDay() + 6) % 7;
  const week1Monday = new Date(jan4);
  week1Monday.setUTCDate(jan4.getUTCDate() - day);
  const monday = new Date(week1Monday);
  monday.setUTCDate(week1Monday.getUTCDate() + (week - 1) * 7);
  return monday;
}

const ymd = (d: Date) => d.toISOString().slice(0, 10);
const weekKey = (year: number, week: number) => `${year}-W${String(week).padStart(2, "0")}`;

/** Resolve the target week to { key, start (Mon), end (Sun) } as UTC dates. */
function resolveWeek(explicit?: string): { key: string; start: Date; end: Date } {
  let year: number;
  let week: number;
  if (explicit) {
    const m = explicit.match(/^(\d{4})-W(\d{1,2})$/i);
    if (!m) throw new Error(`--week must look like 2026-W28, got "${explicit}"`);
    year = Number(m[1]);
    week = Number(m[2]);
  } else {
    // Prior calendar week: back up 7 days from today, then take that week (ADR-8).
    const priorWeek = new Date();
    priorWeek.setUTCDate(priorWeek.getUTCDate() - 7);
    ({ year, week } = isoWeekOf(priorWeek));
  }
  const start = mondayOfISOWeek(year, week);
  const end = new Date(start);
  end.setUTCDate(start.getUTCDate() + 6);
  return { key: weekKey(year, week), start, end };
}

// --- GitHub API ------------------------------------------------------------

const token = process.env.GITHUB_TOKEN;

async function gh<T>(path: string): Promise<T> {
  const res = await fetch(path.startsWith("http") ? path : `${API}${path}`, {
    headers: {
      Accept: "application/vnd.github+json",
      "X-GitHub-Api-Version": "2022-11-28",
      "User-Agent": "devx-updates-gatherer",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  });
  if (!res.ok) {
    const body = await res.text();
    throw new Error(`GitHub API ${res.status} for ${path}: ${body.slice(0, 300)}`);
  }
  return res.json() as Promise<T>;
}

interface SearchIssue {
  title: string;
  html_url: string;
  user: { login: string } | null;
  pull_request?: unknown;
}

/** Run one issues-search query, honoring teamOnly by OR-ing per-author queries. */
async function searchIssues(
  repo: TrackedRepo,
  qualifiers: string,
  roster: string[],
): Promise<SearchIssue[]> {
  const authors = repo.teamOnly ? roster : [null];
  const seen = new Set<string>();
  const out: SearchIssue[] = [];
  for (const author of authors) {
    const q = [
      `repo:${repo.owner}/${repo.name}`,
      qualifiers,
      author ? `author:${author}` : "",
    ]
      .filter(Boolean)
      .join(" ");
    const data = await gh<{ items: SearchIssue[] }>(
      `/search/issues?per_page=100&q=${encodeURIComponent(q)}`,
    );
    for (const item of data.items) {
      if (seen.has(item.html_url)) continue;
      seen.add(item.html_url);
      out.push(item);
    }
  }
  return out;
}

interface RepoActivity {
  items: ActivityItem[];
  commits: number;
  touched: boolean;
}

async function gatherRepo(
  repo: TrackedRepo,
  start: Date,
  end: Date,
  roster: string[],
): Promise<RepoActivity> {
  const slug = `${repo.owner}/${repo.name}`;
  const range = `${ymd(start)}..${ymd(end)}`;
  const items: ActivityItem[] = [];

  const push = (type: ActivityItem["type"], raw: { title: string; html_url: string; login: string }) => {
    if (isBot(raw.login)) return;
    items.push({ type, title: raw.title, url: raw.html_url, repo: slug, author: raw.login });
  };

  // Merged PRs, opened issues, closed issues (ADR-7: itemize signal).
  const merged = await searchIssues(repo, `is:pr is:merged merged:${range}`, roster);
  for (const p of merged) push("pr", { title: p.title, html_url: p.html_url, login: p.user?.login ?? "" });

  const opened = await searchIssues(repo, `is:issue created:${range}`, roster);
  for (const i of opened)
    if (!i.pull_request) push("issue-opened", { title: i.title, html_url: i.html_url, login: i.user?.login ?? "" });

  const closed = await searchIssues(repo, `is:issue closed:${range}`, roster);
  for (const i of closed)
    if (!i.pull_request) push("issue-closed", { title: i.title, html_url: i.html_url, login: i.user?.login ?? "" });

  // Releases (REST) — filter to the window and (if teamOnly) roster authors.
  interface Release {
    name: string | null;
    tag_name: string;
    html_url: string;
    draft: boolean;
    published_at: string | null;
    author: { login: string } | null;
  }
  const releases = await gh<Release[]>(`/repos/${slug}/releases?per_page=100`);
  for (const r of releases) {
    if (r.draft || !r.published_at) continue;
    const when = new Date(r.published_at);
    if (when < start || when > endOfDay(end)) continue;
    const login = r.author?.login ?? "";
    if (repo.teamOnly && !roster.includes(login)) continue;
    push("release", { title: r.name || r.tag_name, html_url: r.html_url, login });
  }

  // Commits (REST) — summarized as a per-repo count (ADR-7), bots/merges excluded.
  let commits = 0;
  const authorList = repo.teamOnly ? roster : [null];
  interface Commit {
    author: { login: string } | null;
    commit: { message: string };
    parents: unknown[];
  }
  for (const author of authorList) {
    const qs = new URLSearchParams({ since: start.toISOString(), until: endOfDay(end).toISOString(), per_page: "100" });
    if (author) qs.set("author", author);
    const commitsPage = await gh<Commit[]>(`/repos/${slug}/commits?${qs}`);
    for (const c of commitsPage) {
      if (c.parents.length > 1) continue; // merge commit
      const login = c.author?.login ?? "";
      if (isBot(login)) continue;
      commits++;
    }
  }

  return { items, commits, touched: items.length > 0 || commits > 0 };
}

function endOfDay(d: Date): Date {
  const e = new Date(d);
  e.setUTCHours(23, 59, 59, 999);
  return e;
}

// --- main ------------------------------------------------------------------

async function main() {
  const args = parseArgs(process.argv.slice(2));
  if (!token) console.warn("⚠ No GITHUB_TOKEN set — unauthenticated requests are heavily rate-limited.");

  const config = getConfig();
  const roster = config.roster;
  const repos: TrackedRepo[] =
    args.repos.length > 0
      ? args.repos.map((r) => {
          const [owner, name] = r.split("/");
          if (!owner || !name) throw new Error(`--repo must be owner/name, got "${r}"`);
          return { url: `https://github.com/${r}`, owner, name, deliverable: null, teamOnly: false };
        })
      : config.repos;

  const { key, start, end } = resolveWeek(args.week);
  console.error(`Gathering ${key} (${ymd(start)} … ${ymd(end)}) across ${repos.length} repo(s)…`);

  // Group activity by deliverable id (or the Reactive bucket), tracking per-repo commit counts.
  const groups = new Map<string, { items: ActivityItem[]; commitCounts: Record<string, number> }>();
  const counters: WeeklyCounters = {
    prsMerged: 0,
    issuesClosed: 0,
    issuesOpened: 0,
    releases: 0,
    reposTouched: 0,
    commits: 0,
  };

  for (const repo of repos) {
    const slug = `${repo.owner}/${repo.name}`;
    const groupKey = repo.deliverable ?? REACTIVE_GROUP;
    const group = groups.get(groupKey) ?? { items: [], commitCounts: {} };
    const activity = await gatherRepo(repo, start, end, roster);
    group.items.push(...activity.items);
    if (activity.commits > 0) group.commitCounts[slug] = activity.commits;
    groups.set(groupKey, group);

    for (const it of activity.items) {
      if (it.type === "pr") counters.prsMerged++;
      else if (it.type === "issue-closed") counters.issuesClosed++;
      else if (it.type === "issue-opened") counters.issuesOpened++;
      else if (it.type === "release") counters.releases++;
    }
    counters.commits += activity.commits;
    if (activity.touched) counters.reposTouched++;
    console.error(`  ${slug}: ${activity.items.length} item(s), ${activity.commits} commit(s)`);
  }

  const frontmatter = {
    week: key,
    weekStart: ymd(start),
    weekEnd: ymd(end),
    generatedAt: ymd(new Date()),
    counters,
    activity: [...groups.entries()]
      .filter(([, g]) => g.items.length > 0 || Object.keys(g.commitCounts).length > 0)
      .map(([deliverable, g]) => ({ deliverable, items: g.items, commitCounts: g.commitCounts })),
  };

  const file =
    `---\n${dumpYaml(frontmatter, { lineWidth: 100 }).trimEnd()}\n---\n\n` +
    `## Highlights\n\n` +
    `<!-- Write the week's narrative here before merging. What shipped, why it\n` +
    `matters, and what's next. The activity above is auto-gathered evidence. -->\n`;

  if (args.dryRun) {
    process.stdout.write(file);
    return;
  }

  const dir = join(process.cwd(), "content", "weekly");
  mkdirSync(dir, { recursive: true });
  const outPath = join(dir, `${key}.md`);
  writeFileSync(outPath, file);
  console.error(`Wrote ${outPath}`);
}

main().catch((err) => {
  console.error(err instanceof Error ? err.message : err);
  process.exit(1);
});
