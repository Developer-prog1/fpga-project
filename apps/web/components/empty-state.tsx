import { Crest } from "@/components/mark";
import { getI18n } from "@/lib/i18n/server";

export async function EmptyState() {
  const { t } = await getI18n();
  return (
    <div className="panel mx-auto max-w-xl rounded-[28px] px-8 py-12 text-center">
      <div className="mx-auto w-fit text-gold">
        <Crest className="size-14" />
      </div>
      <h2 className="mt-6 font-serif text-3xl tracking-tight">{t.empty.title}</h2>
      <div className="gold-rule mx-auto mt-4 w-16" />
      <p className="mt-3 text-ink-soft">{t.empty.body}</p>
      <div className="mt-6 flex flex-wrap justify-center gap-2">
        <code className="rounded-full bg-ink/5 px-3 py-1 text-sm">pnpm run dev</code>
        <code className="rounded-full bg-ink/5 px-3 py-1 text-sm">pnpm db:seed</code>
      </div>
    </div>
  );
}
