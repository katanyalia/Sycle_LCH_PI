import Link from "next/link";
import { PageShell, SupportPanel } from "@/components/layout/PageShell";
import { AskSycle } from "@/components/ask/AskSycle";

export const metadata = { title: "Tanya SYCLE" };

// WF-07 screen 59–61. Tanya SYCLE tanpa AI (E-2): jawaban disusun dari topik Info & Edukasi, glosarium, dan
// referensi terkurasi. AI #4 menunggu K-04 & persetujuan evidence (Tahap 9).
export default function TanyaSyclePage() {
  return (
    <PageShell
      eyebrow="Beranda · Tanya SYCLE"
      title="Tanyakan hal umum tentang lingkungan dan kesehatan perempuan."
      panel={
        <SupportPanel title="Tentang Tanya SYCLE">
          <p>Tanya SYCLE bukan tenaga kesehatan dan tidak menilai kondisi pribadimu.</p>
          <p>Jawaban diambil dari topik, glosarium, dan referensi terkurasi SYCLE — bukan dibuat oleh AI.</p>
          <p>Tanya SYCLE tidak membaca catatan Health Tracker-mu, dan pertanyaanmu tidak disimpan.</p>
          <p>
            <Link href="/info-edukasi/referensi" className="font-semibold text-primary-pressed hover:underline">
              Lihat semua referensi
            </Link>
          </p>
        </SupportPanel>
      }
    >
      <AskSycle />
    </PageShell>
  );
}
