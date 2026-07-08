import Link from "next/link";
import type { Deliverable } from "@/lib/types";
import { StatusBadge, statusColor } from "./status-badge";

function quarterLabel(quarter: Deliverable["quarter"]): string {
  return quarter === "ongoing" ? "Ongoing" : quarter.replace("-", " ");
}

/**
 * The signature "ledger row": a colored status spine, a mono deliverable ID,
 * the quarter tag, and the status. `as="link"` links to the anchored entry on
 * the Deliverables page (used for the Home grid); the default is a static
 * article used on the Deliverables page itself.
 */
export function DeliverableCard({
  deliverable,
  as = "article",
  showDescription = false,
  style,
  className = "",
}: {
  deliverable: Deliverable;
  as?: "article" | "link";
  showDescription?: boolean;
  style?: React.CSSProperties;
  className?: string;
}) {
  const { id, slug, title, quarter, status, summary, description, repos, links } =
    deliverable;

  const body = (
    <>
      <div className="flex items-center justify-between gap-3">
        <span className="font-mono text-xs font-medium tracking-wider text-primary">
          {id}
        </span>
        <span className="font-mono text-xs uppercase tracking-wider text-muted">
          {quarterLabel(quarter)}
        </span>
      </div>

      <h3 className="mt-3 font-display text-lg font-semibold tracking-tight text-foreground">
        {title}
      </h3>

      <p className="mt-2 text-sm leading-6 text-muted">{summary}</p>

      {showDescription && (
        <p className="mt-3 text-sm leading-6 text-foreground/80">{description}</p>
      )}

      {showDescription && repos.length > 0 && (
        <ul className="mt-4 flex flex-wrap gap-2">
          {repos.map((repo) => (
            <li
              key={repo}
              className="rounded border border-border bg-surface-2 px-2 py-0.5 font-mono text-xs text-muted"
            >
              {repo}
            </li>
          ))}
        </ul>
      )}

      {showDescription && links.length > 0 && (
        <ul className="mt-3 flex flex-wrap gap-x-4 gap-y-1">
          {links.map((link) => (
            <li key={`${link.label}-${link.url}`}>
              <a
                href={link.url}
                className="font-mono text-xs text-[color:var(--on-primary-link)] hover:underline"
                target={link.url.startsWith("http") ? "_blank" : undefined}
                rel={link.url.startsWith("http") ? "noopener noreferrer" : undefined}
              >
                {link.label} ↗
              </a>
            </li>
          ))}
        </ul>
      )}

      <div className="mt-4">
        <StatusBadge status={status} />
      </div>
    </>
  );

  const spineStyle = { "--spine": statusColor(status) } as React.CSSProperties;
  const shared =
    "group relative block rounded-lg border border-border bg-surface p-5 pl-6 transition-colors";
  const spine =
    "before:absolute before:inset-y-0 before:left-0 before:w-1 before:rounded-l-lg before:bg-[color:var(--spine)]";

  if (as === "link") {
    return (
      <Link
        href={`/deliverables/#${slug}`}
        style={{ ...spineStyle, ...style }}
        className={`${shared} ${spine} hover:-translate-y-0.5 hover:border-primary hover:shadow-lg focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary ${className}`}
      >
        {body}
      </Link>
    );
  }

  return (
    <article
      id={slug}
      style={{ ...spineStyle, ...style }}
      className={`${shared} ${spine} scroll-mt-24 ${className}`}
    >
      {body}
    </article>
  );
}
