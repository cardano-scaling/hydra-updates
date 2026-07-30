import type { Metadata } from "next";
import "./map.css";

export const metadata: Metadata = {
    title: "Developer Tooling Map",
    description:
        "Interactive map of the Cardano developer tooling ecosystem — relationships, language, license and maintenance state.",
};

// This layout loads the map's scoped stylesheet, sets the map pages' metadata,
// and shows the "in review" banner on every map page. The map renders inside
// the shared site header/footer from the root layout; the banner sits just
// below the header and the `.map-view` shell fills the remaining flex space.
export default function MapLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <>
            <div
                role="status"
                className="flex items-center justify-center gap-2 border-b border-border bg-surface-2 px-4 py-2 text-center text-xs text-muted"
            >
                <span
                    aria-hidden
                    className="inline-block h-2 w-2 shrink-0 rounded-full"
                    style={{ background: "var(--status-progress)" }}
                />
                <span>
                    <span className="font-semibold text-foreground">In review</span>: This tooling
                    data is still being verified and may change.
                </span>
            </div>
            {children}
        </>
    );
}
