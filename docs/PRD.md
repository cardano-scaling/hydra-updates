# Product Requirements Document — DevX Initiative Progress Tracker

## 1. Overview

A public, static website that lets the Cardano community track the delivery of
the funded **Developer Experience Initiative** proposal. The site is the
transparent, always-current window into what the team is doing, what has been
delivered, and what is coming next.

It combines **manually authored status** (the honest headline the team stands
behind) with an **automatically gathered activity feed** (living proof-of-work
pulled from GitHub), published as a reviewed **weekly update**.

| | |
|---|---|
| **Proposal** | Developer Experience Initiative (IO Cardano Business Unit) |
| **Treasury ask** | ₳3,601,926 |
| **Program length** | Six months (Q3 2026 → Q4 2026) |
| **Proposal lead** | Robertino Martinez |
| **Collaborators** | Intersect Developer Advocate Program, TxPipe (exploratory) |
| **Audience** | Cardano community, DReps, builders, oversight/assurance bodies |

## 2. Problem & Motivation

The initiative is treasury-funded and accountable to the community through
Intersect's delivery-assurance function and a third-party assurer. The team
needs a **credible, low-friction, transparent** way to show progress against
committed deliverables — continuously, not just at milestone sign-off.

Manual status reports alone are easy to distrust ("marketing"). Raw GitHub
activity alone is noise and doesn't map to what was funded. This product bridges
the two: **team-authored status, backed by automatically gathered evidence.**

## 3. Goals

- **G1 — Transparency.** Let anyone see current deliverable status, past and
  upcoming milestones, and exactly what work happened, week by week.
- **G2 — Credibility.** Back every status claim with live, verifiable GitHub
  evidence (linked PRs/issues, open/closed counts).
- **G3 — Low upkeep.** Automate the tedious part (gathering activity) so the
  human effort each week is writing a short narrative, not compiling data.
- **G4 — Accessibility.** Make the proposal itself readable on any device and by
  LLMs, not locked in a PDF.
- **G5 — Ecosystem framing.** Present work in terms of the *funded deliverables*,
  not just repositories.

## 4. Non-Goals (v1)

- **No dynamic backend.** The site is fully static (GitHub Pages). No server,
  no database, no runtime API calls.
- **No fabricated metrics.** Success KPIs that require surveys or the end-of-
  program hackathon (relative dev growth rate, NPS) are **not** shown until real
  data exists. v1 shows only what can be measured automatically.
- **No private data.** Only public repositories are tracked; nothing private is
  baked into the public site.
- **No team/about page, feedback board, or RSS feed** in v1 (candidates for
  later — see §10).
- **No automatic publishing without review.** Nothing goes live without a human
  merging.

## 5. Users & Needs

| User | Need |
|---|---|
| Community member / builder | "Is this proposal actually delivering? What did they ship this week?" |
| DRep / voter | "Is treasury money producing accountable, verifiable output?" |
| Oversight / assurer (Intersect, 3rd party) | "Show me evidence tied to each milestone deliverable." |
| The team itself | "Publish progress with minimal weekly effort; stay honest." |

## 6. Scope — Tracked Deliverables

The proposal defines eight deliverables; the tracker is organized around them.

| # | Deliverable | Quarter |
|---|---|---|
| 1 | Community Alignment (DevX strategy, ecosystem tooling map) | Q3 2026 |
| 2 | Developer Outreach (support, content, Pentad integrations) | Q3 2026 |
| 3 | `cardano-init` (setup CLI/TUI, plugin system, AI-native) | Q3 2026 |
| 4 | Developer HUB (Developer Portal onboarding, personas, CI'd snippets) | Q3 2026 |
| 5 | ContractsLibrary (≥5 ready-to-audit on/off-chain contracts + site) | Q3 2026 |
| 6 | Community Collaboration (bounties to maintainers/contributors) | Q4 2026 |
| 7 | Measurement (end-of-program DevX hackathon) | Q4 2026 |
| 8 | Reactive (high-ROI opportunities surfaced during the program) | Ongoing |

## 7. Functional Requirements

### 7.1 Pages
- **FR-1 Home / Dashboard** — overall progress, current milestone, deliverable
  status grid, automatic proof-of-work counters, latest weekly update.
- **FR-2 Deliverables** — all 8 deliverables with manual status, description,
  linked repos, and live open/closed issue + PR evidence.
- **FR-3 Roadmap / Timeline** — Q3 → Q4 2026 timeline distinguishing past,
  current, and upcoming milestones with dates.
- **FR-4 Weekly Updates** — chronological archive plus a permalink page per week
  (auto activity grouped by deliverable + team narrative).
- **FR-5 Proposal** — the full proposal rendered as a native, searchable,
  mobile-friendly, LLM-readable HTML page, plus the original PDF as a download.
- **FR-6 Links / Ecosystem hub** — curated jump-off points (cardano-init,
  ContractsLibrary, Developer Portal, Discord, etc.).

### 7.2 Deliverable status (source of truth = manual)
- **FR-7** Each deliverable's headline status (`not-started` / `in-progress` /
  `done` / `blocked`), progress, notes, and links are **manually authored** in a
  structured file. Automatically gathered activity is shown **alongside** but
  **never overrides** the authored status.

