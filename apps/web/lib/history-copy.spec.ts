import { describe, expect, it } from "vitest";
import {
  historyCompareNote,
  historySectionNote,
  recentWindowSpan,
} from "./history";
import { legendAmount } from "./metrics";

describe("history copy", () => {
  it("says the line is an average and rainfall is a sum", () => {
    expect(historySectionNote("2h")).toContain("2 ժամի միջին");
    expect(historySectionNote("2h")).toContain("գումարը");
    expect(historySectionNote("1d")).toContain("օրվա միջին");
    expect(historyCompareNote("2h")).toContain("2 ժամի միջինն են");
  });

  it("names the hours that actually arrived in a short window", () => {
    const rows = [16, 19].map((hour) => ({
      recordedAt: new Date(2026, 10, 14, hour).toISOString(),
    }));
    const span = recentWindowSpan(rows, new Date(2026, 10, 15, 16).getTime());
    expect(span?.label).toBe("14 նոյ, 16:00–19:00");
    expect(span?.sentence).toBe("Վերջին 24 ժամում չափում կա միայն 14 նոյ, 16:00–19:00։");
  });

  it("stays quiet when the last day is covered up to now", () => {
    const now = new Date(2026, 10, 15, 16).getTime();
    const rows = Array.from({ length: 24 }, (_, i) => ({
      recordedAt: new Date(now - 23 * 3_600_000 + i * 3_600_000).toISOString(),
    }));
    expect(recentWindowSpan(rows, now)).toBeNull();
  });
});

describe("legendAmount", () => {
  it("sums rainfall bars and keeps the last point of a line", () => {
    expect(legendAmount("bars", [0.42, 3.5, 3.78, 0], 2)).toEqual({
      prefix: "գումար",
      text: "7,70",
    });
    expect(legendAmount("area", [22, 18.1], 1)).toEqual({ text: "18,1" });
    expect(legendAmount("line", [], 1)).toBeNull();
  });
});
