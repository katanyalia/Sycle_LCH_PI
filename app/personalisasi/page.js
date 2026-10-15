import { ClipboardList } from "lucide-react";
import { PageShell, SupportPanel } from "@/components/layout/PageShell";
import { PlannedFeature } from "@/components/feedback/PlannedFeature";
import { Button } from "@/components/ui/button";

export const metadata = { title: "Personalisasi" };

// WF-02 screen 13 — Pengantar Personalisasi (Guest & Member, tanpa login).
export default function PersonalisasiPage() {
  return (
    <PageShell
      eyebrow="Beranda · Personalisasi"
      title="Dapatkan panduan berdasarkan rencana aktivitasmu."
      panel={
        <SupportPanel title="Privasi jawaban">
          <p>Jawaban personalisasi tidak otomatis disimpan sebagai riwayat.</p>
        </SupportPanel>
      }
    >
      <ul className="list-disc space-y-1 pl-5">
        <li>Bukan diagnosis atau pemeriksaan kesehatan.</li>
        <li>Jawaban tidak otomatis disimpan.</li>
        <li>Kamu boleh melewati kondisi tertentu.</li>
      </ul>
      <Button disabled>
        <ClipboardList aria-hidden="true" />
        Mulai
      </Button>
      <PlannedFeature stage={4} screens="13–26">
        Pertanyaan P-00 sampai P-03 beserta percabangannya belum aktif.
      </PlannedFeature>
    </PageShell>
  );
}
