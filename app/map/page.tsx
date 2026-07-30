"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

// /map has no view of its own — send visitors to the graph. A client redirect
// (rather than next/navigation `redirect()`) keeps this valid under static
// export, which resolves everything at build time.
export default function MapIndex() {
  const router = useRouter();
  useEffect(() => {
    router.replace("/map/graph");
  }, [router]);
  return null;
}
