export default function Loading() {
  return (
    <div className="py-8 lg:py-10">
      <div className="px-3 sm:px-4">
        <div className="panel h-80 animate-pulse rounded-[32px]" />
      </div>
      <div className="mt-12 px-3 sm:px-4">
        <div className="grid gap-4 sm:grid-cols-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="panel h-36 animate-pulse rounded-[24px]" />
          ))}
        </div>
      </div>
    </div>
  );
}
