"use client";

import { useSyncExternalStore } from "react";
import { WifiOff } from "lucide-react";

// Status koneksi perangkat (navigator.onLine) yang ikut berubah saat koneksi putus/tersambung.
function subscribe(callback) {
  window.addEventListener("online", callback);
  window.addEventListener("offline", callback);
  return () => {
    window.removeEventListener("online", callback);
    window.removeEventListener("offline", callback);
  };
}

export function useOnlineStatus() {
  return useSyncExternalStore(
    subscribe,
    () => navigator.onLine,
    () => true // saat render di server dianggap online
  );
}

// Info kecil yang hanya muncul saat offline, diletakkan di fitur yang butuh internet
// (misalnya pencarian lokasi, Health Tracker, Healthcare). Saat online tidak menampilkan apa pun.
export default function OnlineOnlyNotice({
  feature = "Fitur ini",
  message = "butuh koneksi internet. Sambungkan internet untuk melanjutkan.",
  className = "",
}) {
  const online = useOnlineStatus();
  if (online) return null;

  return (
    <p
      role="status"
      className={`flex items-start gap-2 rounded-xl border border-[#F0D4DF] bg-[#F8E8EF] px-4 py-3 text-sm leading-6 text-[#8E3E5E] ${className}`}
    >
      <WifiOff className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
      <span>
        <strong>{feature}</strong> {message}
      </span>
    </p>
  );
}
