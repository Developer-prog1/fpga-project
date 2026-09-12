"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { apiMutate } from "@/lib/api";
import type { Faculty } from "@/lib/types";

export function FacultyForm() {
  const router = useRouter();
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);

  async function onSubmit(formData: FormData) {
    setError("");
    setPending(true);
    const result = await apiMutate<Faculty>("/faculties", {
      name: String(formData.get("name") ?? ""),
      slug: String(formData.get("slug") ?? ""),
      description: String(formData.get("description") ?? "") || undefined,
    });
    setPending(false);

    if (!result.ok) {
      setError(result.error);
      return;
    }

    (document.getElementById("faculty-form") as HTMLFormElement | null)?.reset();
    router.refresh();
  }

  return (
    <form
      id="faculty-form"
      className="panel rounded-[28px] p-6"
      action={onSubmit}
    >
      <p className="text-[11px] uppercase tracking-[0.28em] text-gold">Ավելացնել</p>
      <h2 className="mt-2 font-serif text-2xl">Նոր ֆակուլտետ</h2>
      <p className="mt-2 text-sm text-ink-soft">
        Պահելուց հետո այն կերևա գլխավոր էջում։
      </p>

      <div className="mt-5 grid gap-4 sm:grid-cols-2">
        <label className="field">
          <span>Անվանում</span>
          <input name="name" required placeholder="Օր. Բանասիրության ֆակուլտետ" />
        </label>
        <label className="field">
          <span>Slug (լատիներեն)</span>
          <input name="slug" required placeholder="philology" />
        </label>
        <label className="field sm:col-span-2">
          <span>Նկարագրություն</span>
          <textarea name="description" rows={3} placeholder="Կարճ նկարագրություն" />
        </label>
      </div>

      {error ? <p className="mt-4 text-sm text-garnet">{error}</p> : null}

      <button className="btn-primary mt-5" disabled={pending} type="submit">
        {pending ? "Պահվում է…" : "Ավելացնել ֆակուլտետ"}
      </button>
    </form>
  );
}
