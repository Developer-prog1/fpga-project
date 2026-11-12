import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { EmptyState } from "@/components/empty-state";
import { HistoryCompare } from "@/components/history-compare";
import { HistoryFilter } from "@/components/history-filter";
import { SectionHeading } from "@/components/section-heading";
import { TrendCharts } from "@/components/trend-charts";
import { api } from "@/lib/api";
import {
  historyPreviousLabel,
  historyRangeLabel,
  historySectionNote,
  historySectionTitle,
  historyTickLabel,
  inclusiveDays,
  isDayKey,
  isHistorySpan,
  parseHistorySpan,
} from "@/lib/history";
import type { HistoryResponse } from "@/lib/types";

export const metadata: Metadata = { title: "Պատմություն" };

type HistoryPageProps = {
  searchParams: Promise<{
    span?: string | string[];
    from?: string | string[];
    to?: string | string[];
  }>;
};

function one(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

export default async function HistoryPage({ searchParams }: HistoryPageProps) {
  const query = await searchParams;
  const rawSpan = one(query.span);
  const rawFrom = one(query.from);
  const rawTo = one(query.to);

  let request = "";
  if (rawFrom || rawTo) {
    if (!isDayKey(rawFrom) || !isDayKey(rawTo)) redirect("/history?span=7d");
    if (rawFrom > rawTo) redirect(`/history?from=${rawTo}&to=${rawFrom}`);
    request = `/readings/history?from=${rawFrom}&to=${rawTo}`;
  } else {
    if (rawSpan && !isHistorySpan(rawSpan)) redirect("/history?span=7d");
    request = `/readings/history?span=${parseHistorySpan(rawSpan)}`;
  }

  const history = await api<HistoryResponse>(request);
  if (!history) {
    return (
      <div className="mx-auto w-full max-w-6xl px-5 py-8 sm:px-8 lg:px-10">
        <EmptyState />
      </div>
    );
  }

  const days = inclusiveDays(history.dayFrom, history.dayTo);

  return (
    <div className="py-8 lg:py-10">
      <div className="space-y-12 px-6 sm:px-8 lg:px-12">
        <header className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <p className="kicker text-gold">Դաշտային արխիվ</p>
            <h1 className="mt-3 font-serif text-4xl tracking-tight sm:text-5xl">Պատմություն</h1>
            <div className="gold-rule mt-4 w-24" />
            <p className="mt-4 max-w-xl text-lg leading-relaxed text-ink-soft">
              {historyRangeLabel(history.from, history.to)}. Թիվը փոփոխությունն է նախորդ նույն
              երկարության համեմատ։
            </p>
          </div>
          <HistoryFilter
            span={history.span}
            dayFrom={history.dayFrom}
            dayTo={history.dayTo}
            archiveFrom={history.archiveFrom}
            archiveTo={history.archiveTo}
          />
        </header>

        <HistoryCompare
          history={history}
          previousLabel={historyPreviousLabel(history.span, history.dayFrom, history.dayTo)}
        />

        <section>
          <SectionHeading
            title={historySectionTitle(history.span, history.dayFrom, history.dayTo)}
            note={historySectionNote(history.grain)}
          />
          {history.points.length === 0 ? (
            <p className="text-ink-soft">Այս հատվածում չափում չկա։</p>
          ) : (
            <TrendCharts
              rows={history.points}
              labelFor={(iso) => historyTickLabel(iso, history.grain, days)}
              shadeNight={history.shadeNight}
            />
          )}
        </section>
      </div>
    </div>
  );
}
