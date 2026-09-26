import Link from "next/link";
import { ChartLegend, TimeChart, type ChartSeries } from "@/components/charts";

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
};

function DetailIntro({
  reading,
  value,
  unit,
  when,
  extra,
  watch,
  stats,
}: Omit<MetricDetailProps, "series" | "labels" | "times" | "unitLabel" | "label" | "about">) {
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

function DetailChart({
  series,
  labels,
  times,
  unitLabel,
}: Pick<MetricDetailProps, "series" | "labels" | "times" | "unitLabel">) {
  return (
    <section className="panel mt-4 rounded-[32px] p-6 sm:p-8">
      <h2 className="font-serif text-2xl">24 ժամվա ընթացք</h2>
      <ChartLegend series={series} />
      <div className="mt-4">
        <TimeChart labels={labels} times={times} series={series} unitLeft={unitLabel} />
      </div>
    </section>
  );
}

export function MetricDetail(props: MetricDetailProps) {
  return (
    <div className="px-6 py-8 sm:px-8 lg:px-12 lg:py-10">
      <Link href="/" className="text-sm text-ink-soft transition hover:text-ink">
        ← Գլխավոր
      </Link>
      <p className="mt-6 text-[11px] uppercase tracking-[0.28em] text-gold">Մթնոլորտ</p>
      <h1 className="mt-3 font-serif text-4xl tracking-tight sm:text-5xl">{props.label}</h1>
      <p className="mt-4 max-w-3xl text-lg leading-relaxed text-ink-soft">{props.about}</p>
      <DetailIntro {...props} />
      <DetailChart
        series={props.series}
        labels={props.labels}
        times={props.times}
        unitLabel={props.unitLabel}
      />
    </div>
  );
}
