import { describe, expect, it } from "vitest";
import { DAY_LINE_COLORS } from "./day-compare";
import { historyNarratives, seriesShape, type NarrativePoint } from "./day-reading";
import { formatMetric } from "./metrics";
import type { HistoryGrain } from "./types";

function row(day: number, hour: number, patch: Partial<NarrativePoint> = {}): NarrativePoint {
  return {
    recordedAt: new Date(2026, 10, day, hour).toISOString(),
    airTemp: 12,
    soilTemp: 10,
    airHumidity: 55,
    soilMoisture: 40,
    windSpeed: 2,
    rainfallMm: 0,
    lightLux: 1000,
    uvIndex: 1,
    ...patch,
  };
}

function paragraphs(
  chartId: string,
  rows: NarrativePoint[],
  options: { grain?: HistoryGrain; compareDays?: boolean } = {},
) {
  const readings = historyNarratives(chartId, rows, {
    grain: options.grain ?? "30m",
    compareDays: options.compareDays ?? false,
  });
  return readings[0]?.paragraphs ?? [];
}

function air(rows: NarrativePoint[], grain: HistoryGrain = "30m") {
  return paragraphs("humidity", rows, { grain })[0] ?? "";
}

describe("seriesShape", () => {
  it("names a midday dip and refuses a curve that fits two stories", () => {
    expect(seriesShape([78, 70, 55, 42, 62, 74], false)).toBe("fell-then-rose");
    expect(seriesShape([15, 40, 0, 20], false)).toBe("mixed");
    expect(seriesShape([60, 62, 61, 63], true)).toBe("flat");
  });
});

