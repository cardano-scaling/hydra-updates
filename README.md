# Hydra updates

A public delivery tracker for the treasury-funded Hydra initiative: manually
authored deliverable status backed by weekly GitHub activity gathered from the
[cardano-scaling](https://github.com/cardano-scaling) repositories.

Deployed to <https://cardano-scaling.github.io/hydra-updates>.

## Content

Everything the site renders is committed YAML/Markdown under `content/`:

| file | what it holds |
|---|---|
| `config.yaml` | site metadata, treasury ask, roster, tracked repos |
| `deliverables.yaml` | the manual source of truth for workstream status (M2…M6) |
| `weekly/YYYY-Www.md` | one gathered weekly update, with a human narrative |

`scripts/gather.ts` drafts a weekly update from the GitHub API; a human writes
the Highlights section and merges.

## Generating weekly updates

Weeks are ISO weeks, Mon–Sun, UTC. Each run writes
`content/weekly/YYYY-Www.md`. CI does this every Monday (`gather-weekly.yml`);
everything below is for running it by hand.

```sh
export GITHUB_TOKEN=$(gh auth token)   # unauthenticated is rate-limited to uselessness

npx tsx scripts/gather.ts                              # the prior Mon–Sun week
npx tsx scripts/gather.ts --week 2026-W30              # one specific week
npx tsx scripts/gather.ts --week 2026-W30 --dry-run    # print to stdout, write nothing
npx tsx scripts/gather.ts --from 2026-06-22 --to 2026-08-09   # every week overlapping the range
```

### Attribution

Each PR/issue is routed to a workstream by its **GitHub milestone**, via
`milestoneMap` in `content/config.yaml`. Unmilestoned items fall back to
the repo's `deliverable`, then to Reactive. Commits, comments and releases carry
no milestone, so they always use the repo default.

## Development

The flake provides `node` and `npm`; npm still manages the dependencies.

```sh
nix develop      # or `direnv allow`, the .envrc is `use flake`
npm ci
npm run dev
```

`nix fmt` formats the Nix files.

### Building the static site

```sh
npm run build                              # -> ./out
nix build --option sandbox relaxed .#      # -> ./result
nix build --option sandbox relaxed .#pages # as deployed, under /hydra-updates
```

The sandbox flag is needed because `app/layout.tsx` pulls its fonts from
`next/font/google`, which downloads them during the build, so the derivation is
marked `__noChroot`. Without the flag Nix refuses it outright:

```
error: derivation '...hydra-updates-0.1.0.drv' has '__noChroot' set,
       but that's not allowed when 'sandbox' is 'true'
```

Set `sandbox = relaxed` in your Nix config to drop the flag. Vendoring the fonts
with `next/font/local` would make the build hermetic and remove the need for
either.

