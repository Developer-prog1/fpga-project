import type { Metadata } from "next";
import { api } from "@/lib/api";
import type { Course, Faculty } from "@/lib/types";
import { CourseExplorer } from "@/components/course-explorer";
import { EmptyState, PageIntro } from "@/components/empty-state";

export const metadata: Metadata = {
  title: "Դասընթացներ",
};

export default async function CoursesPage() {
  const [courses, faculties] = await Promise.all([
    api<Course[]>("/courses"),
    api<Faculty[]>("/faculties"),
  ]);

  return (
    <div className="mx-auto w-full max-w-6xl px-5 py-10 sm:px-8 lg:px-10 lg:py-12">
      <PageIntro
        eyebrow="Կատալոգ"
        title="Դասընթացներ"
        description="Ամբողջական ծրագիրը ըստ ֆակուլտետի՝ կոդերով, կրեդիտներով և նկարագրությամբ։"
      />

      {!courses || !faculties ? (
        <EmptyState />
      ) : (
        <CourseExplorer
          courses={courses}
          faculties={faculties.map(({ name, slug }) => ({ name, slug }))}
        />
      )}
    </div>
  );
}