describe("historyNarratives", () => {
  it("returns the same sentences for the same numbers", () => {
    const rows = [6, 9, 12, 15, 18, 21].map((hour, index) =>
      row(2, hour, { airHumidity: [78, 70, 55, 42, 62, 74][index] }),
    );
    expect(historyNarratives("humidity", rows, { grain: "30m", compareDays: false })).toEqual(
      historyNarratives("humidity", rows, { grain: "30m", compareDays: false }),
    );
  });

  it("says the humidity fell at midday and rose again, without calling it dry", () => {
    const text = air([6, 9, 12, 15, 18, 21].map((hour, index) =>
      row(2, hour, { airHumidity: [78, 70, 55, 42, 62, 74][index] }),
    ));
    const low = formatMetric(42, 0);
    const high = formatMetric(78, 0);

    expect(text).toBe(
      `Օդի խոնավությունը կեսօրին իջավ մինչև ${low}%, հետո նորից բարձրացավ։ Միջակայքը ${low}–${high}% էր։`,
    );
    expect(text).not.toContain("չոր օդ");
  });

  it("keeps a small swing as a range and does not invent a direction", () => {
    const text = air([8, 12, 16, 20].map((hour, index) =>
      row(2, hour, { airHumidity: [60, 62, 61, 63][index] }),
    ));
    const low = formatMetric(60, 0);
    const high = formatMetric(63, 0);

    expect(text).toBe(`Օդի խոնավությունը գրեթե չփոխվեց։ Մնաց ${low}–${high}% միջակայքում։`);
    expect(text).not.toMatch(/իջավ|բարձրացավ/);
  });

  it("treats a rise of one flat step as a rise and the step below it as flat", () => {
    const flat = air([row(2, 8, { airHumidity: 50 }), row(2, 18, { airHumidity: 57 })]);
    const rose = air([row(2, 8, { airHumidity: 50 }), row(2, 18, { airHumidity: 58 })]);

    expect(flat).not.toContain("բարձրացավ");
    expect(rose).toContain("բարձրացավ");
  });

  it("calls 24.9% dry air and does not round it into the normal band", () => {
    const text = air([
      row(2, 8, { airHumidity: 80 }),
      row(2, 18, { airHumidity: 24.9 }),
    ]);
    const shown = formatMetric(24.9, 1);

    expect(text).toContain(`մինչև ${shown}%`);
    expect(text).toContain(`Նվազագույնը չոր օդ է (${shown}%)։`);
    expect(text).not.toContain("25%");
  });

  it("states only the span when the curve has no single direction", () => {
    const text = air([6, 10, 14, 18].map((hour, index) =>
      row(2, hour, { airHumidity: [15, 40, 0, 20][index] }),
    ));

    expect(text).toContain("միջակայքում էր");
    expect(text).not.toMatch(/իջավ|բարձրացավ|հասավ/);
    expect(text).toContain("չոր օդ");
  });

  it("does not claim the day's low came after a crest when the low was earlier", () => {
    const text = air([
      row(2, 6, { airHumidity: 0 }),
      row(2, 12, { airHumidity: 40 }),
      row(2, 18, { airHumidity: 5 }),
    ]);

    expect(text).toContain("կեսօրին հասավ");
    expect(text).toContain("հետո իջավ");
    expect(text).not.toContain("իջավ մինչև");
  });

  it("drops time-of-day words when each point is a whole day", () => {
    const text = air(
      [2, 3, 4, 5, 6].map((day, index) =>
        row(day, 12, { airHumidity: [78, 70, 42, 62, 74][index] }),
      ),
      "1d",
    );

    const mixed = air(
      [2, 3, 4, 5].map((day, index) => row(day, 12, { airHumidity: [15, 40, 0, 20][index] })),
      "1d",
    );

    expect(text).toContain("նախ իջավ");
    expect(text).not.toMatch(/գիշեր|առավոտ|կեսօր|երեկո/);
    expect(mixed).toContain("այս օրերի ընթացքում");
    expect(mixed).not.toMatch(/գիշեր|առավոտ|կեսօր|երեկո/);
  });

  it("uses the night form that matches the following word", () => {
    const fell = paragraphs("temperature", [
      row(2, 15, { airTemp: 16 }),
      row(2, 23, { airTemp: 2 }),
    ])[0];
    const rose = paragraphs("temperature", [
      row(2, 2, { airTemp: 2 }),
      row(2, 14, { airTemp: 16 }),
    ])[0];

    expect(fell).toContain("գիշերն իջավ");
    expect(fell).not.toContain("գիշերը իջավ");
    expect(rose).toContain("գիշերը");
    expect(rose).not.toContain("գիշերն");
  });

  it("names frost and heat only when the samples cross those thresholds", () => {
    const crossed = paragraphs("temperature", [
      row(2, 5, { airTemp: -1.2 }),
      row(2, 15, { airTemp: 36.2 }),
    ])[0];
    const inside = paragraphs("temperature", [
      row(2, 5, { airTemp: 4 }),
      row(2, 15, { airTemp: 22 }),
    ])[0];

    expect(crossed).toContain("ցրտահարություն");
    expect(crossed).toContain("շոգ");
    expect(inside).not.toContain("ցրտահարություն");
    expect(inside).not.toContain("շոգ");
  });

  it("says the whole stretch is hot when every sample is hot", () => {
    const text = paragraphs("temperature", [
      row(2, 12, { airTemp: 36 }),
      row(2, 14, { airTemp: 37 }),
      row(2, 16, { airTemp: 36.4 }),
    ])[0];

    expect(text).toContain("գրեթե չփոխվեց");
    expect(text).toContain("Ամբողջ հատվածը շոգ է");
  });

  it("reports a light peak without retelling sunrise and sunset", () => {
    const lines = paragraphs(
      "light",
      [6, 9, 12, 15, 18].map((hour, index) =>
        row(2, hour, {
          lightLux: [0, 2000, 40000, 2000, 0][index],
          uvIndex: [0, 2, 4, 2, 0][index],
        }),
      ),
    );
    const peak = formatMetric(40000, 0);

    expect(lines[0]).toBe(`Լուսավորության գագաթնակետը կեսօրին էր՝ ${peak} lux։`);
    expect(lines[0]).not.toMatch(/իջավ|բարձրացավ/);
    expect(lines[1]).not.toContain("բարձր UV");
  });

  it("marks UV only from 8 upward", () => {
    const high = paragraphs("light", [
      row(2, 8, { uvIndex: 2, lightLux: 1000 }),
      row(2, 12, { uvIndex: 8.5, lightLux: 40000 }),
    ])[1];
    const under = paragraphs("light", [
      row(2, 8, { uvIndex: 2, lightLux: 1000 }),
      row(2, 12, { uvIndex: 7.9, lightLux: 40000 }),
    ])[1];

    expect(high).toContain("բարձր UV");
    expect(under).not.toContain("բարձր UV");
  });

  it("sums rain and keeps a strong shower for a peak of at least 3 mm", () => {
    const calm = paragraphs("wind", [
      row(2, 8, { rainfallMm: 1.2 }),
      row(2, 14, { rainfallMm: 0.4 }),
    ]);
    const heavy = paragraphs("wind", [row(2, 14, { rainfallMm: 4.2 })])[1];
    const lightRain = paragraphs("wind", [row(2, 14, { rainfallMm: 2.5 })])[1];
    const none = paragraphs("wind", [row(2, 14)])[1];
    const byDay = paragraphs("wind", [row(2, 12, { rainfallMm: 4.2 })], { grain: "1d" })[1];
    const total = formatMetric(1.2 + 0.4, 2);
    const peak = formatMetric(1.2, 2);

    expect(calm[1]).toBe(
      `Տեղումների գումարը ${total} մմ է։ Ամենաշատը մեկ միջակայքում ${peak} մմ էր։`,
    );
    expect(heavy).toContain("ուժեղ անձրև");
    expect(lightRain).not.toContain("ուժեղ անձրև");
    expect(none).toBe("Տեղում չի եղել։");
    expect(byDay).toContain("մեկ օրում");
    expect(byDay).not.toContain("միջակայքում");
  });

  it("calls 10 m/s a strong wind and leaves 9.9 unnamed", () => {
    const strong = paragraphs(
      "wind",
      [8, 12, 18].map((hour, index) => row(2, hour, { windSpeed: [2, 10, 3][index] })),
    )[0];
    const under = paragraphs(
      "wind",
      [8, 12, 18].map((hour, index) => row(2, hour, { windSpeed: [2, 9.9, 3][index] })),
    )[0];

    expect(strong).toContain("ուժեղ քամի");
    expect(under).not.toContain("ուժեղ քամի");
  });

  it("reads each compared day from its own samples", () => {
    const readings = historyNarratives(
      "humidity",
      [
        row(2, 8, { airHumidity: 50 }),
        row(2, 16, { airHumidity: 52 }),
        row(3, 8, { airHumidity: 80 }),
        row(3, 15, { airHumidity: 18 }),
      ],
      { grain: "2h", compareDays: true },
    );

    expect(readings.map((reading) => reading.label)).toEqual(["2 նոյ", "3 նոյ"]);
    expect(readings[0]?.color).toBe(DAY_LINE_COLORS[0]);
    expect(readings[1]?.color).toBe(DAY_LINE_COLORS[1]);
    expect(readings[0]?.paragraphs[0]).not.toContain("չոր օդ");
    expect(readings[0]?.paragraphs[0]).not.toContain("18");
    expect(readings[1]?.paragraphs[0]).toContain("չոր օդ");
    expect(readings[1]?.paragraphs[0]).toContain(formatMetric(18, 0));
  });

  it("returns nothing for an unknown chart or an empty series", () => {
    expect(historyNarratives("pressure", [row(2, 8)], { grain: "30m", compareDays: false })).toEqual([]);
    expect(historyNarratives("humidity", [], { grain: "30m", compareDays: false })).toEqual([]);
  });
});
