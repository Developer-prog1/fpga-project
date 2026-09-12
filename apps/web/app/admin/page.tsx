import Link from "next/link";
import { api } from "@/lib/api";
import type { Overview } from "@/lib/types";
import { facultyTheme } from "@/lib/faculty-meta";
import { EmptyState } from "@/components/empty-state";
import { IconArrow } from "@/components/mark";

function greeting() {
  const hour = new Date().getHours();
  if (hour < 12) return "Բարի լույս";
  if (hour < 18) return "Բարի օր";
  return "Բարի երեկո";
}

export default async function AdminHome() {
  const overview = await api<Overview>("/overview");
  const today = new Intl.DateTimeFormat("hy-AM", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(new Date());

  return (
    <div className="mx-auto w-full max-w-6xl px-5 py-10 sm:px-8 lg:px-10 lg:py-12">
      {!overview ? (
        <EmptyState />
      ) : (
        <>
          <div className="mb-10 flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <p className="text-[11px] uppercase tracking-[0.32em] text-gold">
                {greeting()} · {today}
              </p>
              <h1 className="mt-4 font-serif text-5xl leading-[1.05] tracking-tight sm:text-6xl">
                Համալսարան
                <span className="mt-2 block text-[0.72em] text-garnet">
                  վարչական վահանակ
                </span>
              </h1>
              <p className="mt-5 max-w-xl text-lg leading-relaxed text-ink-soft">
                Ավելացրեք ֆակուլտետ կամ դասընթաց — այն միանգամից կերևա գլխավոր
                էջում։
              </p>
            </div>
            <div className="panel rounded-[28px] px-6 py-6 lg:w-72">
              <p className="text-[11px] uppercase tracking-[0.28em] text-gold">Կայք</p>
              <p className="mt-3 font-serif text-2xl leading-snug">
                {overview.stats.faculties} ֆակուլտետ · {overview.stats.courses}{" "}
                դասընթաց
              </p>
              <Link
                href="/"
                className="mt-4 inline-flex items-center gap-2 text-sm text-garnet"
              >
                Բացել գլխավոր էջը <IconArrow />
              </Link>
            </div>
          </div>

          <section className="mb-12 grid gap-4 sm:grid-cols-3">
            {[
              {
                label: "Ադմիններ",
                value: overview.stats.admins,
                hint: "Միայն ADMIN դեր",
                href: "/admin/admins",
              },
              {
                label: "Ֆակուլտետներ",
                value: overview.stats.faculties,
                hint: "Ավելացնել նորը",
                href: "/admin/faculties",
              },
              {
                label: "Դասընթացներ",
                value: overview.stats.courses,
                hint: "Ավելացնել նորը",
                href: "/admin/courses",
              },
            ].map((stat) => (
              <Link
                key={stat.label}
                href={stat.href}
                className="panel panel-lift group rounded-[24px] px-5 py-5"
              >
                <p className="text-[11px] uppercase tracking-[0.22em] text-ink-soft">
                  {stat.label}
                </p>
                <p className="stat-number mt-3 font-serif text-5xl">{stat.value}</p>
                <div className="mt-4 flex items-center justify-between text-sm text-ink-soft">
                  <span>{stat.hint}</span>
                  <span className="text-gold transition-transform group-hover:translate-x-1">
                    <IconArrow />
                  </span>
                </div>
              </Link>
            ))}
          </section>

          <section>
            <div className="mb-5 flex items-end justify-between gap-4">
              <h2 className="font-serif text-3xl tracking-tight">Վերջին դասընթացներ</h2>
              <Link
                href="/admin/courses"
                className="text-sm text-ink-soft transition hover:text-garnet"
              >
                Կառավարել
              </Link>
            </div>
            <div className="panel overflow-hidden rounded-[28px]">
              {overview.courses.length === 0 ? (
                <p className="px-6 py-8 text-ink-soft">Դեռ դասընթաց չկա։</p>
              ) : (
                <ul>
                  {overview.courses.map((course) => {
                    const theme = facultyTheme(course.faculty.slug);
                    return (
                      <li
                        key={course.id}
                        className="table-row border-b border-ink/6 last:border-0"
                      >
                        <div className="flex flex-col gap-2 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
                          <div className="flex min-w-0 items-start gap-4">
                            <span
                              className="mt-0.5 shrink-0 rounded-full px-2.5 py-1 font-mono text-xs"
                              style={{
                                color: theme.accent,
                                background: theme.wash,
                              }}
                            >
                              {course.code}
                            </span>
                            <span>
                              <span className="block font-medium">{course.title}</span>
                              <span className="text-sm text-ink-soft">
                                {course.faculty.name}
                              </span>
                            </span>
                          </div>
                          <span className="text-sm tabular-nums text-ink-soft">
                            {course.credits} կրեդիտ
                          </span>
                        </div>
                      </li>
                    );
                  })}
                </ul>
              )}
            </div>
          </section>
        </>
      )}
    </div>
  );
}
