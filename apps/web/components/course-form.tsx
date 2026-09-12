"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { apiMutate } from "@/lib/api";
import type { Course, Faculty } from "@/lib/types";

export function CourseForm({
  faculties,
}: {
  faculties: Array<Pick<Faculty, "name" | "slug">>;
}) {
  const router = useRouter();
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);

  async function onSubmit(formData: FormData) {
    setError("");
    setPending(true);
    const result = await apiMutate<Course>("/courses", {
      code: String(formData.get("code") ?? ""),
      title: String(formData.get("title") ?? ""),
      credits: Number(formData.get("credits") ?? 3),
      facultySlug: String(formData.get("facultySlug") ?? ""),
      description: String(formData.get("description") ?? "") || undefined,
    });
    setPending(false);

    if (!result.ok) {
      setError(result.error);
      return;
    }

    (document.getElementById("course-form") as HTMLFormElement | null)?.reset();
    router.refresh();
  }

  if (faculties.length === 0) {
    return (
      <div className="panel rounded-[28px] p-6 text-ink-soft">
        Նախ ավելացրեք ֆակուլտետ, հետո դասընթաց։
      </div>
    );
  }

  return (
    <form
      id="course-form"
      className="panel rounded-[28px] p-6"
      action={onSubmit}
    >
      <p className="text-[11px] uppercase tracking-[0.28em] text-gold">Ավելացնել</p>
      <h2 className="mt-2 font-serif text-2xl">Նոր դասընթաց</h2>
      <p className="mt-2 text-sm text-ink-soft">
        Պահելուց հետո այն կերևա գլխավոր էջում և կատալոգում։
      </p>

      <div className="mt-5 grid gap-4 sm:grid-cols-2">
        <label className="field">
          <span>Կոդ</span>
          <input name="code" required placeholder="PH101" />
        </label>
        <label className="field">
          <span>Կրեդիտ</span>
          <input name="credits" type="number" min={1} max={12} defaultValue={3} required />
        </label>
        <label className="field sm:col-span-2">
          <span>Անվանում</span>
          <input name="title" required placeholder="Հայ գրականության ներածություն" />
        </label>
        <label className="field sm:col-span-2">
          <span>Ֆակուլտետ</span>
          <select name="facultySlug" required defaultValue={faculties[0]?.slug}>
            {faculties.map((faculty) => (
              <option key={faculty.slug} value={faculty.slug}>
                {faculty.name}
              </option>
            ))}
          </select>
        </label>
        <label className="field sm:col-span-2">
          <span>Նկարագրություն</span>
          <textarea name="description" rows={3} placeholder="Կարճ նկարագրություն" />
        </label>
      </div>

      {error ? <p className="mt-4 text-sm text-garnet">{error}</p> : null}

      <button className="btn-primary mt-5" disabled={pending} type="submit">
        {pending ? "Պահվում է…" : "Ավելացնել դասընթաց"}
      </button>
    </form>
  );
}
