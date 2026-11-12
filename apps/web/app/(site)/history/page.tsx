import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { EmptyState } from "@/components/empty-state";
import { HistoryCompare } from "@/components/history-compare";
import { SectionHeading } from "@/components/section-heading";
import { TrendCharts } from "@/components/trend-charts";
import { api } from "@/lib/api";
import {
  HISTORY_SPANS,
  historyRangeLabel,
  historySpanMeta,
  historyTickLabel,
  isHistorySpan,
  parseHistorySpan,
} from "@/lib/history";
import type { HistoryResponse, HistorySpan } from "@/lib/types";

export const metadata: Metadata = { title: "Պատմություն" };

type HistoryPageProps = {
  searchParams: Promise<{ span?: string | string[] }>;
};

function HistorySpanNav({ span }: { span: HistorySpan }) {
  return (
    <nav aria-label="Ժամանակահատված" className="flex flex-wrap gap-2">
      {HISTORY_SPANS.map((item) => {
        const active = item.id === span;
        return (
          <Link
            key={item.id}
            href={`/history?span=${item.id}`}
            className={active ? "chip chip-active" : "chip"}
            aria-current={active ? "page" : undefined}
          >
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}

export default async function HistoryPage({ searchParams }: HistoryPageProps) {
  const query = await searchParams;
  const raw = Array.isArray(query.span) ? query.span[0] : query.span;
  if (raw && !isHistorySpan(raw)) redirect("/history?span=7d");

  const span = parseHistorySpan(raw);
  const history = await api<HistoryResponse>(`/readings/history?span=${span}`);
  if (!history) {
    return (
      <div className="mx-auto w-full max-w-6xl px-5 py-8 sm:px-8 lg:px-10">
        <EmptyState />
      </div>
    );
  }

  const meta = historySpanMeta(history.span);

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
          <HistorySpanNav span={history.span} />
        </header>

        <HistoryCompare history={history} previousLabel={meta.previous} />

        <section>
          <SectionHeading title={meta.title} note={meta.note} />
          {history.points.length === 0 ? (
            <p className="text-ink-soft">Այս հատվածում չափում չկա։</p>
          ) : (
            <TrendCharts
              rows={history.points}
              labelFor={(iso) => historyTickLabel(iso, history.span)}
              shadeNight={history.shadeNight}
            />
          )}
        </section>
      </div>
    </div>
  );
}
