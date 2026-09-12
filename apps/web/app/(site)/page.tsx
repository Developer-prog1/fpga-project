import Link from "next/link";
import { api } from "@/lib/api";
import type { Overview } from "@/lib/types";
import { facultyTheme } from "@/lib/faculty-meta";
import { EmptyState } from "@/components/empty-state";
import { IconArrow } from "@/components/mark";

export default async function Home() {
  const overview = await api<Overview>("/overview");

  return (
    <div className="mx-auto w-full max-w-6xl px-5 py-10 sm:px-8 lg:px-10 lg:py-12">
      {!overview ? (
        <EmptyState />
      ) : (
        <>
          <div className="mb-12 flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-2xl">
              <p className="text-[11px] uppercase tracking-[0.32em] text-gold">
                Athenaeum
              </p>
              <h1 className="mt-4 font-serif text-5xl leading-[1.05] tracking-tight sm:text-6xl">
                Համալսարան
                <span className="mt-2 block text-[0.72em] text-garnet">
                  Լույս և գիտելիք
                </span>
              </h1>
              <p className="mt-5 max-w-xl text-lg leading-relaxed text-ink-soft">
                Այստեղ երևում են ադմինի ավելացրած ֆակուլտետներն ու դասընթացները՝
                նույն պահին, երբ դրանք հայտնվում են վահանակում։
              </p>
            </div>
            <div className="panel relative overflow-hidden rounded-[28px] px-6 py-6 lg:w-72">
              <p className="text-[11px] uppercase tracking-[0.28em] text-gold">Այժմ</p>
              <p className="mt-3 font-serif text-2xl leading-snug">
                {overview.stats.faculties} ֆակուլտետ
              </p>
              <p className="mt-2 text-ink-soft">
                {overview.stats.courses} դասընթաց կատալոգում
              </p>
            </div>
          </div>

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
            {overview.faculties.length === 0 ? (
              <p className="panel rounded-[24px] px-6 py-8 text-ink-soft">
                Ֆակուլտետներ դեռ չկան։ Ադմինը կարող է ավելացնել դրանք վահանակից։
              </p>
            ) : (
              <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                {overview.faculties.map((faculty) => {
                  const theme = facultyTheme(faculty.slug);
                  return (
                    <Link
                      key={faculty.id}
                      href={`/faculties/${faculty.slug}`}
                      className="panel panel-lift group relative overflow-hidden rounded-[28px] p-6"
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
                      {faculty.description ? (
                        <p className="mt-2 text-sm leading-relaxed text-ink-soft">
                          {faculty.description}
                        </p>
                      ) : null}
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
            )}
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
            {overview.courses.length === 0 ? (
              <p className="panel rounded-[24px] px-6 py-8 text-ink-soft">
                Դասընթացներ դեռ չկան։ Ադմինը կարող է ավելացնել դրանք վահանակից։
              </p>
            ) : (
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
                        </Link>
                      </li>
                    );
                  })}
                </ul>
              </div>
            )}
          </section>
        </>
      )}
    </div>
  );
}
