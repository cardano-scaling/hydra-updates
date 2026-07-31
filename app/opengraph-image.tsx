import { ogAlt, renderOgImage, size, contentType } from "@/lib/og-image";

// Root Open Graph image (og:image). Next builds this to a static PNG at export
// time and injects the og:image meta tags. See lib/og-image.tsx for the card.
export { size, contentType };
export const alt = ogAlt();
// Required so the route is prerendered to a static PNG under `output: 'export'`.
export const dynamic = "force-static";

export default function Image() {
  return renderOgImage();
}
