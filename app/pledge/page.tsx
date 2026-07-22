import type { Metadata } from "next";
import GithubSlugger from "github-slugger";
import { Markdown } from "@/components/markdown";
import { getCommunityAlignmentMarkdown } from "@/lib/content";

export const metadata: Metadata = {
  title: "Pledge",
  description:
    "The Community Alignment deliverable: the initiative's developer-experience strategy and ecosystem tooling map.",
};

/** Table of contents from the `##` headings, slugged exactly as rehype-slug does. */
function buildToc(markdown: string): { text: string; id: string }[] {
  const slugger = new GithubSlugger();
  const toc: { text: string; id: string }[] = [];
  for (const line of markdown.split("\n")) {
    const m = line.match(/^##\s+(.+?)\s*$/); // h2 only
    if (!m) continue;
    const text = m[1].replace(/[*_`]/g, "").trim();
    toc.push({ text, id: slugger.slug(text) });
  }
  return toc;
}

/**
 * Prefilled "new issue" so signing means filling blanks, not editing a Markdown
 * table. A maintainer adds the row (see the signing note at the foot of the pledge).
 */
const SIGN_ISSUE_URL =
  "https://github.com/input-output-hk/devx-updates/issues/new?" +
  new URLSearchParams({
    title: "Sign the pledge",
    labels: "pledge-signature",
    body: [
      "I'd like to add my name to the Cardano Tooling Collaboration Pledge.",
      "",
      "- Name: ",
      "- GitHub username: ",
      "- Team/Position: ",
      "- Organization: ",
      "- Organization URL: ",
      "",
      "<!-- A maintainer will add your row to content/pledge.md. You can also edit the file directly and open a PR. -->",
    ].join("\n"),
  }).toString();

export default function PledgePage() {
  const markdown = getCommunityAlignmentMarkdown();
  const toc = buildToc(markdown);

  return (
    <div className="mx-auto w-full max-w-5xl px-6 py-14">
      <header className="flex flex-wrap items-center justify-between gap-4 border-b border-border pb-6">
        <p className="font-mono text-xs uppercase tracking-[0.25em] text-primary">
          Community Alignment · D1
        </p>
        <a
          href={SIGN_ISSUE_URL}
          target="_blank"
          rel="noreferrer"
          className="inline-flex items-center gap-2 rounded-md border border-primary bg-primary px-4 py-2 font-mono text-xs uppercase tracking-wider text-primary-foreground transition-colors hover:bg-transparent hover:text-primary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
        >
          Sign the pledge
        </a>
      </header>

      <div className="mt-8 lg:grid lg:grid-cols-[14rem_1fr] lg:gap-10">
        <aside className="hidden lg:block">
          <nav className="sticky top-24">
            <p className="font-mono text-[0.65rem] uppercase tracking-wider text-muted">
              On this page
            </p>
            <ul className="mt-3 flex flex-col gap-2 border-l border-border">
              {toc.map((item) => (
                <li key={item.id}>
                  <a
                    href={`#${item.id}`}
                    className="-ml-px block border-l border-transparent pl-3 text-sm text-muted transition-colors hover:border-primary hover:text-foreground"
                  >
                    {item.text}
                  </a>
                </li>
              ))}
            </ul>
          </nav>
        </aside>

        <article className="min-w-0">
          <Markdown>{markdown}</Markdown>

          <div className="mt-10 flex flex-col items-center gap-4 rounded-lg border border-border bg-surface px-6 py-8 text-center">
            <p className="text-sm text-muted">
              Ready to build the developer experience Cardano deserves, together?
            </p>
            <a
              href={SIGN_ISSUE_URL}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 rounded-md border border-primary bg-primary px-4 py-2 font-mono text-xs uppercase tracking-wider text-primary-foreground transition-colors hover:bg-transparent hover:text-primary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
            >
              Sign the pledge
            </a>
          </div>
        </article>
      </div>
    </div>
  );
}
