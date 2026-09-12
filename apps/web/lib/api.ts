const API = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";

export async function api<T>(path: string): Promise<T | null> {
  try {
    const res = await fetch(`${API}${path}`, { cache: "no-store" });
    if (!res.ok) return null;
    return res.json() as Promise<T>;
  } catch {
    return null;
  }
}

export async function apiMutate<T>(
  path: string,
  body: unknown,
): Promise<{ ok: true; data: T } | { ok: false; error: string }> {
  try {
    const res = await fetch(`${API}${path}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    const json = (await res.json().catch(() => null)) as
      | { message?: string | string[] }
      | T
      | null;

    if (!res.ok) {
      const raw =
        json && typeof json === "object" && "message" in json
          ? json.message
          : null;
      const message = Array.isArray(raw)
        ? raw.join(", ")
        : raw || "Չհաջողվեց պահել";
      return { ok: false, error: message };
    }

    return { ok: true, data: json as T };
  } catch {
    return { ok: false, error: "API-ն անհասանելի է" };
  }
}
