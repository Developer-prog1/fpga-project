export type ChartWindow = { start: number; end: number };

const HOUR = 60 * 60 * 1000;

export function recentWindow(now = Date.now(), hours = 24): ChartWindow {
  return { start: now - hours * HOUR, end: now };
}

export function xInWindow(ms: number, window: ChartWindow, left: number, width: number) {
  const span = window.end - window.start || 1;
  const t = Math.min(window.end, Math.max(window.start, ms));
  return left + ((t - window.start) / span) * width;
}

/** Local-night stretches inside the window: 20:00–06:00. */
export function nightIntervals(window: ChartWindow): ChartWindow[] {
  const bands: ChartWindow[] = [];
  let cursor = window.start;
  while (cursor < window.end) {
    const date = new Date(cursor);
    const hour = date.getHours();
    const night = hour >= 20 || hour < 6;
    const boundary = new Date(date);
    boundary.setMinutes(0, 0, 0);
    if (hour < 6) boundary.setHours(6);
    else if (hour < 20) boundary.setHours(20);
    else {
      boundary.setDate(boundary.getDate() + 1);
      boundary.setHours(6);
    }
    const end = Math.min(boundary.getTime(), window.end);
    if (end <= cursor) break;
    if (night) bands.push({ start: cursor, end });
    cursor = end;
  }
  return bands;
}

/** Clock marks every `stepHours`, plus an edge when it sits well clear of those marks. */
export function windowTickMarks(window: ChartWindow, stepHours = 6) {
  const first = new Date(window.start);
  first.setMinutes(0, 0, 0);
  if (first.getTime() < window.start) first.setHours(first.getHours() + 1);
  while (first.getTime() <= window.end && first.getHours() % stepHours !== 0) {
    first.setHours(first.getHours() + 1);
  }

  const marks: number[] = [];
  for (let ms = first.getTime(); ms <= window.end && marks.length < 12; ms += stepHours * HOUR) {
    if (ms >= window.start) marks.push(ms);
  }

  const gap = 3 * HOUR;
  if (marks.length === 0 || marks[0] - window.start > gap) marks.unshift(window.start);
  const last = marks[marks.length - 1];
  if (last == null || window.end - last > gap) marks.push(window.end);
  return marks;
}
