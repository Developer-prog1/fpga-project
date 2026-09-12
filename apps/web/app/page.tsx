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

export default async function Home() {
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
          <div className="rise mb-10 flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <p className="text-[11px] uppercase tracking-[0.32em] text-gold">
                {greeting()} · {today}
              </p>
              <h1 className="mt-4 max-w-xl font-serif text-[2.6rem] leading-[1.08] tracking-tight sm:text-6xl">
                Համալսարանի
                <span className="block text-garnet">վարչական վահանակ</span>
              </h1>
              <p className="mt-5 max-w-lg text-lg leading-relaxed text-ink-soft">
                Ֆակուլտետներ, դասընթացներ և ադմիններ մեկ խմբագրված տարածքում՝
                ինչպես ատելյե, ոչ թե աղյուսակ։
              </p>
            </div>

            <div className="panel relative overflow-hidden rounded-[28px] px-6 py-6 lg:w-72">
              <div
                className="pointer-events-none absolute -right-8 -top-8 size-28 rounded-full"
                style={{
                  background:
                    "radial-gradient(circle, rgba(196,163,90,0.35), transparent 68%)",
                }}
              />
              <p className="text-[11px] uppercase tracking-[0.28em] text-gold">
                Դևիզ
              </p>
              <p className="mt-3 font-serif text-2xl leading-snug">
                «Լույս և գիտելիք»
              </p>
              <p className="mt-3 text-sm text-ink-soft">
                {overview.stats.faculties} ֆակուլտետ · {overview.stats.courses}{" "}
                դասընթաց · {overview.stats.admins} ադմին
              </p>
            </div>
          </div>

          <section className="rise-seq mb-12 grid gap-4 sm:grid-cols-3">
            {[
              {
                label: "Ադմիններ",
                value: overview.stats.admins,
                hint: "Միայն ADMIN դեր",
                href: "/admins",
              },
              {
                label: "Ֆակուլտետներ",
                value: overview.stats.faculties,
                hint: "Ակադեմիական կառույց",
                href: "/faculties",
              },
              {
                label: "Դասընթացներ",
                value: overview.stats.courses,
                hint: "Ընթացիկ ծրագիր",
                href: "/courses",
              },
            ].map((stat) => (
              <Link
                key={stat.label}
                href={stat.href}
                className="panel group rounded-[24px] px-5 py-5 transition duration-300 hover:-translate-y-1"
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

          <section className="mb-12">
            <div className="mb-5 flex items-end justify-between gap-4">
              <div>
                <p className="text-[11px] uppercase tracking-[0.28em] text-gold">
                  Կառուցվածք
                </p>
                <h2 className="mt-2 font-serif text-3xl tracking-tight">Ֆակուլտետներ</h2>
              </div>
              <Link
                href="/faculties"
                className="text-sm text-ink-soft transition hover:text-garnet"
              >
                Տեսնել բոլորը
              </Link>
            </div>
            <div className="rise-seq grid gap-4 lg:grid-cols-3">
              {overview.faculties.map((faculty) => {
                const theme = facultyTheme(faculty.slug);
                return (
                  <Link
                    key={faculty.id}
                    href={`/faculties/${faculty.slug}`}
                    className="panel group relative overflow-hidden rounded-[28px] p-6 transition duration-300 hover:-translate-y-1"
                  >
                    <div
                      className="pointer-events-none absolute -right-10 -top-10 size-36 rounded-full blur-2xl"
                      style={{ background: theme.wash }}
                    />
                    <div className="flex items-start justify-between">
                      <span
                        className="grid size-12 place-items-center rounded-2xl font-serif text-lg"
                        style={{ color: theme.accent, background: theme.wash }}
                      >
                        {theme.mark}
                      </span>
                      <span className="font-mono text-xs text-ink-soft">
                        {theme.index}
                      </span>
                    </div>
                    <h3 className="mt-6 font-serif text-2xl leading-snug">
                      {faculty.name}
                    </h3>
                    <p className="mt-2 text-sm leading-relaxed text-ink-soft">
                      {faculty.description}
                    </p>
                    <div className="mt-6 flex items-center justify-between text-sm">
                      <span style={{ color: theme.accent }}>
                        {faculty._count?.courses ?? 0} դասընթաց
                      </span>
                      <span className="text-gold transition-transform group-hover:translate-x-1">
                        <IconArrow />
                      </span>
                    </div>
                  </Link>
                );
              })}
            </div>
          </section>

          <section>
            <div className="mb-5 flex items-end justify-between gap-4">
              <div>
                <p className="text-[11px] uppercase tracking-[0.28em] text-gold">
                  Ծրագիր
                </p>
                <h2 className="mt-2 font-serif text-3xl tracking-tight">Դասընթացներ</h2>
              </div>
              <Link
                href="/courses"
                className="text-sm text-ink-soft transition hover:text-garnet"
              >
                Ամբողջ կատալոգ
              </Link>
            </div>
            <div className="panel overflow-hidden rounded-[28px]">
              <ul>
                {overview.courses.map((course) => {
                  const theme = facultyTheme(course.faculty.slug);
                  return (
                    <li
                      key={course.id}
                      className="table-row border-b border-ink/6 last:border-0"
                    >
                      <Link
                        href={`/faculties/${course.faculty.slug}`}
                        className="flex flex-col gap-2 px-5 py-4 sm:flex-row sm:items-center sm:justify-between"
                      >
                        <div className="flex min-w-0 items-start gap-4">
                          <span
                            className="mt-0.5 shrink-0 rounded-full px-2.5 py-1 font-mono text-xs"
                            style={{ color: theme.accent, background: theme.wash }}
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
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </div>
          </section>
        </>
      )}
    </div>
  );
}
