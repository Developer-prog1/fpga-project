import { api } from "@/lib/api";
import type { Health } from "@/lib/types";
import { Sidebar } from "@/components/sidebar";

export async function AppFrame({ children }: { children: React.ReactNode }) {
  const health = await api<Health>("/health");
  const connected = health?.status === "ok";

  return (
    <div className="shell">
      <Sidebar connected={connected} database={health?.database} />
      <div className="canvas">{children}</div>
    </div>
  );
}
