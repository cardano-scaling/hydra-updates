# Architecture — DevX Initiative Progress Tracker

This document records the architectural decisions for the tracker and the
reasoning behind each. It is the companion to [`PRD.md`](./PRD.md): the PRD says
*what* and *why for the product*; this says *how it is built* and *why these
technical choices*.

> **Note for contributors / agents:** this repo pins **Next.js 16**, which has
> breaking changes vs. older Next. Read `node_modules/next/dist/docs/` (App
> Router + static export) before writing code. See [ADR-0](#adr-0).

## 1. System at a glance

```
                 ┌──────────────────────────────────────────┐
                 │            GitHub repository               │
                 │                                            │
 (human edits)   │  content/                                  │
 ───────────────▶│    config.yaml        ← repos, roster, map │
                 │    deliverables.yaml  ← manual status      │
                 │    weekly/*.md        ← weekly updates     │
                 │    proposal.*         ← rendered + PDF      │
                 │                                            │
                 │  .github/workflows/                        │
   Mon 08:00 UTC │    gather-weekly.yml  ─┐                   │
   (schedule) ──▶│    deploy.yml          │                   │
                 └────────────────────────┼───────────────────┘
                                          │
             ┌────────────────────────────┘
             ▼
   ① gather-weekly (CI)                    ② deploy (CI, on push to main)
   - reads config.yaml                     - next build (output: 'export')
   - queries GitHub API (GITHUB_TOKEN)     - uploads ./out as Pages artifact
   - filters by roster / teamOnly          - publishes to GitHub Pages
   - groups by deliverable                          │
   - writes weekly/YYYY-Www.md                       ▼
   - opens DRAFT PR ──▶ human edits ──▶ merge ──▶ push to main ──▶ ②
```

Two decoupled pipelines: **gathering** (proposes content via PR) and
**deploying** (publishes merged content). The only coupling is `main`: a merge
is the single human gate between "data gathered" and "data live".

## 2. Technology stack

| Concern | Choice | Notes |
|---|---|---|
| Framework | **Next.js 16** (App Router) | Static export via `output: 'export'` |
| Language | **TypeScript** | |
| Styling | **Tailwind CSS v4** | via `@tailwindcss/postcss` |
| Content | **YAML** (structured) + **Markdown** (prose) | git-reviewable plain text |
| Hosting | **GitHub Pages** (project site) | `basePath=/devx-updates` |
| CI/CD | **GitHub Actions** | gather + deploy workflows |
| Data source | **GitHub REST API** | read-only, `GITHUB_TOKEN` |

## 3. Architectural Decision Records

### ADR-0: Treat this as a non-standard Next.js 16
**Decision.** Before writing any framework code, read the bundled docs in
`node_modules/next/dist/docs/`. Do not assume App Router conventions, config
keys, or export behavior from memory/training data.
**Why.** The repo's `AGENTS.md` warns that APIs, conventions, and file structure
differ from older Next and from training data. Guessing risks silently-broken
static export or deprecated patterns.

### ADR-1: Fully static site, no backend
**Decision.** Build with `output: 'export'` and host the resulting static `out/`
on GitHub Pages. No server, database, or runtime API calls.
**Why.** The site is public, low-traffic, and the data changes at most weekly.
Static hosting is free, has no attack surface, needs no secrets at runtime, and
cannot leak tokens to the client. All data is resolved at **build time** from
committed files.
**Consequence.** Everything the site shows must exist as a committed file before
build. "Live" GitHub numbers are snapshots taken at gather/build time, not
real-time. This is acceptable and is stated to users as "as of <date>".

### ADR-2: Data lives in the repo as YAML + Markdown
**Decision.**
- `content/config.yaml` — team roster, repo list, repo→deliverable map.
- `content/deliverables.yaml` — the 8 deliverables and their manual status.
- `content/weekly/YYYY-Www.md` — one file per week (frontmatter + prose + auto
  activity).
- `content/proposal.*` — rendered proposal source + the original PDF.

**Why.** Plain text in git means every change is a reviewable diff, the full
history is auditable (important for a treasury-funded, oversight-scrutinized
project), and humans + CI edit the same files. YAML for structured data,
Markdown for prose the team writes.
**Alternatives rejected.** A CMS or database (violates ADR-1, adds hosting);
JSON for hand-edited files (no comments, worse ergonomics).

### ADR-3: Manual status is the source of truth; activity is evidence
**Decision.** Deliverable headline status is authored by hand in
`deliverables.yaml`. Automatically gathered activity is displayed **alongside**
each deliverable as supporting evidence but **never** computes or overrides the
status.
**Why.** GitHub activity ≠ deliverable done. Auto-inferred status is brittle and
can misrepresent (a burst of commits isn't completion; silence isn't failure).
The team must stand behind an honest headline; evidence makes it verifiable.
**Consequence.** The team is responsible for keeping status current. The site
should make staleness visible (e.g. "status last updated <date>").

### ADR-4: Curated repo list, not org-wide discovery
**Decision.** Tracked repositories are an explicit, hand-maintained list in
`config.yaml`. No crawling of whole orgs or topics.
**Why.** Precision and zero noise. The initiative contributes across many repos
(including ones it doesn't own); org-wide crawling would pull in unrelated work
and miss upstream contributions to external repos. A curated list is
predictable and reviewable.
**Trade-off.** New repos must be added manually as the initiative spins them up.
Accepted.

### ADR-5: Team attribution via roster + per-repo mode
**Decision.** `config.yaml` holds a **roster** of team GitHub logins. Each repo
declares a mode:
- `teamOnly: false` (owned repo) → count all activity;
- `teamOnly: true` (shared/external repo) → count only activity whose author is
  in the roster.
**Why.** Much of the funded work is *upstream* contributions to repos the team
does not own ("everything that can be upstreamed, will be upstreamed"). Without
per-author filtering, a shared repo's unrelated activity would be
misattributed to the initiative. Filtering by author login is simple and
reliable; email-domain matching is fragile (noreply/personal emails) and was
rejected.
**Known gap.** The *Community Collaboration* deliverable pays bounties to
**external** maintainers who are not on the roster; their work won't be captured
by author filtering. Future: honor a `devx-initiative` label or allow manual
entry (see PRD §10).

### ADR-6: Activity grouped by deliverable, with a Reactive fallback
**Decision.** Gathered activity is grouped under the 8 deliverables via a
repo→deliverable map (refinable by label). Anything unmapped falls into an
**"Other / Reactive"** bucket grouped by repo.
**Why.** The community funded *deliverables*, not repositories; the narrative
must speak in those terms. The fallback guarantees nothing is silently dropped
and directly serves the proposal's Reactive deliverable.

### ADR-7: Entry types — itemize signal, summarize noise
**Decision.** Itemize **merged PRs, opened/closed issues, and releases**.
Summarize raw **commits as per-repo counts** rather than listing each. Exclude
bot actors (`dependabot`, `github-actions[bot]`, …) and merge commits.
**Why.** Merged PRs / closed issues / releases are meaningful units of delivered
work; a flat commit log is noise and drowns the narrative. Counts still convey
volume without clutter.

### ADR-8: CI drafts, human finalizes (weekly workflow)
**Decision.** `gather-weekly.yml` runs on a schedule (**Mon 08:00 UTC**,
covering the **prior Mon–Sun** calendar week) and via `workflow_dispatch`. It
writes `content/weekly/YYYY-Www.md` with auto activity pre-filled and an empty
Highlights section, then opens a **draft PR**. A human edits and merges;
merging is the publish action.
**Why.** Automation removes the tedium (gathering) while a human keeps editorial
control and prevents raw/unreviewed data going live. Calendar-week boundaries
(vs. rolling 7-day) keep week keys stable and reruns idempotent.
**Consequence.** The gather job needs `contents: write` + `pull-requests: write`.
A PR opened by `GITHUB_TOKEN` does not itself trigger the deploy workflow — but
that's fine, because deploy triggers on the **human merge's** push to `main`.

### ADR-9: Deploy on push to main
**Decision.** `deploy.yml` runs on push to `main`: `next build` (static export)
→ upload `out/` as a Pages artifact → deploy to GitHub Pages. Also
`workflow_dispatch` for manual redeploys.
**Why.** Merging reviewed content is the natural publish trigger. Keeps gather
and deploy independent (ADR-1/ADR-8).

### ADR-10: Public repos only; built-in token only
**Decision.** Only public repositories are tracked; the gather job authenticates
with the built-in `GITHUB_TOKEN`.
**Why.** No extra secrets to manage or rotate, and no risk of baking private
work into the public site. If private repos are ever needed, a read-only
fine-grained PAT would be added as a secret — with explicit care about what gets
exposed (see PRD §10).

### ADR-11: GitHub Pages project site → basePath
**Decision.** Serve from `https://<user>.github.io/devx-updates/`. Configure
`basePath` / `assetPrefix` via an **env var** (default `/devx-updates`) rather
than hardcoding.
**Why.** Project sites serve under a subpath; missing `basePath` silently breaks
assets and links. Driving it from env lets us switch to a custom domain later
(which removes the subpath) with no code changes.
**Consequence.** All internal links and asset references must respect
`basePath`. A `.nojekyll` file is required so Pages serves `_next/` assets.

### ADR-12: Proposal rendered to HTML + PDF download
**Decision.** The proposal is presented as a native HTML page (headings, tables,
anchors, searchable, responsive) generated from the proposal text, with the
original PDF offered as a download.
**Why.** A PDF-in-iframe is poor on mobile, not searchable, not linkable, not
indexable, and not LLM-readable — all of which matter for a public tracker whose
whole theme is developer experience and LLM-grounded docs. The PDF remains the
canonical artifact for download.

### ADR-13: Cardano-aligned design, light + dark
**Decision.** Cardano-aligned visual identity (deep blue accents, clean/
technical), responsive, light and dark modes, developed with deliberate design
judgment rather than framework defaults.
**Why.** The site represents a funded IO proposal to the Cardano community;
credibility and a native-to-ecosystem feel matter. NFR-4.

## 4. Build-time data flow

1. `next build` runs. At build time the app reads `content/*` from disk (no
   network).
2. `config.yaml` + `deliverables.yaml` → deliverable pages, dashboard grid,
   proof-of-work counters.
3. `weekly/*.md` → parsed (frontmatter + Markdown) into the weekly archive and
   per-week permalink pages; the latest feeds the dashboard.
4. Proposal source → rendered proposal page; PDF copied to static assets.
5. `output: 'export'` emits a fully static `out/` directory.

All "live GitHub numbers" shown on the site are values captured by the last
gather run and committed — i.e. snapshots as of the last merged weekly update,
labeled as such.

## 5. Directory layout (planned)

```
devx-updates/
├─ AGENTS.md                # non-standard-Next.js warning (read first)
├─ docs/
│  ├─ PRD.md
│  └─ ARCHITECTURE.md       # this file
├─ content/
│  ├─ config.yaml           # roster, repos, repo→deliverable map
│  ├─ deliverables.yaml     # 8 deliverables + manual status
│  ├─ proposal/             # rendered proposal source + original PDF
│  └─ weekly/
│     └─ 2026-W28.md        # one file per ISO week
├─ src/                     # Next.js app (App Router)
├─ scripts/
│  └─ gather.ts             # weekly GitHub activity gatherer
├─ .github/workflows/
│  ├─ gather-weekly.yml     # schedule + dispatch → draft PR
│  └─ deploy.yml            # push to main → Pages
└─ public/
   └─ .nojekyll
```

## 6. Security & privacy
- No runtime secrets; build and gather use only `GITHUB_TOKEN` (ADR-10).
- Public repositories only — nothing private is ever baked into the site.
- All published content passes through a human-merged PR (ADR-8), so no
  unreviewed data reaches the public site.

## 7. Constraints & risks
- **Snapshot, not real-time** (ADR-1): numbers lag to the last gather. Mitigated
  by clear "as of" labeling.
- **Manual upkeep** of status (ADR-3) and repo list (ADR-4): the site is only as
  honest/complete as the maintained files. Mitigated by staleness indicators and
  low-friction editing.
- **Roster gap** for bounty/external contributors (ADR-5): tracked as a future
  enhancement.
- **GitHub API rate limits**: `GITHUB_TOKEN` is limited but the weekly, curated,
  public-only read volume is well within limits.
