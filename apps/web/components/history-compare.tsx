import { formatSigned } from "@/lib/history";
import type { Dictionary } from "@/lib/i18n/dictionary";
import type { Locale } from "@/lib/i18n/locale";
import { getI18n } from "@/lib/i18n/server";
import { formatMetric } from "@/lib/metrics";
import type { HistoryResponse, LevelCompare, SumCompare } from "@/lib/types";

type Card = {
  label: string;
  unit: string;
  digits: number;
  mode: "avg" | "sum";
  current: number | null;
  previous: number | null;
  delta: number | null;
  min?: number | null;
  max?: number | null;
};

function amount(value: number, digits: number, unit: string, locale: Locale) {
  const text = formatMetric(value, digits, locale);
  return unit ? `${text} ${unit}` : text;
}

function CompareCard({
  card,
  previousLabel,
  locale,
  copy,
}: {
  card: Card;
  previousLabel: string;
  locale: Locale;
  copy: Dictionary["history"];
}) {
  const word = card.mode === "sum" ? copy.sum : copy.avg;
  const hasDelta = card.delta != null && card.current != null && card.previous != null;
  const headline =
    hasDelta && card.delta != null
      ? formatSigned(card.delta, card.digits, locale)
      : card.current == null
        ? "—"
        : formatMetric(card.current, card.digits, locale);
  const currentText = card.current == null ? "" : amount(card.current, card.digits, card.unit, locale);
  const detail =
    card.current == null
      ? copy.noReading
      : card.previous == null
        ? copy.noPrevious(word, currentText, previousLabel)
        : copy.compared(
            word,
            currentText,
            previousLabel,
            amount(card.previous, card.digits, card.unit, locale),
          );
  const range =
    card.mode === "avg" && card.min != null && card.max != null
      ? copy.range(
          formatMetric(card.min, card.digits, locale),
          formatMetric(card.max, card.digits, locale),
          card.unit,
        )
      : null;

  return (
    <article className="panel rounded-[24px] px-5 py-5">
      <p className="kicker text-gold">{card.label}</p>
      <p className="stat-number mt-3 font-serif text-5xl leading-none">
        {headline}
        {headline !== "—" ? (
          <span className="ml-2 align-middle font-sans text-base font-medium tracking-normal text-ink-soft">
            {card.unit}
          </span>
        ) : null}
      </p>
      <p className="mt-3 text-sm leading-relaxed text-ink-soft">{detail}</p>
      {range ? <p className="mt-1 text-sm text-ink-soft">{range}</p> : null}
    </article>
  );
}

function fromLevel(label: string, unit: string, digits: number, stat: LevelCompare): Card {
  return {
    label,
    unit,
    digits,
    mode: "avg",
    current: stat.avg,
    previous: stat.previousAvg,
    delta: stat.delta,
    min: stat.min,
    max: stat.max,
  };
}

function fromSum(label: string, unit: string, digits: number, stat: SumCompare): Card {
  return {
    label,
    unit,
    digits,
    mode: "sum",
    current: stat.sum,
    previous: stat.previousSum,
    delta: stat.delta,
  };
}

export async function HistoryCompare({
  history,
  previousLabel,
}: {
  history: HistoryResponse;
  previousLabel: string;
}) {
  const { locale, t } = await getI18n();
  const cards = [
    fromLevel(t.history.cards.air, t.metrics.airTemp.unit, 1, history.airTemp),
    fromLevel(t.history.cards.soil, t.metrics.soilMoisture.unit, 1, history.soilMoisture),
    fromSum(t.history.cards.rain, t.metrics.rainfallMm.unit, 1, history.rainfallMm),
    fromLevel(t.history.cards.wind, t.metrics.windSpeed.unit, 1, history.windSpeed),
  ];

  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {cards.map((card) => (
        <CompareCard
          key={card.label}
          card={card}
          previousLabel={previousLabel}
          locale={locale}
          copy={t.history}
        />
      ))}
    </div>
  );
}
