import { formatMetric } from "@/lib/metrics";
import type { HistoryGrain, HistorySpan } from "@/lib/types";

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

export function isDayKey(value: string | undefined): value is string {
  if (!value || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const [year, month, day] = value.split("-").map(Number);
  const date = new Date(year, month - 1, day);
  return date.getFullYear() === year && date.getMonth() === month - 1 && date.getDate() === day;
}

export function inclusiveDays(from: string, to: string) {
  const [fromYear, fromMonth, fromDay] = from.split("-").map(Number);
  const [toYear, toMonth, toDay] = to.split("-").map(Number);
  const start = new Date(fromYear, fromMonth - 1, fromDay);
  const end = new Date(toYear, toMonth - 1, toDay);
  return Math.round((end.getTime() - start.getTime()) / 86_400_000) + 1;
}

export function historyTickLabel(iso: string, grain: HistoryGrain, days: number) {
  const date = new Date(iso);
  if (grain === "30m") {
    return new Intl.DateTimeFormat("hy-AM", {
      hour: "2-digit",
      minute: "2-digit",
    }).format(date);
  }
  if (grain === "2h" && days <= 2) {
    return new Intl.DateTimeFormat("hy-AM", {
      day: "numeric",
      month: "short",
      hour: "2-digit",
    }).format(date);
  }
  return new Intl.DateTimeFormat("hy-AM", {
    day: "numeric",
    month: "short",
  }).format(date);
}

export function historyRangeLabel(from: string, to: string) {
  const fmt = new Intl.DateTimeFormat("hy-AM", { day: "numeric", month: "long" });
  const start = fmt.format(new Date(from));
  const end = fmt.format(new Date(to));
  return start === end ? start : `${start} – ${end}`;
}

export function historySectionTitle(span: HistorySpan | null, dayFrom: string, dayTo: string) {
  if (span) return historySpanMeta(span).title;
  return dayFrom === dayTo ? "Ընտրված օր" : "Ընտրված օրեր";
}

export function historySectionNote(grain: HistoryGrain) {
  if (grain === "30m") return "Յուրաքանչյուր կետը 30 րոպե է. մուգ շերտը գիշերն է։";
  if (grain === "2h") return "Յուրաքանչյուր կետը 2 ժամ է. մուգ շերտը գիշերն է։";
  return "Յուրաքանչյուր կետը մեկ օր է. տեղումները օրվա գումարն են։";
}

export function historyPreviousLabel(span: HistorySpan | null, dayFrom: string, dayTo: string) {
  if (span) return historySpanMeta(span).previous;
  const days = inclusiveDays(dayFrom, dayTo);
  return days <= 1 ? "նախորդ օրը" : `նախորդ ${days} օր`;
}
