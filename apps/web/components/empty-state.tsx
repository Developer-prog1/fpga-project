import { Crest } from "@/components/mark";

export function EmptyState() {
  return (
    <div className="panel mx-auto max-w-xl rounded-[28px] px-8 py-12 text-center">
      <div className="mx-auto w-fit text-gold">
        <Crest className="size-14" />
      </div>
      <h2 className="mt-6 font-serif text-3xl tracking-tight">Կապը բացակայում է</h2>
      <p className="mt-3 text-ink-soft">
        Ակնարկի տվյալները հասանելի չեն։ Գործարկեք համակարգը և լցրեք ցուցադրական
        տվյալները։
      </p>
      <div className="mt-6 flex flex-wrap justify-center gap-2">
        <code className="rounded-full bg-ink/5 px-3 py-1 text-sm">pnpm run dev</code>
        <code className="rounded-full bg-ink/5 px-3 py-1 text-sm">pnpm db:seed</code>
      </div>
    </div>
  );
}
