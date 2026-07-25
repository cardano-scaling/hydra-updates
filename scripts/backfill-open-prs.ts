#!/usr/bin/env -S npx tsx
/**
 * One-off backfill: add the newly-captured "PRs opened" signal to weekly files
 * that predate it, WITHOUT touching anything else.
 *
 * For each existing content/weekly/*.md it fetches ONLY the PRs opened that week
 * (the same query the gatherer now runs: `is:pr created:<range>`, drafts
 * included, deduped against that week's merged PRs) and splices them in along
 * with the `prsOpened` counter. Commits, merged PRs, comments, issues, releases
 * and the hand-written Highlights body are all left exactly as they were —
 * several narratives cite specific commit counts, so a re-fetch must not move
 * those numbers. We deliberately do NOT re-run the heavy commit/comment walk.
 *
 * Run:  GITHUB_TOKEN=$(gh auth token) npx tsx scripts/backfill-open-prs.ts [--dry-run]
 */
import { readFileSync, writeFileSync, readdirSync } from "node:fs";
import { join } from "node:path";
import { load as loadYaml, dump as dumpYaml } from "js-yaml";
import { getConfig } from "../lib/content";
import { REACTIVE_GROUP, type ActivityItem, type TrackedRepo, type WeeklyCounters } from "../lib/types";

const DRY = process.argv.includes("--dry-run");
const dir = join(process.cwd(), "content", "weekly");
const API = "https://api.github.com";
const token = process.env.GITHUB_TOKEN;
const BOT_LOGINS = new Set(["dependabot", "dependabot[bot]", "github-actions[bot]"]);
const isBot = (login: string) => login.endsWith("[bot]") || BOT_LOGINS.has(login);
const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

// --- GitHub (same fetch + rate-limit handling shape as the gatherer) --------

