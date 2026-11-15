import { MoistureGauge, Ribbon, WindRose } from "@/components/charts";
import { stationPlace } from "@/lib/i18n/messages";
import { intlLocale } from "@/lib/i18n/locale";
import { getI18n } from "@/lib/i18n/server";
import { formatMetric, windDegNorm, windDirFull, windDirLabel } from "@/lib/metrics";
import type { Overview, Reading } from "@/lib/types";

export async function HeroNow({
  overview,
  latest,
  airTemps,
  coverageLabel,
}: {
  overview: Overview;
  latest: Reading;
  airTemps: number[];
  coverageLabel?: string;
}) {
  const { locale, t } = await getI18n();
  const when = new Intl.DateTimeFormat(intlLocale(locale), {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(latest.recordedAt));

  return (
    <section className="panel overflow-hidden rounded-[32px] p-6 sm:p-8 lg:p-10">
      <div className="flex flex-col gap-5 md:flex-row md:items-start md:justify-between">
        <div>
          <p className="kicker text-gold">{stationPlace(overview.station?.location, t)}</p>
          <p className="mt-3 flex flex-wrap items-center gap-2 text-ink-soft">
            <span className="live-dot" />
            {t.hero.latest} · {when}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <span className="chip pointer-events-none">
            {t.hero.airRange(
              formatMetric(overview.summary?.airTemp.min ?? latest.airTemp, 1, locale),
              formatMetric(overview.summary?.airTemp.max ?? latest.airTemp, 1, locale),
            )}
          </span>
          <span className="chip pointer-events-none">
            {t.hero.rain(formatMetric(overview.summary?.rainfallMm.sum ?? 0, 1, locale))}
          </span>
        </div>
      </div>

      <div className="mt-8 grid gap-4 md:grid-cols-3 md:items-stretch">
        <div className="rounded-[24px] border border-gold/25 bg-gradient-to-br from-garnet/10 via-paper to-paper px-6 py-6">
          <p className="kicker text-garnet">{t.hero.nowAir}</p>
          <p className="stat-number mt-3 font-serif text-6xl leading-none sm:text-7xl">
            {formatMetric(latest.airTemp, 1, locale)}°
          </p>
          <p className="mt-4 text-ink-soft">
            {t.hero.humidity} {formatMetric(latest.airHumidity, 0, locale)}% · {t.hero.dewPoint}{" "}
            {formatMetric(latest.dewPoint, 1, locale)}°
          </p>
          <p className="mt-2 text-sm text-ink-soft">
            {t.hero.pressure} {formatMetric(latest.pressureHpa, 1, locale)} hPa
          </p>
          <div className="mt-5">
            <p className="mb-1 text-[11px] text-ink-soft">{t.hero.ribbon(coverageLabel)}</p>
            <Ribbon values={airTemps} color="#7a2433" />
          </div>
        </div>

        <div className="rounded-[24px] border border-gold/25 bg-paper/70 px-4 py-5 text-center">
          <p className="kicker text-gold">{t.hero.wind}</p>
          <WindRose deg={latest.windDirDeg} speed={latest.windSpeed} locale={locale} />
          <p className="text-sm text-ink-soft">
            {t.hero.comingFrom(
              windDirFull(latest.windDirDeg, locale),
              windDirLabel(latest.windDirDeg, locale),
              windDegNorm(latest.windDirDeg),
            )}
          </p>
        </div>

        <div className="rounded-[24px] border border-gold/25 bg-gradient-to-br from-forest/10 via-paper to-paper px-4 py-5 text-center">
          <p className="kicker text-forest">{t.hero.soil}</p>
          <MoistureGauge value={latest.soilMoisture} locale={locale} />
          <p className="stat-number font-serif text-4xl leading-none">
            {formatMetric(latest.soilMoisture, 1, locale)}
            <span className="ml-1 font-sans text-sm font-medium tracking-normal text-ink-soft">%</span>
          </p>
          <p className="mt-2 text-sm text-ink-soft">
            {t.hero.soilTemp(formatMetric(latest.soilTemp, 1, locale))}
          </p>
        </div>
      </div>
    </section>
  );
}
