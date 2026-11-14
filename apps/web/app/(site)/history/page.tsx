import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { EmptyState } from "@/components/empty-state";
import { HistoryAwait } from "@/components/history-await";
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
  const rawFrom = one(query.from);
  const rawTo = one(query.to);
  const selected = isDayKey(rawFrom) && isDayKey(rawTo);

  if ((rawFrom || rawTo || query.span) && !selected) redirect("/history");
  if (selected && rawFrom > rawTo) redirect(`/history?from=${rawTo}&to=${rawFrom}`);

  const history = await api<HistoryResponse>(
    selected
      ? `/readings/history?from=${rawFrom}&to=${rawTo}`
      : "/readings/history?from=1970-01-01&to=1970-01-01",
  );
  if (!history) {
    return (
      <div className="mx-auto w-full max-w-6xl px-5 py-8 sm:px-8 lg:px-10">
        <EmptyState />
      </div>
    );
  }

  return (
    <div className={selected ? "py-8 lg:py-10" : "flex h-[calc(100dvh-9rem)] flex-col py-6"}>
      <div
        className={
          selected
            ? "space-y-12 px-6 sm:px-8 lg:px-12"
            : "flex min-h-0 flex-1 flex-col gap-6 px-6 sm:px-8 lg:px-12"
        }
      >
        <header>
          <p className="kicker text-gold">Դաշտային արխիվ</p>
          <h1 className="mt-3 font-serif text-4xl tracking-tight sm:text-5xl">Պատմություն</h1>
          <div className="gold-rule mt-4 w-24" />
          {selected ? (
            <p className="mt-4 max-w-xl text-lg leading-relaxed text-ink-soft">
              {historyRangeLabel(history.from, history.to)}. Թիվը փոփոխությունն է նախորդ նույն
              երկարության համեմատ։
            </p>
          ) : null}
        </header>

        <HistoryFilter
          dayFrom={selected ? history.dayFrom : null}
          dayTo={selected ? history.dayTo : null}
          archiveFrom={history.archiveFrom}
          archiveTo={history.archiveTo}
        />

        {selected ? <HistoryResults history={history} /> : <HistoryAwait />}
      </div>
    </div>
  );
}

function HistoryResults({ history }: { history: HistoryResponse }) {
  const days = inclusiveDays(history.dayFrom, history.dayTo);

  return (
    <>
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
    </>
  );
}
