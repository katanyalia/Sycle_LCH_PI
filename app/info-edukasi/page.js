import Link from "next/link";
import { BookA, ShieldCheck } from "lucide-react";
import { PageShell, SupportPanel } from "@/components/layout/PageShell";
import { ArticleCatalog } from "@/components/education/ArticleCatalog";
import { EDUCATION_CATEGORIES } from "@/content/categories";
import { getVisibleArticles } from "@/lib/content";

export const metadata = { title: "Info & Edukasi" };

// WF-08 screen 62 — katalog. Konten publik tanpa login.
export default function InfoEdukasiPage() {
  const articles = getVisibleArticles();
  return (
    <PageShell
      eyebrow="Info & Edukasi"
      title="Pelajari lingkungan dan langkah perlindungan."
      panel={
        <SupportPanel title="Tentang konten SYCLE">
          <p>Setiap artikel mencantumkan referensi dan batasan informasinya.</p>
          <p>Konten yang belum selesai ditinjau diberi label &quot;Konten draf — belum ditinjau&quot;.</p>
          <p>SYCLE tidak memberikan diagnosis.</p>
        </SupportPanel>
      }
    >
      <div className="flex flex-wrap gap-4">
        <Link href="/info-edukasi/glosarium" className="inline-flex min-h-10 items-center gap-2 font-semibold text-primary-pressed hover:underline">
          <BookA className="size-4" aria-hidden="true" />
          Glosarium
        </Link>
        <Link href="/panduan-umum" className="inline-flex min-h-10 items-center gap-2 font-semibold text-primary-pressed hover:underline">
          <ShieldCheck className="size-4" aria-hidden="true" />
          Panduan perlindungan umum
        </Link>
      </div>
      <ArticleCatalog articles={articles} categories={EDUCATION_CATEGORIES} />
    </PageShell>
  );
}
