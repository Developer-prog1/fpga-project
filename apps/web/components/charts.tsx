import { formatMetric } from "@/lib/metrics";

type Pt = { x: number; y: number };

function smoothLine(points: Pt[]) {
  if (points.length === 0) return "";
  if (points.length === 1) return `M ${points[0].x} ${points[0].y}`;
  let d = `M ${points[0].x.toFixed(1)} ${points[0].y.toFixed(1)}`;
  for (let i = 0; i < points.length - 1; i++) {
    const p0 = points[i - 1] ?? points[i];
    const p1 = points[i];
    const p2 = points[i + 1];
    const p3 = points[i + 2] ?? p2;
    const c1x = p1.x + (p2.x - p0.x) / 6;
    const c1y = p1.y + (p2.y - p0.y) / 6;
    const c2x = p2.x - (p3.x - p1.x) / 6;
    const c2y = p2.y - (p3.y - p1.y) / 6;
    d += ` C ${c1x.toFixed(1)} ${c1y.toFixed(1)} ${c2x.toFixed(1)} ${c2y.toFixed(1)} ${p2.x.toFixed(1)} ${p2.y.toFixed(1)}`;
  }
  return d;
}

function scaleY(value: number, min: number, span: number, top: number, innerH: number) {
  return top + innerH - ((value - min) / span) * innerH;
}

function niceStep(span: number) {
  const rough = Math.abs(span) / 3 || 1;
  const exp = Math.floor(Math.log10(rough));
  const pow = 10 ** exp;
  const n = rough / pow;
  const nice = n > 7 ? 10 : n > 3 ? 5 : n > 1.4 ? 2 : 1;
  return nice * pow;
}

function niceBounds(values: number[]) {
  const rawMin = Math.min(...values);
  const rawMax = Math.max(...values);
  if (!Number.isFinite(rawMin) || !Number.isFinite(rawMax)) return { min: 0, max: 1 };

  let min = rawMin;
  let max = rawMax;
  if (min === max) {
    const pad = Math.abs(min) * 0.08 || 1;
    min -= pad;
    max += pad;
  } else {
    const pad = (max - min) * 0.1;
    min -= pad;
    max += pad;
  }
  if (rawMin >= 0) min = Math.max(0, min);
  const step = niceStep(max - min);
  min = Math.floor(min / step) * step;
  max = Math.ceil(max / step) * step;
  if (rawMin >= 0) min = Math.max(0, min);
  if (min === max) max = min + step;
  return { min, max };
}

function ticks(min: number, max: number) {
  const step = niceStep(max - min || 1);
  const out: number[] = [];
  const start = Math.round(min / step) * step;
  for (let value = start; value <= max + step * 0.001; value += step) {
    out.push(Number(value.toPrecision(8)));
    if (out.length > 7) break;
  }
  return out.length ? out : [min, max];
}

function formatAxis(value: number) {
  const abs = Math.abs(value);
  if (abs >= 1000) return Math.round(value).toLocaleString("hy-AM");
  if (abs >= 100) return Math.round(value).toString();
  return value.toFixed(abs < 10 && abs !== Math.round(abs) ? 1 : 0).replace(".", ",");
}

function xAt(i: number, n: number, left: number, innerW: number) {
  return left + (i / Math.max(n - 1, 1)) * innerW;
}

export function Ribbon({
  values,
  color = "#7a2433",
}: {
  values: number[];
  color?: string;
}) {
  if (values.length < 2) return null;
  const min = Math.min(...values);
  const max = Math.max(...values);
  const span = max - min || 1;
  const w = 420;
  const h = 78;
  const pad = 4;
  const points = values.map((value, i) => ({
    x: pad + (i / (values.length - 1)) * (w - pad * 2),
    y: h - pad - ((value - min) / span) * (h - pad * 2),
  }));
  const line = smoothLine(points);
  const last = points[points.length - 1];
  const gid = `ribbon-${color.replace("#", "")}`;

  return (
    <svg viewBox={`0 0 ${w} ${h}`} className="h-20 w-full" aria-hidden>
      <defs>
        <linearGradient id={gid} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.32" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      <path
        d={`${line} L ${last.x.toFixed(1)} ${h - pad} L ${points[0].x.toFixed(1)} ${h - pad} Z`}
        fill={`url(#${gid})`}
      />
      <path d={line} fill="none" stroke={color} strokeWidth="2.2" strokeLinejoin="round" strokeLinecap="round" />
      <circle cx={last.x} cy={last.y} r="3" fill={color} />
    </svg>
  );
}

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
  const w = 132;
  const h = 42;
  const pad = 3;
  const points = values.map((value, i) => ({
    x: pad + (i / (values.length - 1)) * (w - pad * 2),
    y: h - pad - ((value - min) / span) * (h - pad * 2),
  }));
  const line = smoothLine(points);
  const last = points[points.length - 1];
  const gid = `spark-${color.replace("#", "")}`;

  return (
    <svg viewBox={`0 0 ${w} ${h}`} className="h-10 w-32" aria-hidden>
      <defs>
        <linearGradient id={gid} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.35" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      <path
        d={`${line} L ${last.x.toFixed(1)} ${h - pad} L ${points[0].x.toFixed(1)} ${h - pad} Z`}
        fill={`url(#${gid})`}
      />
      <path d={line} fill="none" stroke={color} strokeWidth="1.8" strokeLinejoin="round" strokeLinecap="round" />
      <circle cx={last.x} cy={last.y} r="2.4" fill={color} />
    </svg>
  );
}

