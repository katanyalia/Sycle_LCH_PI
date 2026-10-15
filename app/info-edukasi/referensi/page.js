import Link from "next/link";
import { ArrowLeft, Library } from "lucide-react";
import { PageShell, SupportPanel } from "@/components/layout/PageShell";
import { ReferenceCatalog } from "@/components/education/ReferenceCatalog";
import { Button } from "@/components/ui/button";
import { getReferenceCatalog } from "@/lib/content";

export const metadata = { title: "Referensi terkurasi" };

// Info & Edukasi — seluruh referensi terkurasi (Master Draft 1.4C "referensi"). Sumber INTERNAL tidak ditampilkan.
export default function ReferensiPage() {
  const references = getReferenceCatalog();
  return (
    <PageShell
      eyebrow="Info & Edukasi · Referensi"
      title="Referensi terkurasi"
      description="Sumber asli yang dikumpulkan tim SYCLE tentang lingkungan dan kesehatan perempuan. Setiap sumber dapat kamu buka dan baca langsung."
      panel={
        <SupportPanel title="Cara membaca daftar ini">
          <p>Referensi adalah bahan bacaan, bukan klaim kesehatan dari SYCLE.</p>
          <p>Semua referensi masih menunggu persetujuan rilis oleh tim, sehingga belum dipakai sebagai klaim final.</p>
          <p>&quot;Studi populasi&quot; menggambarkan kelompok besar orang dan tidak berlaku pasti untuk setiap individu.</p>
          <p>&quot;Perlu tinjauan klinis&quot; berarti sumber berisi pesan keselamatan yang belum ditinjau tenaga kesehatan.</p>
        </SupportPanel>
      }
    >
      <p className="flex items-center gap-2 text-sm font-semibold">
        <Library className="size-4 text-primary-pressed" aria-hidden="true" />
        {references.length} referensi dari WHO, CDC, NHS, BMKG, Kemenkes, dan jurnal ilmiah
      </p>
      <ReferenceCatalog references={references} />
      <Button asChild variant="outline">
        <Link href="/info-edukasi">
          <ArrowLeft aria-hidden="true" />
          Kembali ke Info & Edukasi
        </Link>
      </Button>
    </PageShell>
  );
}
