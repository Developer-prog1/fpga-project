"use client";

import { useEffect, useId, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { isDayKey } from "@/lib/history";
import type { HistorySpan } from "@/lib/types";

const WEEKDAYS = ["Երկ", "Երք", "Չրք", "Հնգ", "Ուրբ", "Շբթ", "Կիր"];
const MONTHS = [
  "հունվար",
  "փետրվար",
  "մարտ",
  "ապրիլ",
  "մայիս",
  "հունիս",
  "հուլիս",
  "օգոստոս",
  "սեպտեմբեր",
  "հոկտեմբեր",
  "նոյեմբեր",
  "դեկտեմբեր",
];
const MONTHS_SHORT = ["հնվ", "փտր", "մրտ", "ապր", "մյս", "հնս", "հլս", "օգս", "սեպ", "հոկ", "նոյ", "դեկ"];

function parseKey(key: string) {
  const [year, month, day] = key.split("-").map(Number);
  return new Date(year, month - 1, day);
}

function dateKey(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function shortDay(key: string) {
  const date = parseKey(key);
  return `${date.getDate()} ${MONTHS_SHORT[date.getMonth()]}`;
}

function monthCells(year: number, month: number) {
  const first = new Date(year, month, 1);
  const offset = (first.getDay() + 6) % 7;
  const count = new Date(year, month + 1, 0).getDate();
  const cells: Array<Date | null> = Array.from({ length: offset }, () => null);
  for (let day = 1; day <= count; day += 1) cells.push(new Date(year, month, day));
  while (cells.length % 7 !== 0) cells.push(null);
  return cells;
}

export function HistoryFilter({
  span,
  dayFrom,
  dayTo,
  archiveFrom,
  archiveTo,
}: {
  span: HistorySpan | null;
  dayFrom: string;
  dayTo: string;
  archiveFrom: string | null;
  archiveTo: string | null;
}) {
  const router = useRouter();
  const dialogId = useId();
  const rootRef = useRef<HTMLDivElement>(null);
  const custom = span == null;
  const [open, setOpen] = useState(false);
  const [start, setStart] = useState<string | null>(custom ? dayFrom : null);
  const [end, setEnd] = useState<string | null>(custom && dayFrom !== dayTo ? dayTo : null);
  const initial = parseKey(custom ? dayTo : (archiveTo ?? dateKey(new Date())));
  const [cursor, setCursor] = useState({ year: initial.getFullYear(), month: initial.getMonth() });

  useEffect(() => {
    if (!open) return;
    function onPointer(event: MouseEvent) {
      if (!rootRef.current?.contains(event.target as Node)) setOpen(false);
    }
    function onKey(event: KeyboardEvent) {
      if (event.key === "Escape") setOpen(false);
    }
    document.addEventListener("mousedown", onPointer);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onPointer);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  function openCalendar() {
    setStart(custom ? dayFrom : null);
    setEnd(custom && dayFrom !== dayTo ? dayTo : null);
    const focus = parseKey(custom ? dayTo : (archiveTo ?? dateKey(new Date())));
    setCursor({ year: focus.getFullYear(), month: focus.getMonth() });
    setOpen(true);
  }

  function apply(fromKey: string, toKey: string) {
    const [from, to] = fromKey <= toKey ? [fromKey, toKey] : [toKey, fromKey];
    setOpen(false);
    router.push(`/history?from=${from}&to=${to}`);
  }

  function pick(key: string) {
    if (!start || end) {
      setStart(key);
      setEnd(null);
      return;
    }
    if (key === start) return;
    setEnd(key);
  }

  const lo = start && end ? (start < end ? start : end) : start;
  const hi = start && end ? (start < end ? end : start) : start;
  const monthLabel = `${MONTHS[cursor.month]} ${cursor.year}`;
  const archiveStart = archiveFrom ? parseKey(archiveFrom) : null;
  const archiveEnd = archiveTo ? parseKey(archiveTo) : null;
  const canPrev =
    archiveStart != null &&
    (cursor.year > archiveStart.getFullYear() ||
      (cursor.year === archiveStart.getFullYear() && cursor.month > archiveStart.getMonth()));
  const canNext =
    archiveEnd != null &&
    (cursor.year < archiveEnd.getFullYear() ||
      (cursor.year === archiveEnd.getFullYear() && cursor.month < archiveEnd.getMonth()));
  const buttonLabel = custom
    ? dayFrom === dayTo
      ? shortDay(dayFrom)
      : `${shortDay(dayFrom)} – ${shortDay(dayTo)}`
    : "Օրացույց";

  return (
    <div className="flex flex-wrap items-center gap-2">
      <div ref={rootRef} className="relative">
        <button
          type="button"
          className={custom ? "chip chip-active" : "chip"}
          aria-expanded={open}
          aria-controls={dialogId}
          onClick={() => (open ? setOpen(false) : openCalendar())}
        >
          {buttonLabel}
        </button>
        {open ? (
          <div
            id={dialogId}
            role="dialog"
            aria-label="Օրացույց"
            className="panel absolute left-0 z-30 mt-2 w-[20.5rem] max-w-[calc(100vw-3rem)] rounded-[24px] p-4 lg:left-auto lg:right-0"
          >
            <div className="flex items-center justify-between gap-3">
              <button
                type="button"
                className="grid size-8 place-items-center rounded-full text-lg text-ink-soft enabled:hover:bg-ink/5 disabled:opacity-30"
                aria-label="Նախորդ ամիս"
                disabled={!canPrev}
                onClick={() =>
                  setCursor((current) => {
                    const date = new Date(current.year, current.month - 1, 1);
                    return { year: date.getFullYear(), month: date.getMonth() };
                  })
                }
              >
                ‹
              </button>
              <p className="font-serif text-lg">{monthLabel}</p>
              <button
                type="button"
                className="grid size-8 place-items-center rounded-full text-lg text-ink-soft enabled:hover:bg-ink/5 disabled:opacity-30"
                aria-label="Հաջորդ ամիս"
                disabled={!canNext}
                onClick={() =>
                  setCursor((current) => {
                    const date = new Date(current.year, current.month + 1, 1);
                    return { year: date.getFullYear(), month: date.getMonth() };
                  })
                }
              >
                ›
              </button>
            </div>

            <div className="mt-3 grid grid-cols-7 gap-y-1 text-center text-[11px] text-ink-soft">
              {WEEKDAYS.map((day) => (
                <span key={day} className="py-1">
                  {day}
                </span>
              ))}
              {monthCells(cursor.year, cursor.month).map((date, index) => {
                if (!date) return <span key={`empty-${index}`} />;
                const key = dateKey(date);
                const enabled = Boolean(archiveFrom && archiveTo && key >= archiveFrom && key <= archiveTo);
                const endpoint = Boolean(lo && hi && (key === lo || key === hi));
                const inside = Boolean(lo && hi && key > lo && key < hi);
                return (
                  <button
                    key={key}
                    type="button"
                    disabled={!enabled}
                    aria-pressed={endpoint}
                    aria-label={`${date.getDate()} ${MONTHS[date.getMonth()]} ${date.getFullYear()}`}
                    className="relative h-9 disabled:cursor-default disabled:text-ink/25"
                    onClick={() => pick(key)}
                    onDoubleClick={() => apply(key, key)}
                  >
                    {inside || (endpoint && lo !== hi) ? (
                      <span
                        className={`absolute inset-y-1 bg-gold/25 ${key === lo ? "left-1/2" : "left-0"} ${key === hi ? "right-1/2" : "right-0"}`}
                      />
                    ) : null}
                    <span
                      className={`relative mx-auto flex size-8 items-center justify-center rounded-full ${
                        endpoint ? "bg-ink text-cream" : enabled ? "hover:bg-ink/5" : ""
                      }`}
                    >
                      {date.getDate()}
                    </span>
                  </button>
                );
              })}
            </div>

            <p className="mt-3 min-h-5 text-sm text-ink-soft">
              {start
                ? end
                  ? `${shortDay(lo!)} – ${shortDay(hi!)}`
                  : shortDay(start)
                : archiveFrom
                  ? "Սեղմիր օրը։ Երկրորդ օրը միջակայք է դարձնում։"
                  : "Արխիվում օր չկա։"}
            </p>
            <button
              type="button"
              className="btn-primary mt-3 w-full"
              disabled={!start || !isDayKey(start)}
              onClick={() => start && apply(start, end ?? start)}
            >
              Դիտել
            </button>
          </div>
        ) : null}
      </div>
    </div>
  );
}
