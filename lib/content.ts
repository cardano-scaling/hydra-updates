import { readFileSync } from "node:fs";
import { join } from "node:path";
import { load as loadYaml } from "js-yaml";
import {
  DELIVERABLE_STATUSES,
  type Deliverable,
  type DeliverableStatus,
  type Quarter,
  type SiteConfig,
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

  const repos = Array.isArray(d.repos) ? d.repos.filter(asString) : [];
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
    summary: d.summary as string,
    description: d.description as string,
    repos,
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

let configCache: SiteConfig | null = null;

export function getConfig(): SiteConfig {
  if (configCache) return configCache;
  const raw = readYaml("config.yaml");
  if (typeof raw !== "object" || raw === null) fail("config.yaml", "expected an object");
  // Config is authored by us and consumed lightly in this slice; trust its shape.
  configCache = raw as SiteConfig;
  return configCache;
}

/** Latest statusUpdatedAt across all deliverables — the site's "status as of" date. */
export function getStatusAsOf(): string {
  return getDeliverables()
    .map((d) => d.statusUpdatedAt)
    .sort()
    .at(-1) ?? "";
}
