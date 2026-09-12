import { MoistureGauge, Ribbon, WindRose } from "@/components/charts";
import { formatMetric, windDegNorm, windDirFull, windDirLabel } from "@/lib/metrics";
import type { Overview, Reading } from "@/lib/types";

export function HeroNow({
  overview,
  latest,
  airTemps,
}: {
  overview: Overview;
  latest: Reading;
  airTemps: number[];
}) {
  const when = new Intl.DateTimeFormat("hy-AM", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(latest.recordedAt));

  return (
    <section className="panel overflow-hidden rounded-[32px] p-6 sm:p-8">
      <div className="flex flex-col gap-5 md:flex-row md:items-start md:justify-between">
        <div>
          <p className="text-[11px] uppercase tracking-[0.32em] text-gold">{overview.station?.location}</p>
          <h1 className="mt-3 font-serif text-4xl leading-[1.08] tracking-tight sm:text-5xl">
            {overview.station?.name}
          </h1>
          <p className="mt-3 flex flex-wrap items-center gap-2 text-ink-soft">
            <span className="live-dot" />
            Վերջին չափում · {when}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <span className="chip pointer-events-none">
            օդ 24ժ {formatMetric(overview.summary?.airTemp.min ?? latest.airTemp, 1)}–
            {formatMetric(overview.summary?.airTemp.max ?? latest.airTemp, 1)} °C
          </span>
          <span className="chip pointer-events-none">
            տեղումներ {formatMetric(overview.summary?.rainfallMm.sum ?? 0, 1)} մմ
          </span>
        </div>
      </div>

      <div className="mt-8 grid gap-6 md:grid-cols-3 md:items-end">
        <div className="rounded-[24px] bg-gradient-to-br from-garnet/8 via-paper/40 to-transparent px-6 py-6">
          <p className="text-[11px] uppercase tracking-[0.2em] text-garnet">Հիմա · օդ</p>
          <p className="stat-number mt-3 font-serif text-6xl leading-none sm:text-7xl">
            {formatMetric(latest.airTemp, 1)}°
          </p>
          <p className="mt-4 text-ink-soft">
            խոնավություն {formatMetric(latest.airHumidity, 0)}% · ցողի կետ {formatMetric(latest.dewPoint, 1)}°
          </p>
          <p className="mt-2 text-sm text-ink-soft">
            ճնշում {formatMetric(latest.pressureHpa, 1)} hPa
          </p>
          <div className="mt-5">
            <p className="mb-1 text-[11px] text-ink-soft">օդի ջերմաստիճան · վերջին 24 ժամ</p>
            <Ribbon values={airTemps} color="#7a2433" />
          </div>
        </div>

        <div className="text-center">
          <p className="text-[11px] uppercase tracking-[0.2em] text-ink-soft">Քամի</p>
          <WindRose deg={latest.windDirDeg} speed={latest.windSpeed} />
          <p className="text-sm text-ink-soft">
            գալիս է {windDirFull(latest.windDirDeg)} · {windDirLabel(latest.windDirDeg)} {windDegNorm(latest.windDirDeg)}°
          </p>
        </div>

        <div className="text-center">
          <p className="text-[11px] uppercase tracking-[0.2em] text-forest">Հող</p>
          <MoistureGauge value={latest.soilMoisture} />
          <p className="text-sm text-ink-soft">ջերմաստիճան {formatMetric(latest.soilTemp, 1)} °C</p>
        </div>
      </div>
    </section>
  );
}
