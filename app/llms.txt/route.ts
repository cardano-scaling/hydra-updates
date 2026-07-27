import { buildLlmsTxt } from "@/lib/llm-feed";

// Static GET Route Handler — rendered to a file at `next build` (static export
// supports GET handlers; see node_modules/next/dist/docs/.../static-exports.md).
export const dynamic = "force-static";

export function GET() {
  return new Response(buildLlmsTxt(), {
    headers: { "content-type": "text/plain; charset=utf-8" },
  });
}
