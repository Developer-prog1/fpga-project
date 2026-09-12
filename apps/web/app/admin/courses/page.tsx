import type { Metadata } from "next";
import { api } from "@/lib/api";
import type { Course, Faculty } from "@/lib/types";
import { facultyTheme } from "@/lib/faculty-meta";
import { EmptyState } from "@/components/empty-state";
import { PageIntro } from "@/components/page-intro";
import { CourseForm } from "@/components/course-form";

export const metadata: Metadata = {
  title: "Դասընթացներ · Ադմին",
};

export default async function AdminCoursesPage() {
  const [courses, faculties] = await Promise.all([
    api<Course[]>("/courses"),
    api<Faculty[]>("/faculties"),
  ]);

  return (
    <div className="mx-auto w-full max-w-6xl px-5 py-10 sm:px-8 lg:px-10 lg:py-12">
      <PageIntro
        eyebrow="Ադմին"
        title="Դասընթացներ"
        description="Ավելացրեք դասընթաց, և այն կերևա գլխավոր էջում ու կատալոգում։"
      />

      <div className="mb-10">
        <CourseForm
          faculties={(faculties ?? []).map(({ name, slug }) => ({ name, slug }))}
        />
      </div>

      {!courses ? (
        <EmptyState />
      ) : (
        <div className="panel overflow-hidden rounded-[28px]">
          {courses.length === 0 ? (
            <p className="px-6 py-8 text-ink-soft">Դեռ դասընթաց չկա։</p>
          ) : (
            <ul>
              {courses.map((course) => {
                const theme = facultyTheme(course.faculty.slug);
                return (
                  <li
                    key={course.id}
                    className="flex flex-col gap-2 border-b border-ink/6 px-5 py-4 last:border-0 sm:flex-row sm:items-center sm:justify-between"
                  >
                    <div className="flex min-w-0 items-start gap-4">
                      <span
                        className="rounded-full px-2.5 py-1 font-mono text-xs"
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
                    <span className="text-sm text-ink-soft">{course.credits} կրեդիտ</span>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}
