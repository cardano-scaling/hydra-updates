import Link from "next/link";
import { ThemeToggle } from "./theme-toggle";

// Only routes that exist in this slice are linked, to avoid dead nav.
// Roadmap / Updates / Proposal / Links are added in later slices.
const NAV = [
  { href: "/", label: "Overview" },
  { href: "/deliverables", label: "Deliverables" },
];

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-10 border-b border-border bg-background/85 backdrop-blur">
      <div className="mx-auto flex h-16 w-full max-w-6xl items-center justify-between gap-4 px-6">
        <Link href="/" className="group flex items-baseline gap-2">
          <span className="font-mono text-xs uppercase tracking-[0.2em] text-primary">
            cardano
          </span>
          <span className="font-display text-lg font-semibold tracking-tight text-foreground group-hover:text-primary">
            DevX Initiative
          </span>
        </Link>

        <nav className="flex items-center gap-1">
          {NAV.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="rounded-md px-3 py-2 font-mono text-xs uppercase tracking-wider text-muted transition-colors hover:text-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
            >
              {item.label}
            </Link>
          ))}
          <span className="ml-2">
            <ThemeToggle />
          </span>
        </nav>
      </div>
    </header>
  );
}
