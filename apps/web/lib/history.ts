import { dictionary } from "@/lib/i18n/messages";
import { intlLocale, type Locale } from "@/lib/i18n/locale";
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
    note: "Յուրաքանչյուր կետը 30 րոպեի միջինն է, տեղումները՝ այդ միջակայքի գումարը. մուգ շերտը գիշերն է։",
  },
  {
    id: "7d",
    label: "7 օր",
    title: "7 օրվա ընթացք",
    previous: "նախորդ 7 օր",
    note: "Յուրաքանչյուր կետը 2 ժամի միջինն է, տեղումները՝ այդ միջակայքի գումարը. մուգ շերտը գիշերն է։",
  },
  {
    id: "30d",
    label: "30 օր",
    title: "30 օրվա ընթացք",
    previous: "նախորդ 30 օր",
    note: "Յուրաքանչյուր կետը օրվա միջինն է. տեղումները օրվա գումարն են։",
  },
];

export function isHistorySpan(value: string): value is HistorySpan {
  return HISTORY_SPANS.some((item) => item.id === value);
}

export function parseHistorySpan(value: string | undefined): HistorySpan {
  return value && isHistorySpan(value) ? value : "7d";
}

export function formatSigned(value: number, digits: number, locale: Locale = "am") {
  const abs = formatMetric(Math.abs(value), digits, locale);
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

export function historyTickLabel(iso: string, grain: HistoryGrain, days: number, locale: Locale = "am") {
  const date = new Date(iso);
  const tag = intlLocale(locale);
  if (grain === "30m") {
    return new Intl.DateTimeFormat(tag, {
      hour: "2-digit",
      minute: "2-digit",
    }).format(date);
  }
  if (grain === "2h" && days <= 2) {
    return new Intl.DateTimeFormat(tag, {
      day: "numeric",
      month: "short",
      hour: "2-digit",
    }).format(date);
  }
  return new Intl.DateTimeFormat(tag, {
    day: "numeric",
    month: "short",
  }).format(date);
}

export function historyRangeLabel(from: string, to: string, locale: Locale = "am") {
  const fmt = new Intl.DateTimeFormat(intlLocale(locale), { day: "numeric", month: "long" });
  const start = fmt.format(new Date(from));
  const end = fmt.format(new Date(to));
  return start === end ? start : `${start} – ${end}`;
}

export function historySectionTitle(
  span: HistorySpan | null,
  dayFrom: string,
  dayTo: string,
  locale: Locale = "am",
) {
  const copy = dictionary(locale).history;
  if (span) return copy.spans[span].title;
  return dayFrom === dayTo ? copy.selectedDay : copy.selectedDays;
}

export function grainMeanLabel(grain: HistoryGrain, locale: Locale = "am") {
  return dictionary(locale).history.grainMean[grain];
}

export function historySectionNote(grain: HistoryGrain, locale: Locale = "am") {
  return dictionary(locale).history.grain[grain];
}

export function historyCompareNote(grain: HistoryGrain, locale: Locale = "am") {
  return dictionary(locale).history.compareDaysNote(grainMeanLabel(grain, locale));
}

function clockLabel(date: Date, locale: Locale) {
  return new Intl.DateTimeFormat(intlLocale(locale), { hour: "2-digit", minute: "2-digit" }).format(date);
}

function dayClockLabel(date: Date, locale: Locale) {
  const month = dictionary(locale).calendar.monthsShort[date.getMonth()];
  return `${date.getDate()} ${month}, ${clockLabel(date, locale)}`;
}

export function recentWindowSpan(
  rows: { recordedAt: string }[],
  now = Date.now(),
  windowHours = 24,
  locale: Locale = "am",
) {
  if (rows.length === 0) return null;
  const start = new Date(rows[0].recordedAt);
  const end = new Date(rows[rows.length - 1].recordedAt);
  const first = start.getTime();
  const last = end.getTime();
  if (!Number.isFinite(first) || !Number.isFinite(last)) return null;

  const covered =
    last - first >= (windowHours - 3) * 3_600_000 && now - last < 2 * 3_600_000;
  if (covered) return null;

  const sameDay = start.toDateString() === end.toDateString();
  const label =
    first === last
      ? dayClockLabel(start, locale)
      : sameDay
        ? `${dayClockLabel(start, locale)}–${clockLabel(end, locale)}`
        : `${dayClockLabel(start, locale)} – ${dayClockLabel(end, locale)}`;
  return {
    label,
    sentence: dictionary(locale).history.recentOnly(windowHours, label),
  };
}

export function historyPreviousLabel(
  span: HistorySpan | null,
  dayFrom: string,
  dayTo: string,
  locale: Locale = "am",
) {
  const copy = dictionary(locale).history;
  if (span) return copy.spans[span].previous;
  const days = inclusiveDays(dayFrom, dayTo);
  return days <= 1 ? copy.previousDay : copy.previousDays(days);
}
