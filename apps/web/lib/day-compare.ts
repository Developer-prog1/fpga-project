const MONTHS_SHORT = ["հնվ", "փտր", "մրտ", "ապր", "մյս", "հնս", "հլս", "օգս", "սեպ", "հոկ", "նոյ", "դեկ"];

export const DAY_LINE_COLORS = [
  "#7a2433",
  "#2e4a6e",
  "#2a4538",
  "#1f6f78",
  "#5c4d7a",
  "#3f6a62",
  "#8a3d4b",
  "#3d5a80",
  "#6b4c2a",
  "#4f5d32",
];

export function dayKeyFromIso(iso: string) {
  const date = new Date(iso);
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${date.getFullYear()}-${month}-${day}`;
}

export function minutesOfDay(iso: string) {
  const date = new Date(iso);
  return date.getHours() * 60 + date.getMinutes();
}

export function shortDayLabel(key: string) {
  const [, month, day] = key.split("-").map(Number);
  return `${day} ${MONTHS_SHORT[month - 1] ?? ""}`;
}

export type DayBucket<T> = {
  key: string;
  label: string;
  color: string;
  rows: T[];
};

export function groupByDay<T extends { recordedAt: string }>(rows: T[]): DayBucket<T>[] {
  const groups = new Map<string, T[]>();
  for (const row of rows) {
    const key = dayKeyFromIso(row.recordedAt);
    const list = groups.get(key);
    if (list) list.push(row);
    else groups.set(key, [row]);
  }
  return [...groups.keys()].sort().map((key, index) => ({
    key,
    label: shortDayLabel(key),
    color: DAY_LINE_COLORS[index % DAY_LINE_COLORS.length],
    rows: groups.get(key) ?? [],
  }));
}
