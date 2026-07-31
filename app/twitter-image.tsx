import { ogAlt, renderOgImage, size, contentType } from "@/lib/og-image";

// Root Twitter/X card image (twitter:image). Same card as the OG image; X and
// most apps fall back to og:image, but emitting twitter:image explicitly makes
// the summary_large_image card reliable. See lib/og-image.tsx.
export { size, contentType };
export const alt = ogAlt();
// Required so the route is prerendered to a static PNG under `output: 'export'`.
export const dynamic = "force-static";

export default function Image() {
  return renderOgImage();
}
