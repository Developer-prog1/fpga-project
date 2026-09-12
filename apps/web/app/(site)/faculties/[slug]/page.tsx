import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { api } from "@/lib/api";
import type { Faculty } from "@/lib/types";
import { facultyTheme } from "@/lib/faculty-meta";

type Props = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const faculty = await api<Faculty>(`/faculties/${slug}`);
  return { title: faculty?.name ?? "Ֆակուլտետ" };
}

export default async function FacultyDetailPage({ params }: Props) {
  const { slug } = await params;
  const faculty = await api<Faculty>(`/faculties/${slug}`);

  if (!faculty) notFound();

  const theme = facultyTheme(faculty.slug);
  const courses = faculty.courses ?? [];

  return (
    <div className="mx-auto w-full max-w-6xl px-5 py-10 sm:px-8 lg:px-10 lg:py-12">
      <Link
        href="/faculties"
        className="text-sm text-ink-soft transition hover:text-garnet"
      >
        ← Բոլոր ֆակուլտետները
      </Link>

      <section
        className="panel relative mt-6 overflow-hidden rounded-[32px] p-8 sm:p-10"
        style={{
          background: `linear-gradient(165deg, ${theme.wash}, rgba(255,250,242,0.92))`,
        }}
      >
        <p className="text-[11px] uppercase tracking-[0.3em]" style={{ color: theme.accent }}>
          {theme.latin} · {theme.index}
        </p>
        <h1 className="mt-4 max-w-3xl font-serif text-4xl leading-[1.1] tracking-tight sm:text-6xl">
          {faculty.name}
        </h1>
        {faculty.description ? (
          <p className="mt-5 max-w-2xl text-lg text-ink-soft">{faculty.description}</p>
        ) : null}
        <p className="mt-8 text-sm" style={{ color: theme.accent }}>
          {courses.length} դասընթաց այս ֆակուլտետում
        </p>
      </section>

      <section className="mt-10">
        <h2 className="font-serif text-3xl tracking-tight">Դասընթացներ</h2>
        {courses.length === 0 ? (
          <p className="mt-6 text-ink-soft">Այս ֆակուլտետում դեռ դասընթաց չկա։</p>
        ) : (
          <div className="mt-6 grid gap-4 md:grid-cols-2">
            {courses.map((course) => (
              <article key={course.id} className="panel rounded-[24px] p-6">
                <div className="flex items-center justify-between gap-3">
                  <span
                    className="rounded-full px-2.5 py-1 font-mono text-xs"
                    style={{ color: theme.accent, background: theme.wash }}
                  >
                    {course.code}
                  </span>
                  <span className="text-sm text-ink-soft">{course.credits} կրեդիտ</span>
                </div>
                <h3 className="mt-4 font-serif text-2xl leading-snug">{course.title}</h3>
                {course.description ? (
                  <p className="mt-2 text-ink-soft">{course.description}</p>
                ) : null}
              </article>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
