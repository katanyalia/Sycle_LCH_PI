import Link from "next/link";
import { BookA } from "lucide-react";
import { PageShell } from "@/components/layout/PageShell";
import { PlannedFeature } from "@/components/feedback/PlannedFeature";

export const metadata = { title: "Info & Edukasi" };

// Kategori dari wireframe screen 62.
const CATEGORIES = ["Panas", "Kualitas udara", "UV", "Kesehatan perempuan"];

// WF-08 screen 62 — Katalog. Konten publik tanpa login.
export default function InfoEdukasiPage() {
  return (
    <PageShell eyebrow="Info & Edukasi" title="Pelajari lingkungan dan langkah perlindungan.">
      <ul className="flex flex-wrap gap-2" aria-label="Kategori">
        {CATEGORIES.map((category) => (
          <li key={category} className="rounded-full border bg-card px-3 py-1 text-sm">
            {category}
          </li>
        ))}
      </ul>
      <Link href="/info-edukasi/glosarium" className="inline-flex items-center gap-2 font-semibold text-primary-pressed hover:underline">
        <BookA className="size-4" aria-hidden="true" />
        Glosarium
      </Link>
      <PlannedFeature stage={3} screens="62–64">
        Artikel edukasi menunggu sumber yang sudah ditinjau, atau ditampilkan sebagai konten draf berlabel.
      </PlannedFeature>
    </PageShell>
  );
}
