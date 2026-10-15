"use client";

import { useEffect, useState } from "react";

// Waktu "sekarang" yang diperbarui berkala, untuk label kesegaran data ("5 menit lalu").
export function useNow(intervalMs = 60000) {
  const [now, setNow] = useState(() => new Date());
  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), intervalMs);
    return () => clearInterval(timer);
  }, [intervalMs]);
  return now;
}
