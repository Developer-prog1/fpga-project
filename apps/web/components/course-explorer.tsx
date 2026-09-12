"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import type { Course, Faculty } from "@/lib/types";
import { facultyTheme } from "@/lib/faculty-meta";

export function CourseExplorer({
  courses,
  faculties,
}: {
  courses: Course[];
  faculties: Array<Pick<Faculty, "name" | "slug">>;
}) {
  const [filter, setFilter] = useState("all");

  const visible = useMemo(
    () =>
      filter === "all"
        ? courses
        : courses.filter((course) => course.faculty.slug === filter),
    [courses, filter],
  );

  return (
    <div>
      <div className="mb-6 flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => setFilter("all")}
          className={`chip ${filter === "all" ? "chip-active" : ""}`}
        >
          Բոլորը
        </button>
        {faculties.map((faculty) => (
          <button
            key={faculty.slug}
            type="button"
            onClick={() => setFilter(faculty.slug)}
            className={`chip ${filter === faculty.slug ? "chip-active" : ""}`}
          >
            {faculty.name}
          </button>
        ))}
      </div>

      <div className="panel overflow-hidden rounded-[28px]">
        <div className="hidden grid-cols-[7rem_1fr_1fr_5rem] gap-4 border-b border-ink/8 px-6 py-3 text-[11px] uppercase tracking-[0.2em] text-ink-soft sm:grid">
          <span>Կոդ</span>
          <span>Դասընթաց</span>
          <span>Ֆակուլտետ</span>
          <span className="text-right">Կրեդիտ</span>
        </div>
        {visible.length === 0 ? (
          <p className="px-6 py-10 text-center text-ink-soft">Դասընթացներ չկան։</p>
        ) : (
          <ul>
            {visible.map((course) => {
              const theme = facultyTheme(course.faculty.slug);
              return (
                <li key={course.id} className="table-row border-b border-ink/6 last:border-0">
                  <Link
                    href={`/faculties/${course.faculty.slug}`}
                    className="grid grid-cols-1 gap-2 px-6 py-4 sm:grid-cols-[7rem_1fr_1fr_5rem] sm:items-center sm:gap-4"
                  >
                    <span
                      className="w-fit rounded-full px-2.5 py-1 font-mono text-xs"
                      style={{
                        color: theme.accent,
                        background: theme.wash,
                      }}
                    >
                      {course.code}
                    </span>
                    <span>
                      <span className="block font-medium">{course.title}</span>
                      {course.description ? (
                        <span className="mt-1 block text-sm text-ink-soft">
                          {course.description}
                        </span>
                      ) : null}
                    </span>
                    <span className="text-sm text-ink-soft">{course.faculty.name}</span>
                    <span className="text-sm tabular-nums text-ink-soft sm:text-right">
                      {course.credits} cr
                    </span>
                  </Link>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </div>
  );
}
