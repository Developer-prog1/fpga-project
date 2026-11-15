import { formatSigned } from "@/lib/history";
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

function amount(value: number, digits: number, unit: string) {
  const text = formatMetric(value, digits);
  return unit ? `${text} ${unit}` : text;
}

function CompareCard({ card, previousLabel }: { card: Card; previousLabel: string }) {
  const word = card.mode === "sum" ? "գումար" : "միջին";
  const hasDelta = card.delta != null && card.current != null && card.previous != null;
  const headline =
    hasDelta && card.delta != null
      ? formatSigned(card.delta, card.digits)
      : card.current == null
        ? "—"
        : formatMetric(card.current, card.digits);
  const detail =
    card.current == null
      ? "չափում չկա"
      : card.previous == null
        ? `${word} ${amount(card.current, card.digits, card.unit)} · ${previousLabel} չկա`
        : `${word} ${amount(card.current, card.digits, card.unit)} · ${previousLabel} ${amount(card.previous, card.digits, card.unit)}`;
  const range =
    card.mode === "avg" && card.min != null && card.max != null
      ? `չափումների միջակայք ${formatMetric(card.min, card.digits)}–${formatMetric(card.max, card.digits)} ${card.unit}`
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

export function HistoryCompare({
  history,
  previousLabel,
}: {
  history: HistoryResponse;
  previousLabel: string;
}) {
  const cards = [
    fromLevel("Օդի ջերմաստիճան", "°C", 1, history.airTemp),
    fromLevel("Հողի խոնավություն", "%", 1, history.soilMoisture),
    fromSum("Տեղումներ", "մմ", 1, history.rainfallMm),
    fromLevel("Քամի", "m/s", 1, history.windSpeed),
  ];

  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {cards.map((card) => (
        <CompareCard key={card.label} card={card} previousLabel={previousLabel} />
      ))}
    </div>
  );
}
