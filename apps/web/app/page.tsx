type Overview = {
  stats: {
    admins: number;
    faculties: number;
    courses: number;
  };
  faculties: Array<{
    id: string;
    name: string;
    slug: string;
    description: string | null;
    _count: { courses: number };
  }>;
  courses: Array<{
    id: string;
    code: string;
    title: string;
    credits: number;
    faculty: { name: string; slug: string };
  }>;
};

async function getOverview(): Promise<Overview | null> {
  const baseUrl = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";

  try {
    const res = await fetch(`${baseUrl}/overview`, { cache: "no-store" });
    if (!res.ok) return null;
    return res.json();
  } catch {
    return null;
  }
}

async function getHealth() {
  const baseUrl = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";

  try {
    const res = await fetch(`${baseUrl}/health`, { cache: "no-store" });
    if (!res.ok) return null;
    return res.json();
  } catch {
    return null;
  }
}

export default async function Home() {
  const [overview, health] = await Promise.all([getOverview(), getHealth()]);
  const appName = process.env.NEXT_PUBLIC_APP_NAME ?? "Hamalsaran";
  const connected = health?.status === "ok";

  return (
    <div className="mx-auto w-full max-w-6xl px-6 py-12">
      <header className="mb-10 flex flex-col gap-3 border-b border-zinc-200 pb-8 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.25em] text-zinc-500">
            Admin panel
          </p>
          <h1 className="mt-2 text-4xl font-semibold tracking-tight">
            {appName}
          </h1>
          <p className="mt-2 max-w-xl text-zinc-600">
            Համալսարանի կառավարում — ֆակուլտետներ և դասընթացներ (միայն ADMIN)։
          </p>
        </div>
        <div
          className={`text-sm font-medium ${
            connected ? "text-emerald-700" : "text-red-700"
          }`}
        >
          API {connected ? "connected" : "offline"}
          {health?.database ? ` · DB ${health.database}` : ""}
        </div>
      </header>

      {!overview ? (
        <p className="text-zinc-600">
          Overview data unavailable. Start with{" "}
          <code className="rounded bg-zinc-200 px-1.5 py-0.5 text-sm">
            pnpm run dev
          </code>{" "}
          and seed with{" "}
          <code className="rounded bg-zinc-200 px-1.5 py-0.5 text-sm">
            pnpm db:seed
          </code>
          .
        </p>
      ) : (
        <>
          <section className="mb-10 grid grid-cols-3 gap-3">
            {[
              ["Admins", overview.stats.admins],
              ["Faculties", overview.stats.faculties],
              ["Courses", overview.stats.courses],
            ].map(([label, value]) => (
              <div
                key={String(label)}
                className="border border-zinc-200 bg-white px-4 py-3"
              >
                <p className="text-xs uppercase tracking-wide text-zinc-500">
                  {label}
                </p>
                <p className="mt-1 text-2xl font-semibold tabular-nums">
                  {value}
                </p>
              </div>
            ))}
          </section>

          <div className="grid gap-8 lg:grid-cols-2">
            <section>
              <h2 className="mb-4 text-lg font-semibold">Faculties</h2>
              <ul className="divide-y divide-zinc-200 border border-zinc-200 bg-white">
                {overview.faculties.map((faculty) => (
                  <li key={faculty.id} className="px-4 py-3">
                    <div className="flex items-baseline justify-between gap-3">
                      <p className="font-medium">{faculty.name}</p>
                      <span className="shrink-0 text-xs text-zinc-500">
                        {faculty._count.courses} courses
                      </span>
                    </div>
                    {faculty.description ? (
                      <p className="mt-1 text-sm text-zinc-600">
                        {faculty.description}
                      </p>
                    ) : null}
                  </li>
                ))}
              </ul>
            </section>

            <section>
              <h2 className="mb-4 text-lg font-semibold">Courses</h2>
              <ul className="divide-y divide-zinc-200 border border-zinc-200 bg-white">
                {overview.courses.map((course) => (
                  <li key={course.id} className="px-4 py-3">
                    <div className="flex items-baseline justify-between gap-3">
                      <p className="font-medium">
                        <span className="text-zinc-500">{course.code}</span>{" "}
                        {course.title}
                      </p>
                      <span className="shrink-0 text-xs text-zinc-500">
                        {course.credits} cr
                      </span>
                    </div>
                    <p className="mt-1 text-sm text-zinc-600">
                      {course.faculty.name}
                    </p>
                  </li>
                ))}
              </ul>
            </section>
          </div>
        </>
      )}
    </div>
  );
}
