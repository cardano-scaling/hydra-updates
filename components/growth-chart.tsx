import type { ImpactSeries } from "@/lib/types";

// Categorical series colors — validated CVD-safe (see globals.css --viz-*).
// Fixed order, never cycled; a 4th series would need its own validated slot.
const SERIES_COLORS = ["var(--viz-1)", "var(--viz-2)", "var(--viz-3)"];

const W = 760;
const H = 320;
const M = { top: 16, right: 104, bottom: 36, left: 44 };
const PLOT_W = W - M.left - M.right;
const PLOT_H = H - M.top - M.bottom;

function niceBounds(values: number[]): { min: number; max: number } {
  const lo = Math.min(...values);
  const hi = Math.max(...values);
  const pad = Math.max(1, (hi - lo) * 0.12);
  return { min: Math.floor((lo - pad) / 5) * 5, max: Math.ceil((hi + pad) / 5) * 5 };
}

/**
 * Multi-series line chart of indexed developer growth (change-over-time →
 * lines). Server-rendered SVG: recessive grid, 2px lines, direct end-labels, a
 * legend, native per-point tooltips, and a data table as the accessible view.
 */
export function GrowthChart({ series, yLabel }: { series: ImpactSeries[]; yLabel: string }) {
  const labels = series[0]?.points.map((p) => p.label) ?? [];
  const allValues = series.flatMap((s) => s.points.map((p) => p.value));
  if (allValues.length === 0) {
    return <p className="text-sm text-muted">No data available yet.</p>;
  }

  const { min, max } = niceBounds(allValues);
  const n = labels.length;
  const x = (i: number) => M.left + (n <= 1 ? 0 : (i / (n - 1)) * PLOT_W);
  const y = (v: number) => M.top + (1 - (v - min) / (max - min)) * PLOT_H;

  const ticks = Array.from({ length: 5 }, (_, i) => min + ((max - min) / 4) * i);

  return (
    <figure className="m-0">
      {/* legend */}
      <figcaption className="mb-3 flex flex-wrap items-center gap-x-5 gap-y-1">
        {series.map((s, i) => (
          <span key={s.name} className="inline-flex items-center gap-2 text-xs text-foreground">
            <span
              aria-hidden
              className="inline-block h-0.5 w-4 rounded-full"
              style={{ backgroundColor: SERIES_COLORS[i] ?? "var(--gh-neutral)" }}
            />
            {s.name}
          </span>
        ))}
      </figcaption>

      <div className="overflow-x-auto">
        <svg
          viewBox={`0 0 ${W} ${H}`}
          className="h-auto w-full min-w-[520px]"
          role="img"
          aria-label={`Line chart: ${yLabel}`}
        >
          {/* horizontal gridlines + y tick labels */}
          {ticks.map((t) => (
            <g key={t}>
              <line
                x1={M.left}
                x2={M.left + PLOT_W}
                y1={y(t)}
                y2={y(t)}
                stroke="var(--border)"
                strokeWidth={1}
              />
              <text
                x={M.left - 8}
                y={y(t)}
                textAnchor="end"
                dominantBaseline="middle"
                className="font-mono"
                style={{ fill: "var(--muted)", fontSize: 11 }}
              >
                {Math.round(t)}
              </text>
            </g>
          ))}

          {/* x labels */}
          {labels.map((label, i) => (
            <text
              key={label}
              x={x(i)}
              y={H - 12}
              textAnchor="middle"
              className="font-mono"
              style={{ fill: "var(--muted)", fontSize: 11 }}
            >
              {label}
            </text>
          ))}

          {/* series lines, points, and direct end-labels */}
          {series.map((s, i) => {
            const color = SERIES_COLORS[i] ?? "var(--gh-neutral)";
            const primary = i === 0;
            const path = s.points.map((p, j) => `${j === 0 ? "M" : "L"} ${x(j)} ${y(p.value)}`).join(" ");
            const last = s.points[s.points.length - 1];
            return (
              <g key={s.name}>
                <path
                  d={path}
                  fill="none"
                  stroke={color}
                  strokeWidth={primary ? 2.5 : 2}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                {s.points.map((p, j) => (
                  <circle key={p.label} cx={x(j)} cy={y(p.value)} r={primary ? 4 : 3.5} fill={color}>
                    <title>{`${s.name} · ${p.label}: ${p.value}`}</title>
                  </circle>
                ))}
                {last && (
                  <text
                    x={M.left + PLOT_W + 10}
                    y={y(last.value)}
                    dominantBaseline="middle"
                    className="font-mono"
                    style={{ fill: "var(--muted)", fontSize: 11 }}
                  >
                    {s.name}
                  </text>
                )}
              </g>
            );
          })}
        </svg>
      </div>

      {/* accessible data view */}
      <div className="mt-5 overflow-x-auto">
        <table className="w-full border-collapse text-sm">
          <thead>
            <tr>
              <th className="border-b border-border py-2 pr-4 text-left font-mono text-[0.65rem] uppercase tracking-wider text-muted">
                Series
              </th>
              {labels.map((label) => (
                <th
                  key={label}
                  className="border-b border-border px-2 py-2 text-right font-mono text-[0.65rem] uppercase tracking-wider text-muted"
                >
                  {label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {series.map((s, i) => (
              <tr key={s.name}>
                <th className="border-b border-border py-2 pr-4 text-left font-normal text-foreground">
                  <span className="inline-flex items-center gap-2">
                    <span
                      aria-hidden
                      className="inline-block h-0.5 w-4 rounded-full"
                      style={{ backgroundColor: SERIES_COLORS[i] ?? "var(--gh-neutral)" }}
                    />
                    {s.name}
                  </span>
                </th>
                {s.points.map((p) => (
                  <td
                    key={p.label}
                    className="border-b border-border px-2 py-2 text-right tabular-nums text-muted"
                  >
                    {p.value}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </figure>
  );
}
