import { formatMetric } from "@/lib/metrics";
import type { HistorySpan } from "@/lib/types";

export const HISTORY_SPANS: {
  id: HistorySpan;
  label: string;
  title: string;
  previous: string;
  note: string;
}[] = [
  {
    id: "24h",
    label: "24 ժամ",
    title: "24 ժամվա ընթացք",
    previous: "նախորդ 24 ժամ",
    note: "Յուրաքանչյուր կետը 30 րոպե է. մուգ շերտը գիշերն է։",
  },
  {
    id: "7d",
    label: "7 օր",
    title: "7 օրվա ընթացք",
    previous: "նախորդ 7 օր",
    note: "Յուրաքանչյուր կետը 2 ժամ է. մուգ շերտը գիշերն է։",
  },
  {
    id: "30d",
    label: "30 օր",
    title: "30 օրվա ընթացք",
    previous: "նախորդ 30 օր",
    note: "Յուրաքանչյուր կետը մեկ օր է. տեղումները օրվա գումարն են։",
  },
];

export function isHistorySpan(value: string): value is HistorySpan {
  return HISTORY_SPANS.some((item) => item.id === value);
}

export function parseHistorySpan(value: string | undefined): HistorySpan {
  return value && isHistorySpan(value) ? value : "7d";
}

export function historySpanMeta(span: HistorySpan) {
  return HISTORY_SPANS.find((item) => item.id === span) ?? HISTORY_SPANS[1];
}

export function formatSigned(value: number, digits: number) {
  const abs = formatMetric(Math.abs(value), digits);
  if (value > 0) return `+${abs}`;
  if (value < 0) return `−${abs}`;
  return abs;
}

export function historyTickLabel(iso: string, span: HistorySpan) {
  const date = new Date(iso);
  if (span === "24h") {
    return new Intl.DateTimeFormat("hy-AM", {
      hour: "2-digit",
      minute: "2-digit",
    }).format(date);
  }
  return new Intl.DateTimeFormat("hy-AM", {
    day: "numeric",
    month: "short",
  }).format(date);
}

export function historyRangeLabel(from: string, to: string) {
  const fmt = new Intl.DateTimeFormat("hy-AM", { day: "numeric", month: "long" });
  return `${fmt.format(new Date(from))} – ${fmt.format(new Date(to))}`;
}
