"use client";

import { useEffect, useState } from "react";

/**
 * Returns the current time string in a given IANA timezone, updating every minute.
 * Safe for SSR: returns "" until mounted on the client.
 */
export function useClock(tz = "Asia/Dhaka"): string {
  const [time, setTime] = useState("");

  useEffect(() => {
    const fmt = () =>
      new Date().toLocaleTimeString("en-US", {
        hour: "2-digit",
        minute: "2-digit",
        hour12: false,
        timeZone: tz,
      });

    setTime(fmt());
    const id = setInterval(() => setTime(fmt()), 60_000);
    return () => clearInterval(id);
  }, [tz]);

  return time;
}
