import { describe, expect, it } from "vitest";
import { nightIntervals, recentWindow, windowTickMarks, xInWindow } from "./day-window";

describe("recent 24-hour window", () => {
  const start = new Date(2026, 10, 15, 17, 30).getTime();
  const end = new Date(2026, 10, 16, 17, 30).getTime();
  const window = { start, end };

  it("places a reading on its own hour", () => {
    expect(xInWindow(start, window, 10, 240)).toBe(10);
    expect(xInWindow(end, window, 10, 240)).toBe(250);
    expect(xInWindow(new Date(2026, 10, 15, 20, 0).getTime(), window, 0, 240)).toBe(25);
  });

  it("keeps the axis a full day when a reading falls outside it", () => {
    expect(xInWindow(start - 60_000, window, 0, 100)).toBe(0);
    expect(xInWindow(end + 60_000, window, 0, 100)).toBe(100);
  });

  it("shades the night as one band, not a new style each hour", () => {
    const nights = nightIntervals(window);
    expect(nights).toEqual([
      { start: new Date(2026, 10, 15, 20, 0).getTime(), end: new Date(2026, 10, 16, 6, 0).getTime() },
    ]);
  });

  it("labels the clock hours across the day and the current edge", () => {
    expect(windowTickMarks(window).map((ms) => new Date(ms).getHours() + ":" + new Date(ms).getMinutes())).toEqual([
      "18:0",
      "0:0",
      "6:0",
      "12:0",
      "17:30",
    ]);
  });

  it("opens a day-long window ending now", () => {
    expect(recentWindow(end, 24)).toEqual(window);
  });
});
