export default function Loading() {
  return (
    <div className="mx-auto w-full max-w-6xl px-5 py-10 sm:px-8 lg:px-10 lg:py-12">
      <div className="h-4 w-40 animate-pulse rounded-full bg-ink/8" />
      <div className="mt-5 h-14 w-80 max-w-full animate-pulse rounded-2xl bg-ink/8" />
      <div className="mt-8 grid gap-4 sm:grid-cols-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="panel h-36 animate-pulse rounded-[24px]" />
        ))}
      </div>
    </div>
  );
}
