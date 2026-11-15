import { BackLink } from "@/components/back-link";
import { ChartLegend, TimeChart, type ChartSeries } from "@/components/charts";
import { getI18n } from "@/lib/i18n/server";

export type DetailStat = { label: string; value: string };

type MetricDetailProps = {
  label: string;
  about: string;
  reading: string;
  value: string;
  unit: string;
  when: string;
  extra?: string;
  watch: string | null;
  stats: DetailStat[];
  series: ChartSeries[];
  labels: string[];
  times: string[];
  unitLabel: string;
  chartNote?: string;
};

function DetailIntro({
  reading,
  value,
  unit,
  when,
  extra,
  watch,
  stats,
}: Omit<MetricDetailProps, "series" | "labels" | "times" | "unitLabel" | "label" | "about" | "chartNote">) {
  return (
      <section className="panel mt-8 rounded-[32px] p-6 sm:p-8">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-[11px] uppercase tracking-[0.2em] text-ink-soft">Հիմա · {when}</p>
            <p className="stat-number mt-3 font-serif text-6xl leading-none sm:text-7xl">
              {value}
              {unit ? (
                <span className="ml-2 align-middle font-sans text-xl font-medium tracking-normal text-ink-soft">
                  {unit}
                </span>
              ) : null}
            </p>
            {extra ? <p className="mt-3 text-ink-soft">{extra}</p> : null}
          </div>
          <span
            className={`rounded-full px-3 py-1 text-[11px] font-medium uppercase tracking-[0.14em] ${
              watch ? "bg-garnet/10 text-garnet" : "bg-forest/10 text-forest"
            }`}
          >
            {watch ?? "նորմա"}
          </span>
        </div>
            {watch ?? t.normal}
          </span>
        </div>
        <p className="mt-6 max-w-3xl text-sm leading-relaxed text-ink-soft">{reading}</p>
        <dl className="mt-6 grid gap-3 sm:grid-cols-3">
          {stats.map((stat) => (
            <div key={stat.label} className="rounded-2xl bg-ink/4 px-4 py-3">
              <dt className="text-[11px] uppercase tracking-[0.14em] text-ink-soft">{stat.label}</dt>
              <dd className="stat-number mt-1 font-serif text-2xl">{stat.value}</dd>
            </div>
          ))}
        </dl>
      </section>
  );
}

async function DetailChart({
  unitLabel,
  chartNote,
}: Pick<MetricDetailProps, "series" | "labels" | "times" | "unitLabel" | "chartNote">) {
  return (
    <section className="panel mt-4 rounded-[32px] p-6 sm:p-8">
      <h2 className="font-serif text-2xl tracking-tight">24 ժամվա ընթացք</h2>
  const { locale, t } = await getI18n();
  return (
    <section className="panel mt-4 rounded-[32px] p-6 sm:p-8">
      <h2 className="font-serif text-2xl tracking-tight">{t.detail.chart}</h2>
      {chartNote ? <p className="mt-2 max-w-2xl text-sm text-ink-soft">{chartNote}</p> : null}
      <div className="gold-rule mt-3 w-16" />
      <ChartLegend series={series} locale={locale} />
    </section>
  );
}

export function MetricDetail(props: MetricDetailProps) {
  return (
    <div className="px-6 py-8 sm:px-8 lg:px-12 lg:py-10">
export async function MetricDetail(props: MetricDetailProps) {
  const { t } = await getI18n();
  return (
    <div className="px-6 py-8 sm:px-8 lg:px-12 lg:py-10">
      <BackLink />
      <p className="kicker mt-8 text-gold">{t.detail.atmosphere}</p>
      <DetailIntro {...props} />
      <DetailChart
        series={props.series}
        labels={props.labels}
        times={props.times}
        unitLabel={props.unitLabel}
        chartNote={props.chartNote}
      />
    </div>
  );
}
