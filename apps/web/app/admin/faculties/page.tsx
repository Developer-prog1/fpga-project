import type { Metadata } from "next";
import Link from "next/link";
import { api } from "@/lib/api";
import type { Faculty } from "@/lib/types";
import { facultyTheme } from "@/lib/faculty-meta";
import { EmptyState } from "@/components/empty-state";
import { PageIntro } from "@/components/page-intro";
import { FacultyForm } from "@/components/faculty-form";

export const metadata: Metadata = {
  title: "Ֆակուլտետներ · Ադմին",
};

export default async function AdminFacultiesPage() {
  const faculties = await api<Faculty[]>("/faculties");

  return (
    <div className="mx-auto w-full max-w-6xl px-5 py-10 sm:px-8 lg:px-10 lg:py-12">
      <PageIntro
        eyebrow="Ադմին"
        title="Ֆակուլտետներ"
        description="Ավելացրեք ֆակուլտետ, և այն կերևա գլխավոր էջում։"
      />

      <div className="mb-10">
        <FacultyForm />
      </div>

      {!faculties ? (
        <EmptyState />
      ) : faculties.length === 0 ? (
        <p className="text-ink-soft">Դեռ ֆակուլտետ չկա։</p>
      ) : (
        <ul className="grid gap-4 md:grid-cols-2">
          {faculties.map((faculty) => {
            const theme = facultyTheme(faculty.slug);
            return (
              <li key={faculty.id} className="panel rounded-[24px] p-5">
                <p className="font-serif text-2xl">{faculty.name}</p>
                <p className="mt-1 text-sm text-ink-soft">{faculty.slug}</p>
                {faculty.description ? (
                  <p className="mt-2 text-sm text-ink-soft">{faculty.description}</p>
                ) : null}
                <div className="mt-4 flex items-center justify-between text-sm">
                  <span style={{ color: theme.accent }}>
                    {faculty._count?.courses ?? faculty.courses?.length ?? 0} դասընթաց
                  </span>
                  <Link href={`/faculties/${faculty.slug}`} className="text-gold">
                    Կայքում
                  </Link>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
