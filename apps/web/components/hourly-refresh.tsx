"use client";

import { useEffect } from "react";

/** Reload once the hour's readings have been written, so an open page stays current. */
export function HourlyRefresh() {
  useEffect(() => {
    const now = new Date();
    const next = new Date(now);
    next.setMinutes(0, 0, 0);
    next.setHours(next.getHours() + 1);
    const timer = window.setTimeout(() => window.location.reload(), next.getTime() - now.getTime() + 8000);
    return () => window.clearTimeout(timer);
  }, []);

  return null;
}
