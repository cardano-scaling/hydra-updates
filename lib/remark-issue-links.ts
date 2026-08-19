import { findAndReplace, type FindAndReplaceList } from "mdast-util-find-and-replace";
import type { Link, Root } from "mdast";
import { getTrackedRepos } from "./content";

function issueLink(ownerRepo: string, num: string, text: string): Link {
  return {
    type: "link",
    url: `https://github.com/${ownerRepo}/issues/${num}`,
    children: [{ type: "text", value: text }],
  };
}

function escapeRegExp(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

/**
 * Links bare issue/PR references in weekly narratives to GitHub. GitHub
 * redirects /issues/N to /pull/N when N is a PR, so one URL shape covers both.
 *
 * "owner/name#123" and "name#123" (a tracked repo's short name, e.g.
 * "hydra-updates#1") resolve to that repo; a bare "#123" resolves to the
 * first tracked repo in config.yaml, the primary cardano-scaling/hydra repo
 * that almost all narrative references are to.
 */
export function remarkIssueLinks() {
  const repos = getTrackedRepos();
  const defaultRepo = repos[0];
  const byName = new Map(repos.map((r) => [r.name, r]));
  // Longest name first so e.g. "hydra-updates" isn't shadowed by "hydra".
  const names = [...byName.keys()].sort((a, b) => b.length - a.length);

  const pairs: FindAndReplaceList = [
    [/\b([\w.-]+\/[\w.-]+)#(\d+)\b/g, (full, ownerRepo, num) => issueLink(ownerRepo, num, full)],
  ];
  if (names.length > 0) {
    pairs.push([
      new RegExp(`\\b(${names.map(escapeRegExp).join("|")})#(\\d+)\\b`, "g"),
      (full, name, num) => {
        const repo = byName.get(name);
        return repo ? issueLink(`${repo.owner}/${repo.name}`, num, full) : false;
      },
    ]);
  }
  if (defaultRepo) {
    pairs.push([/#(\d+)\b/g, (full, num) => issueLink(`${defaultRepo.owner}/${defaultRepo.name}`, num, full)]);
  }

  return (tree: Root) => {
    findAndReplace(tree, pairs, { ignore: ["link", "linkReference"] });
  };
}
