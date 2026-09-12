export function Sparkline({
  values,
  color = "#c4a35a",
}: {
  values: number[];
  color?: string;
}) {
  if (values.length < 2) return null;

  const min = Math.min(...values);
  const max = Math.max(...values);
  const span = max - min || 1;
  const w = 120;
  const h = 36;
  const pad = 2;
  const points = values
    .map((value, i) => {
      const x = pad + (i / (values.length - 1)) * (w - pad * 2);
      const y = h - pad - ((value - min) / span) * (h - pad * 2);
      return `${x},${y}`;
    })
    .join(" ");

  return (
    <svg viewBox={`0 0 ${w} ${h}`} className="h-9 w-28" aria-hidden>
      <polyline
        fill="none"
        stroke={color}
        strokeWidth="1.8"
        strokeLinejoin="round"
        strokeLinecap="round"
        points={points}
      />
    </svg>
  );
}

export function LineChart({
  labels,
  series,
}: {
  labels: string[];
  series: Array<{ label: string; color: string; values: number[] }>;
}) {
  const w = 640;
  const h = 220;
  const pad = { l: 12, r: 12, t: 16, b: 28 };
  const innerW = w - pad.l - pad.r;
  const innerH = h - pad.t - pad.b;
  const all = series.flatMap((s) => s.values);
  if (all.length === 0) return null;
  const min = Math.min(...all);
  const max = Math.max(...all);
  const span = max - min || 1;
  const n = Math.max(...series.map((s) => s.values.length), 1);

  function path(values: number[]) {
    if (values.length === 0) return "";
    return values
      .map((value, i) => {
        const x = pad.l + (i / Math.max(n - 1, 1)) * innerW;
        const y = pad.t + innerH - ((value - min) / span) * innerH;
        return `${i === 0 ? "M" : "L"}${x.toFixed(1)} ${y.toFixed(1)}`;
      })
      .join(" ");
  }

  const ticks = [0, 0.5, 1].map((t) => labels[Math.min(labels.length - 1, Math.round(t * (labels.length - 1)))] ?? "");

  return (
    <div>
      <svg viewBox={`0 0 ${w} ${h}`} className="h-auto w-full" role="img">
        {[0, 0.5, 1].map((t) => {
          const y = pad.t + innerH * (1 - t);
          return (
            <line
              key={t}
              x1={pad.l}
              x2={w - pad.r}
              y1={y}
              y2={y}
              stroke="rgba(26,18,14,0.08)"
            />
          );
        })}
        {series.map((item) => (
          <path
            key={item.label}
            d={path(item.values)}
            fill="none"
            stroke={item.color}
            strokeWidth="2.2"
            strokeLinejoin="round"
            strokeLinecap="round"
          />
        ))}
        {ticks.map((label, i) => (
          <text
            key={label + i}
            x={pad.l + (i / 2) * innerW}
            y={h - 8}
            textAnchor={i === 0 ? "start" : i === 2 ? "end" : "middle"}
            fill="#5c5148"
            fontSize="11"
          >
            {label}
          </text>
        ))}
      </svg>
      <div className="mt-2 flex flex-wrap gap-4 text-xs text-ink-soft">
        {series.map((item) => (
          <span key={item.label} className="inline-flex items-center gap-2">
            <span className="size-2 rounded-full" style={{ background: item.color }} />
            {item.label}
          </span>
        ))}
      </div>
    </div>
  );
}
