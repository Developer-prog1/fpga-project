import type { Metadata } from "next";
import Link from "next/link";
import { api } from "@/lib/api";
import type { Faculty } from "@/lib/types";
import { facultyTheme } from "@/lib/faculty-meta";
import { EmptyState } from "@/components/empty-state";
import { PageIntro } from "@/components/page-intro";
import { IconArrow } from "@/components/mark";

export const metadata: Metadata = {
  title: "Ֆակուլտետներ",
};

export default async function FacultiesPage() {
  const faculties = await api<Faculty[]>("/faculties");

  return (
    <div className="mx-auto w-full max-w-6xl px-5 py-10 sm:px-8 lg:px-10 lg:py-12">
      <PageIntro
        eyebrow="Ակադեմիա"
        title="Ֆակուլտետներ"
        description="Համալսարանի ակադեմիական կառույցը՝ այն ֆակուլտետները, որ ադմինը ավելացրել է վահանակում։"
      />

      {!faculties ? (
        <EmptyState />
      ) : faculties.length === 0 ? (
        <p className="panel rounded-[24px] px-6 py-8 text-ink-soft">
          Ֆակուլտետներ դեռ չկան։
        </p>
      ) : (
        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {faculties.map((faculty) => {
            const theme = facultyTheme(faculty.slug);
            return (
              <Link
                key={faculty.id}
                href={`/faculties/${faculty.slug}`}
                className="panel panel-lift group flex flex-col rounded-[32px] p-7"
              >
                <div className="flex items-center justify-between">
                  <span
                    className="grid size-14 place-items-center rounded-2xl font-serif text-2xl"
                    style={{ color: theme.accent, background: theme.wash }}
                  >
                    {theme.mark}
                  </span>
                  <span className="text-[11px] uppercase tracking-[0.22em] text-ink-soft">
                    {theme.latin}
                  </span>
                </div>
                <h2 className="mt-8 font-serif text-3xl leading-tight">{faculty.name}</h2>
                <p className="mt-3 flex-1 text-ink-soft">{faculty.description}</p>
                <div className="gold-rule my-6" />
                <div className="flex items-center justify-between">
                  <span className="text-sm" style={{ color: theme.accent }}>
                    {faculty._count?.courses ?? faculty.courses?.length ?? 0} դասընթաց
                  </span>
                  <span className="flex items-center gap-2 text-sm text-gold transition-transform group-hover:translate-x-1">
                    Բացել <IconArrow />
                  </span>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
