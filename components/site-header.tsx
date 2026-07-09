"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ThemeToggle } from "./theme-toggle";

const NAV = [
  { href: "/", label: "Overview" },
  { href: "/updates", label: "Updates" },
  { href: "/proposal", label: "Proposal" },
  { href: "/links", label: "Links" },
];

function isActive(pathname: string, href: string): boolean {
  const path = pathname.replace(/\/+$/, "") || "/"; // normalize trailing slash
  return href === "/" ? path === "/" : path === href || path.startsWith(`${href}/`);
}

export function SiteHeader() {
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-10 border-b border-border bg-background/85 backdrop-blur">
      <div className="mx-auto flex h-16 w-full max-w-6xl items-center justify-between gap-3 px-6">
        <Link href="/" className="group flex shrink-0 items-baseline gap-2">
          <span className="font-display text-lg font-semibold tracking-tight text-foreground group-hover:text-primary">
            DevX Initiative
          </span>
        </Link>

        <div className="flex min-w-0 items-center gap-1">
          {/* Scrolls horizontally on narrow screens rather than wrapping the header. */}
          <nav className="no-scrollbar flex items-center gap-1 overflow-x-auto">
            {NAV.map((item) => {
              const active = isActive(pathname, item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  aria-current={active ? "page" : undefined}
                  className={`whitespace-nowrap rounded-md px-3 py-2 font-mono text-xs uppercase tracking-wider transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary ${
                    active ? "text-primary" : "text-muted hover:text-foreground"
                  }`}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>
          <span className="ml-1 shrink-0">
            <ThemeToggle />
          </span>
        </div>
      </div>
    </header>
  );
}