export type ChartSeries = {
  label: string;
  color: string;
  values: number[];
  unit?: string;
  kind?: "area" | "line" | "bars";
  axis?: "left" | "right";
  digits?: number;
};

export function TimeChart({
  labels,
  times,
  series,
  unitLeft,
  unitRight,
}: {
  labels: string[];
  times?: string[];
  series: ChartSeries[];
  unitLeft?: string;
  unitRight?: string;
}) {
  const w = 720;
  const h = 268;
  const hasRight = series.some((s) => (s.axis ?? "left") === "right");
  const pad = { l: 58, r: hasRight ? 50 : 18, t: 20, b: 32 };
  const innerW = w - pad.l - pad.r;
  const innerH = h - pad.t - pad.b;
  const n = Math.max(...series.map((s) => s.values.length), 1);

  const leftVals = series.filter((s) => (s.axis ?? "left") === "left").flatMap((s) => s.values);
  const rightVals = series.filter((s) => s.axis === "right").flatMap((s) => s.values);
  const left = niceBounds(leftVals.length ? leftVals : [0, 1]);
  const right = niceBounds(rightVals.length ? rightVals : [0, 1]);
  const leftSpan = left.max - left.min || 1;
  const rightSpan = right.max - right.min || 1;

  function axisOf(item: ChartSeries) {
    return item.axis === "right" ? { min: right.min, span: rightSpan } : { min: left.min, span: leftSpan };
  }

  function pointsOf(values: number[], axis: ChartSeries["axis"]) {
    const { min, span } = axis === "right" ? { min: right.min, span: rightSpan } : { min: left.min, span: leftSpan };
    return values.map((value, i) => ({
      x: xAt(i, n, pad.l, innerW),
      y: scaleY(value, min, span, pad.t, innerH),
    }));
  }

  const nightRects =
    times?.flatMap((iso, i) => {
      const hour = new Date(iso).getHours();
      const night = hour >= 20 || hour < 6;
      if (!night || i === n - 1) return [];
      const x = xAt(i, n, pad.l, innerW);
      const next = xAt(i + 1, n, pad.l, innerW);
      return [{ x, width: Math.max(next - x, 0.5) }];
    }) ?? [];

  const timeTicks = [0, 0.25, 0.5, 0.75, 1].map((t) => {
    const i = Math.min(labels.length - 1, Math.round(t * (labels.length - 1)));
    return { i, label: labels[i] ?? "" };
  });

  return (
    <div>
      <svg viewBox={`0 0 ${w} ${h}`} className="h-auto w-full" role="img">
        <defs>
          {series.map((item, i) => (
            <linearGradient id={`fill-${i}-${item.color.replace("#", "")}`} key={item.label} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={item.color} stopOpacity="0.28" />
              <stop offset="100%" stopColor={item.color} stopOpacity="0.02" />
            </linearGradient>
          ))}
        </defs>

        {nightRects.map((rect, i) => (
          <rect
            key={i}
            x={rect.x}
            y={pad.t}
            width={rect.width}
            height={innerH}
            fill="rgba(46, 74, 110, 0.045)"
          />
        ))}

        {ticks(left.min, left.max).map((tick) => {
          const y = scaleY(tick, left.min, leftSpan, pad.t, innerH);
          return (
            <g key={tick}>
              <line x1={pad.l} x2={w - pad.r} y1={y} y2={y} stroke="rgba(26,18,14,0.07)" />
              <text x={pad.l - 8} y={y + 3.5} textAnchor="end" fill="#7a6e64" fontSize="10">
                {formatAxis(tick)}
              </text>
            </g>
          );
        })}

        {hasRight
          ? ticks(right.min, right.max).map((tick) => {
              const y = scaleY(tick, right.min, rightSpan, pad.t, innerH);
              return (
                <text key={`r-${tick}`} x={w - pad.r + 8} y={y + 3.5} fill="#7a6e64" fontSize="10">
                  {formatAxis(tick)}
                </text>
              );
            })
          : null}

        {unitLeft ? (
          <text x={pad.l} y={12} fill="#5c5148" fontSize="10">
            {unitLeft}
          </text>
        ) : null}
        {unitRight ? (
          <text x={w - pad.r} y={12} textAnchor="end" fill="#5c5148" fontSize="10">
            {unitRight}
          </text>
        ) : null}

        {series.map((item, si) => {
          const kind = item.kind ?? "area";
          const pts = pointsOf(item.values, item.axis);
          if (kind === "bars") {
            const maxBar = Math.min(14, innerW / Math.max(item.values.length, 1) - 1.5);
            return (
              <g key={item.label}>
                {item.values.map((value, i) => {
                  if (value <= 0.01) return null;
                  const x = xAt(i, n, pad.l, innerW);
                  const y = scaleY(value, axisOf(item).min, axisOf(item).span, pad.t, innerH);
                  const barH = pad.t + innerH - y;
                  return (
                    <rect
                      key={i}
                      x={x - maxBar / 2}
                      y={y}
                      width={maxBar}
                      height={Math.max(barH, 0)}
                      rx="3"
                      fill={item.color}
                      opacity="0.72"
                    />
                  );
                })}
              </g>
            );
          }

          const line = smoothLine(pts);
          const last = pts[pts.length - 1];
          const first = pts[0];
          return (
            <g key={item.label}>
              {kind === "area" && last && first ? (
                <path
                  d={`${line} L ${last.x.toFixed(1)} ${pad.t + innerH} L ${first.x.toFixed(1)} ${pad.t + innerH} Z`}
                  fill={`url(#fill-${si}-${item.color.replace("#", "")})`}
                />
              ) : null}
              <path
                d={line}
                fill="none"
                stroke={item.color}
                strokeWidth="2.4"
                strokeLinejoin="round"
                strokeLinecap="round"
                strokeDasharray={kind === "line" ? "7 6" : undefined}
              />
              {last ? <circle cx={last.x} cy={last.y} r="3.2" fill={item.color} /> : null}
            </g>
          );
        })}

        {timeTicks.map((tick, i) => (
          <text
            key={tick.label + i}
            x={xAt(tick.i, n, pad.l, innerW)}
            y={h - 10}
            textAnchor={i === 0 ? "start" : i === timeTicks.length - 1 ? "end" : "middle"}
            fill="#5c5148"
            fontSize="11"
          >
            {tick.label}
          </text>
        ))}
      </svg>
    </div>
  );
}

