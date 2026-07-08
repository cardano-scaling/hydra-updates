import type { Metadata } from "next";
import GithubSlugger from "github-slugger";
import { Markdown } from "@/components/markdown";
import { getProposalMarkdown } from "@/lib/content";

export const metadata: Metadata = {
  title: "Proposal",
  description:
    "The full Developer Experience Initiative proposal, rendered as a searchable, LLM-readable web page. The original PDF is available to download.",
};

// The static asset in public/ needs the basePath prefix on its raw href
// (Next only rewrites next/link + next/image automatically), see ADR-11.
const PDF_HREF = `${process.env.NEXT_PUBLIC_BASE_PATH ?? ""}/devx-proposal.pdf`;

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

export default function ProposalPage() {
  const markdown = getProposalMarkdown();
  const toc = buildToc(markdown);

  return (
    <div className="mx-auto w-full max-w-5xl px-6 py-14">
      <header className="flex flex-wrap items-center justify-between gap-4 border-b border-border pb-6">
        <p className="font-mono text-xs uppercase tracking-[0.25em] text-primary">
          Proposal · full text
        </p>
        <a
          href={PDF_HREF}
          download
          className="inline-flex items-center gap-2 rounded-md border border-border bg-surface px-3 py-2 font-mono text-xs uppercase tracking-wider text-foreground transition-colors hover:border-primary hover:text-primary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
        >
          ↓ Download PDF
        </a>
      </header>

      <div className="mt-8 lg:grid lg:grid-cols-[14rem_1fr] lg:gap-10">
        {/* Sticky table of contents (desktop only; headings are anchored anyway). */}
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
        </article>
      </div>
    </div>
  );
}
