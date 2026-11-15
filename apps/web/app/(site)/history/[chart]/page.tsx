import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { BackLink } from "@/components/back-link";
import { EmptyState } from "@/components/empty-state";
import { HistoryNarrative } from "@/components/history-narrative";
import { TrendChartDetail, trendChartById } from "@/components/trend-charts";
import { api } from "@/lib/api";
import { historyNarratives } from "@/lib/day-reading";
import {
  grainMeanLabel,
  historyRangeLabel,
  historySectionNote,
  historyTickLabel,
  inclusiveDays,
  isDayKey,
} from "@/lib/history";
import type { HistoryResponse } from "@/lib/types";

type HistoryChartPageProps = {
  params: Promise<{ chart: string }>;
  searchParams: Promise<{
    from?: string | string[];
    to?: string | string[];
  }>;
};

function one(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

export async function generateMetadata({ params }: HistoryChartPageProps): Promise<Metadata> {
  const { chart } = await params;
  const item = trendChartById(chart);
  return { title: item ? `${item.title} · Պատմություն` : "Պատմություն" };
}

export default async function HistoryChartPage({ params, searchParams }: HistoryChartPageProps) {
  const { chart: chartId } = await params;
  const chart = trendChartById(chartId);
  if (!chart) notFound();

  const query = await searchParams;
  const rawFrom = one(query.from);
  const rawTo = one(query.to);
  if (!isDayKey(rawFrom) || !isDayKey(rawTo)) redirect("/history");
  if (rawFrom > rawTo) redirect(`/history/${chart.id}?from=${rawTo}&to=${rawFrom}`);

  const history = await api<HistoryResponse>(`/readings/history?from=${rawFrom}&to=${rawTo}`);
  if (!history) {
    return (
      <div className="mx-auto w-full max-w-6xl px-5 py-8 sm:px-8 lg:px-10">
        <EmptyState />
      </div>
    );
  }

  const days = inclusiveDays(history.dayFrom, history.dayTo);
  const compareDays = days > 1 && history.grain !== "1d";
  const backHref = `/history?from=${history.dayFrom}&to=${history.dayTo}`;

  return (
    <div className="px-6 py-8 sm:px-8 lg:px-12 lg:py-10">
      <BackLink href={backHref} label="Պատմություն" />
      <p className="kicker mt-8 text-gold">{historyRangeLabel(history.from, history.to)}</p>
      <h1 className="mt-3 font-serif text-4xl tracking-tight sm:text-5xl">{chart.title}</h1>
      <p className="mt-4 max-w-2xl text-lg leading-relaxed text-ink-soft">
        {compareDays
          ? `${chart.compareNote}. Կետերը ${grainMeanLabel(history.grain)} են. ժամերը համընկնում են, որ ամեն օրվա գիծը առանձին երևա։`
          : historySectionNote(history.grain)}
      </p>
      <div className="gold-rule mt-4 w-24" />
      {history.points.length === 0 ? (
        <p className="mt-8 text-ink-soft">Այս հատվածում չափում չկա։</p>
      ) : (
        <div className="panel mt-8 rounded-[32px] p-5 sm:p-8">
          <TrendChartDetail
            chart={chart}
            rows={history.points}
            labelFor={(iso) => historyTickLabel(iso, history.grain, days)}
            shadeNight={history.shadeNight}
            compareDays={compareDays}
          />
          <HistoryNarrative
            title={
              compareDays ? "Օրերի վիճակը" : days > 1 ? "Ընտրված օրերի վիճակը" : "Օրվա վիճակը"
            }
            readings={historyNarratives(chart.id, history.points, {
              grain: history.grain,
              compareDays,
            })}
          />
        </div>
      )}
    </div>
  );
}