export function ChartLegend({ series }: { series: ChartSeries[] }) {
  return (
    <div className="mt-1 flex flex-wrap gap-x-5 gap-y-2 text-sm">
      {series.map((item) => {
        const last = item.values[item.values.length - 1];
        return (
          <span key={item.label} className="inline-flex items-center gap-2 text-ink-soft">
            <span className="size-2.5 rounded-full" style={{ background: item.color }} />
            <span>{item.label}</span>
            {last != null ? (
              <span className="font-medium text-ink">
                {formatMetric(last, item.digits ?? 1)}
                {item.unit ? ` ${item.unit}` : ""}
              </span>
            ) : null}
          </span>
        );
      })}
    </div>
  );
}

export function WindRose({ deg, speed }: { deg: number; speed: number }) {
  const cx = 100;
  const cy = 100;
  const r = 74;
  const rad = ((deg - 90) * Math.PI) / 180;
  const tipX = cx + Math.cos(rad) * (r - 10);
  const tipY = cy + Math.sin(rad) * (r - 10);
  const tailX = cx - Math.cos(rad) * 22;
  const tipY2 = cy - Math.sin(rad) * 22;
  const left = 14;
  const nx = -Math.sin(rad);
  const ny = Math.cos(rad);

  const cardinal = [
    { label: "Հս", x: cx, y: 18 },
    { label: "Ա", x: 184, y: cy + 4 },
    { label: "Հր", x: cx, y: 192 },
    { label: "Ամ", x: 16, y: cy + 4 },
  ];

  return (
    <svg viewBox="0 0 200 200" className="mx-auto h-[210px] w-[210px]" role="img" aria-label="Քամու ուղղություն">
      <circle cx={cx} cy={cy} r="88" fill="rgba(255,250,242,0.65)" stroke="rgba(196,163,90,0.35)" />
      <circle cx={cx} cy={cy} r={r} fill="none" stroke="rgba(26,18,14,0.08)" />
      <circle cx={cx} cy={cy} r="48" fill="none" stroke="rgba(26,18,14,0.06)" />
      {Array.from({ length: 8 }, (_, i) => {
        const a = ((i * 45 - 90) * Math.PI) / 180;
        const inner = i % 2 === 0 ? r - 12 : r - 7;
        return (
          <line
            key={i}
            x1={cx + Math.cos(a) * (r - 2)}
            y1={cy + Math.sin(a) * (r - 2)}
            x2={cx + Math.cos(a) * inner}
            y2={cy + Math.sin(a) * inner}
            stroke={i % 2 === 0 ? "#c4a35a" : "rgba(26,18,14,0.18)"}
            strokeWidth={i % 2 === 0 ? 2 : 1}
          />
        );
      })}
      {cardinal.map((c) => (
        <text key={c.label} x={c.x} y={c.y} textAnchor="middle" fill="#5c5148" fontSize="11" fontWeight="600">
          {c.label}
        </text>
      ))}
      <polygon
        points={`${tipX},${tipY} ${tailX + nx * left},${tipY2 + ny * left} ${tailX - nx * left},${tipY2 - ny * left}`}
        fill="#7a2433"
        opacity="0.92"
      />
      <circle cx={cx} cy={cy} r="28" fill="#fffaf2" stroke="rgba(196,163,90,0.45)" />
      <text x={cx} y={cy - 2} textAnchor="middle" fill="#1a120e" fontSize="18" fontFamily="var(--font-serif-armenian), serif">
        {formatMetric(speed, 1)}
      </text>
      <text x={cx} y={cy + 16} textAnchor="middle" fill="#5c5148" fontSize="10">
        m/s
      </text>
    </svg>
  );
}

