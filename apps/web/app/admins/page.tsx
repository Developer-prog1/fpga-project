import type { Metadata } from "next";
import { api } from "@/lib/api";
import type { Admin } from "@/lib/types";
import { initials } from "@/lib/faculty-meta";
import { EmptyState, PageIntro } from "@/components/empty-state";

export const metadata: Metadata = {
  title: "Ադմիններ",
};

export default async function AdminsPage() {
  const admins = await api<Admin[]>("/users");

  return (
    <div className="mx-auto w-full max-w-6xl px-5 py-10 sm:px-8 lg:px-10 lg:py-12">
      <PageIntro
        eyebrow="Մուտք"
        title="Ադմիններ"
        description="Համակարգը հասանելի է միայն ադմիններին։ Այստեղ երևում են գործող հաշիվները։"
      />

      {!admins ? (
        <EmptyState />
      ) : (
        <div className="rise-seq grid gap-4 md:grid-cols-2">
          {admins.map((admin) => (
            <article key={admin.id} className="panel rounded-[28px] p-6">
              <div className="flex items-start gap-4">
                <div className="grid size-14 place-items-center rounded-full bg-garnet text-lg text-cream">
                  {initials(admin.name)}
                </div>
                <div className="min-w-0">
                  <h2 className="font-serif text-2xl">{admin.name}</h2>
                  <p className="mt-1 truncate text-ink-soft">{admin.email}</p>
                  <div className="mt-4 flex flex-wrap items-center gap-2">
                    <span className="chip">{admin.role}</span>
                    <span className="text-xs text-ink-soft">
                      {new Intl.DateTimeFormat("hy-AM", {
                        dateStyle: "medium",
                      }).format(new Date(admin.createdAt))}
                    </span>
                  </div>
                </div>
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
