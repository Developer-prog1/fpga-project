import { describe, expect, it } from "vitest";
import { localizeHref, stripLocalePath, urlLocale } from "./locale";

describe("locale paths", () => {
  it("puts the language in the path", () => {
    expect(urlLocale("am")).toBe("hy");
    expect(localizeHref("am", "/")).toBe("/hy");
    expect(localizeHref("en", "/history")).toBe("/en/history");
    expect(localizeHref("ru", "/air/temperature")).toBe("/ru/air/temperature");
    expect(localizeHref("en", "/history?from=2026-11-01&to=2026-11-02")).toBe(
      "/en/history?from=2026-11-01&to=2026-11-02",
    );
  });

  it("keeps a single prefix", () => {
    expect(localizeHref("en", "/en/air/temperature")).toBe("/en/air/temperature");
    expect(localizeHref("am", "/hy/history")).toBe("/hy/history");
    expect(stripLocalePath("/hy/history")).toBe("/history");
    expect(stripLocalePath("/en")).toBe("/");
    expect(stripLocalePath("/am/history")).toBe("/history");
  });
});