export function MoistureGauge({ value }: { value: number }) {
  const cx = 100;
  const cy = 92;
  const r = 64;
  const start = Math.PI * 0.78;
  const sweep = Math.PI * 1.44;
  const t = Math.min(Math.max(value, 0), 100) / 100;

  function arc(from: number, to: number) {
    const a0 = start + sweep * from;
    const a1 = start + sweep * to;
    const x0 = cx + Math.cos(a0) * r;
    const y0 = cy + Math.sin(a0) * r;
    const x1 = cx + Math.cos(a1) * r;
    const y1 = cy + Math.sin(a1) * r;
    const large = a1 - a0 > Math.PI ? 1 : 0;
    return `M ${x0} ${y0} A ${r} ${r} 0 ${large} 1 ${x1} ${y1}`;
  }

  const needle = start + sweep * t;
  const nx = cx + Math.cos(needle) * (r - 14);
  const ny = cy + Math.sin(needle) * (r - 14);

  return (
    <svg viewBox="0 0 200 128" className="mx-auto h-[132px] w-[210px]" role="img" aria-label="Հողի խոնավություն">
      <path d={arc(0, 1)} fill="none" stroke="rgba(26,18,14,0.08)" strokeWidth="12" strokeLinecap="round" />
      <path d={arc(0, t)} fill="none" stroke="#2a4538" strokeWidth="12" strokeLinecap="round" />
      <line x1={cx} y1={cy} x2={nx} y2={ny} stroke="#1a120e" strokeWidth="2.4" strokeLinecap="round" />
      <circle cx={cx} cy={cy} r="6" fill="#1a120e" />
      <text x={cx + Math.cos(start) * (r + 16)} y={cy + Math.sin(start) * (r + 16) + 4} textAnchor="middle" fill="#7a6e64" fontSize="10">
        չոր
      </text>
      <text x={cx + Math.cos(start + sweep) * (r + 16)} y={cy + Math.sin(start + sweep) * (r + 16) + 4} textAnchor="middle" fill="#7a6e64" fontSize="10">
        խոնավ
      </text>
    </svg>
  );
}