async function gh<T>(path: string): Promise<T> {
  const url = path.startsWith("http") ? path : `${API}${path}`;
  for (let attempt = 0; ; attempt++) {
    const res = await fetch(url, {
      headers: {
        Accept: "application/vnd.github+json",
        "X-GitHub-Api-Version": "2022-11-28",
        "User-Agent": "devx-updates-backfill",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
    });
    if (res.ok) return res.json() as Promise<T>;
    const rateLimited = res.status === 403 || res.status === 429;
    if (rateLimited && attempt < 6) {
      const retryAfter = res.headers.get("retry-after");
      const remaining = res.headers.get("x-ratelimit-remaining");
      const reset = res.headers.get("x-ratelimit-reset");
      let waitMs = 0;
      if (retryAfter) waitMs = Number(retryAfter) * 1000;
      else if (remaining === "0" && reset) waitMs = Number(reset) * 1000 - Date.now();
      if (waitMs > 0 && waitMs <= 120_000) {
        console.error(`  ⏳ rate limited; waiting ${Math.ceil(waitMs / 1000)}s…`);
        await sleep(waitMs + 1000);
        continue;
      }
    }
    throw new Error(`GitHub API ${res.status} for ${path}: ${(await res.text()).slice(0, 200)}`);
  }
}

interface SearchIssue {
  title: string;
  html_url: string;
  user: { login: string } | null;
}

/** One issues-search query, honoring teamOnly by OR-ing per-author queries. */
async function searchIssues(repo: TrackedRepo, qualifiers: string, roster: string[]): Promise<SearchIssue[]> {
  const authors = repo.teamOnly ? roster : [null];
  const seen = new Set<string>();
  const out: SearchIssue[] = [];
  for (const author of authors) {
    const q = [`repo:${repo.owner}/${repo.name}`, qualifiers, author ? `author:${author}` : ""]
      .filter(Boolean)
      .join(" ");
    const data = await gh<{ items: SearchIssue[] }>(`/search/issues?per_page=100&q=${encodeURIComponent(q)}`);
    for (const item of data.items) {
      if (seen.has(item.html_url)) continue;
      seen.add(item.html_url);
      out.push(item);
    }
  }
  return out;
}

// --- file model -------------------------------------------------------------

interface Group {
  deliverable: string;
  items: ActivityItem[];
  commitCounts: Record<string, number>;
}
interface Frontmatter {
  week: string;
  weekStart: string;
  weekEnd: string;
  generatedAt: string;
  counters: WeeklyCounters;
  activity: Group[];
}

function splitFile(raw: string): { fm: Frontmatter; body: string } {
  const m = raw.match(/^---\n([\s\S]*?)\n---\n([\s\S]*)$/);
  if (!m) throw new Error("no frontmatter");
  return { fm: loadYaml(m[1]) as Frontmatter, body: m[2] };
}

/** Canonical counter order (matches WeeklyCounters / the gatherer's output). */
function orderCounters(c: WeeklyCounters): WeeklyCounters {
  return {
    prsMerged: c.prsMerged,
    prsOpened: c.prsOpened,
    issuesClosed: c.issuesClosed,
    issuesOpened: c.issuesOpened,
    releases: c.releases,
    reposTouched: c.reposTouched,
    commits: c.commits,
    comments: c.comments,
  };
}

async function main() {
  if (!token) console.warn("⚠ No GITHUB_TOKEN set — unauthenticated requests are heavily rate-limited.");
  const config = getConfig();
  const roster = config.roster;
  const files = readdirSync(dir)
    .filter((f) => /^\d{4}-W\d{2}\.md$/.test(f))
    .sort();

  for (const file of files) {
    const path = join(dir, file);
    const { fm, body } = splitFile(readFileSync(path, "utf8"));
    const range = `${fm.weekStart}..${fm.weekEnd}`; // GitHub search date range

    // Fetch opened PRs per repo, deduped against that week's merged PRs, and
    // group by deliverable — exactly what gatherRepo now does for pr-opened.
    const openByGroup = new Map<string, ActivityItem[]>();
    let prsOpened = 0;
    for (const repo of config.repos) {
      const slug = `${repo.owner}/${repo.name}`;
      const merged = await searchIssues(repo, `is:pr is:merged merged:${range}`, roster);
      const mergedUrls = new Set(merged.map((p) => p.html_url));
      const opened = await searchIssues(repo, `is:pr created:${range}`, roster);
      const groupKey = repo.deliverable ?? REACTIVE_GROUP;
      for (const p of opened) {
        const login = p.user?.login ?? "";
        if (mergedUrls.has(p.html_url) || isBot(login)) continue;
        const list = openByGroup.get(groupKey) ?? [];
        list.push({ type: "pr-opened", title: p.title, url: p.html_url, repo: slug, author: login });
        openByGroup.set(groupKey, list);
        prsOpened++;
      }
    }

    // Splice into existing groups; create a group only if the week had none for it.
    for (const [deliverable, opened] of openByGroup) {
      let group = fm.activity.find((g) => g.deliverable === deliverable);
      if (!group) {
        group = { deliverable, items: [], commitCounts: {} };
        fm.activity.push(group);
      }
      const seen = new Set(group.items.map((it) => it.url + "|" + it.type));
      for (const it of opened) if (!seen.has(it.url + "|" + it.type)) group.items.push(it);
    }
    const before = fm.counters.prsOpened ?? 0;
    fm.counters = orderCounters({ ...fm.counters, prsOpened });

    const rendered = `---\n${dumpYaml(fm, { lineWidth: 100 }).trimEnd()}\n---\n${body}`;
    const delta = prsOpened - before;
    console.error(`${fm.week}: prsOpened ${before} → ${prsOpened} (${delta >= 0 ? "+" : ""}${delta})${DRY ? " [dry-run]" : ""}`);
    if (!DRY) writeFileSync(path, rendered);
  }
}

main().catch((err) => {
  console.error(err instanceof Error ? err.message : err);
  process.exit(1);
});