### 7.3 Automatic activity gathering
- **FR-8** A curated, hand-maintained list of repositories is the discovery
  source (no org-wide crawling).
- **FR-9** Activity is **grouped by deliverable** via a repo→deliverable mapping
  (refinable by label); unmapped activity falls into an **"Other / Reactive"**
  bucket.
- **FR-10 Team attribution.** Contributions are attributed to the team via a
  **GitHub-username roster**. Each repo declares a mode:
  - *owned repo* → count all activity;
  - *shared/external repo* → count only activity authored by roster members.
- **FR-11** Gathered entry types: **merged PRs, opened/closed issues, releases**
  (itemized). Raw commits are summarized as **per-repo counts**, not listed line
  by line. Bots (`dependabot`, `github-actions[bot]`, etc.) and merge commits are
  excluded.
- **FR-12 Proof-of-work counters.** Cumulative auto-derived numbers (PRs merged,
  issues closed, repos touched) plus manually tracked outputs (e.g. contracts
  shipped) surface on the dashboard.

### 7.4 Weekly publishing workflow (CI drafts, human finalizes)
- **FR-13** A scheduled GitHub Action runs **Monday 08:00 UTC**, covering the
  **prior Mon–Sun** calendar week, and also supports **manual dispatch**.
- **FR-14** The action opens a **draft PR** containing a pre-filled weekly file:
  auto activity grouped by deliverable + an empty **Highlights / Narrative**
  section.
- **FR-15** A human edits and merges the PR. **Nothing publishes without a merge.**
- **FR-16** Merge to `main` triggers the build-and-deploy workflow to GitHub Pages.

## 8. Non-Functional Requirements
- **NFR-1** Fully static; hostable on GitHub Pages with no runtime services.
- **NFR-2** No secrets required beyond the built-in `GITHUB_TOKEN` (all tracked
  repos are public).
- **NFR-3** Responsive (mobile-first) and accessible; light and dark modes.
- **NFR-4** Cardano-aligned, developer-credible visual identity (not a template
  default).
- **NFR-5** Fast static loads; content indexable by search engines and readable
  by LLMs.
- **NFR-6** All content is git-reviewable plain text (YAML/Markdown) so changes
  are auditable in PRs.

## 9. Success Criteria
- A weekly update is published every week with <15 min of human effort.
- Each deliverable's status is current and links to real, live GitHub evidence.
- The community can read the full proposal on-page without downloading anything.
- The site accurately distinguishes team contributions from others' in shared
  repositories.

## 10. Deferred / Future Candidates
- KPI/metrics dashboard once survey + hackathon data exists (targets: baseline
  ~550 devs, ≥30% relative growth, developer NPS, time-to-MVP).
- Team / About section (IO CBU + Intersect + TxPipe).
- Community feedback link (GitHub Discussions / issue template) — supports the
  Reactive deliverable.
- RSS / subscribe feed for weekly updates.
- Bounty-funded external contributions (Community Collaboration) captured via a
  `devx-initiative` label path or manual entry, since external maintainers are
  not on the roster.
- Custom domain (removes the `basePath` requirement).

## 11. Open Items
- Final curated **repo list** and **team GitHub logins** (ship with placeholders
  until provided).
- Confirm repo name (`devx-updates`) and hosting GitHub username for `basePath`
  and links.
