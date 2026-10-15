"use client";

import { useEffect } from "react";

// Tahap 8 (K-06): mendaftarkan public/sw.js hanya di build production agar mode development tidak terganggu cache.
export function ServiceWorkerRegister() {
  useEffect(() => {
    if (process.env.NODE_ENV !== "production" || !("serviceWorker" in navigator)) return;
    navigator.serviceWorker.register("/sw.js", { scope: "/" }).catch(() => {
      // Gagal mendaftar tidak menghalangi aplikasi; hanya fitur offline yang tidak aktif.
    });
  }, []);
  return null;
}
