import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { PageShell, SupportPanel } from "@/components/layout/PageShell";
import { GlossaryList } from "@/components/education/GlossaryList";
import { Button } from "@/components/ui/button";
import { getGlossary } from "@/lib/content";

export const metadata = { title: "Glosarium" };

// WF-08 screen 64. Definisi dari Master Draft (LOCKED); istilah tambahan E-1 tampil sebagai draf berlabel.
export default function GlosariumPage() {
  return (
    <PageShell
      eyebrow="Info & Edukasi · Glosarium"
      title="Arti istilah yang digunakan SYCLE."
      description="Penjelasan sederhana untuk istilah lingkungan dan kesehatan yang muncul di aplikasi."
      panel={
        <SupportPanel title="Tentang glosarium">
          <p>Definisi istilah lingkungan mengikuti spesifikasi produk SYCLE V2.</p>
          <p>Istilah berlabel draf disusun dari sumber yang disebutkan dan belum ditinjau tim.</p>
          <p>ISPU dan US AQI adalah dua standar yang berbeda dan tidak disamakan.</p>
        </SupportPanel>
      }
    >
      <GlossaryList entries={getGlossary()} />
      <Button asChild variant="outline">
        <Link href="/info-edukasi">
          <ArrowLeft aria-hidden="true" />
          Kembali ke Info & Edukasi
        </Link>
      </Button>
    </PageShell>
  );
}
