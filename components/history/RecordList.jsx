import Link from "next/link";
import { CalendarDays, ChevronRight, MapPin } from "lucide-react";

// WF-06 screen 55 — kartu catatan: tanggal & waktu, konteks, wilayah (tanpa gejala/cerita, T7-5).
export function RecordList({ cards }) {
  return (
    <ul className="space-y-3" aria-label="Daftar catatan tersimpan">
      {cards.map((card) => (
        <li key={card.id}>
          <Link
            href={`/health-tracker/riwayat/${card.id}`}
            className="flex items-center gap-3 rounded-xl border bg-card p-4 transition-colors hover:bg-blush focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
          >
            <CalendarDays className="size-5 shrink-0 text-primary-pressed" aria-hidden="true" />
            <div className="min-w-0 flex-1 space-y-1">
              <p className="font-semibold">{card.timeText}</p>
              <p className="flex flex-wrap gap-x-3 gap-y-1 text-sm text-muted-foreground">
                <span>Konteks: {card.contextLabel}</span>
                <span className="inline-flex items-center gap-1">
                  <MapPin className="size-3.5" aria-hidden="true" />
                  {card.locationLabel ?? "Tanpa data lingkungan"}
                </span>
              </p>
            </div>
            <span className="flex shrink-0 items-center gap-1 text-sm font-semibold text-primary-pressed">
              Buka Detail
              <ChevronRight className="size-4" aria-hidden="true" />
            </span>
          </Link>
        </li>
      ))}
    </ul>
  );
}
