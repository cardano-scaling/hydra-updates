"use client";

import dynamic from "next/dynamic";

// The force graph touches `window`, so load the whole map client-side only.
const GraphMap = dynamic(() => import("@/components/GraphMap"), {
  ssr: false,
  loading: () => (
    <div
      style={{
        height: "100vh",
        display: "grid",
        placeItems: "center",
        fontFamily: "var(--mono)",
        color: "var(--faint)",
        fontSize: 13,
      }}
    >
      Loading the ecosystem…
    </div>
  ),
});

export default function Page() {
  return <GraphMap />;
}
