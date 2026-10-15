"use client";

import Link from "next/link";
import { MapPin } from "lucide-react";
import { useEnvironment } from "@/context/EnvironmentContext";

// Area "Lokasi" di header (wireframe: Lokasi | Akun).
export function LocationStatus() {
  const { location } = useEnvironment();
  const label = location?.shortLabel ?? "Lokasi belum dipilih";

  return (
    <Link
      href="/"
      className="flex h-10 min-w-0 items-center gap-1.5 rounded-lg px-2 text-muted-foreground hover:bg-secondary"
      aria-label={`Lokasi: ${label}. Buka Beranda`}
    >
      <MapPin className="size-4 shrink-0" aria-hidden="true" />
      <span className="max-w-[11rem] truncate sm:max-w-[16rem]">{label}</span>
    </Link>
  );
}
