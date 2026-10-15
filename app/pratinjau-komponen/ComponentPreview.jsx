"use client";

import { useState } from "react";
import { PageShell, SupportPanel } from "@/components/layout/PageShell";
import { SingleChoice } from "@/components/forms/SingleChoice";
import { MultiChoice } from "@/components/forms/MultiChoice";
import { DisruptionScale } from "@/components/forms/DisruptionScale";
import { StatusMessage } from "@/components/feedback/StatusMessage";
import { ConfirmDialog } from "@/components/feedback/ConfirmDialog";
import { DraftContent } from "@/components/content/DraftContent";
import { Button } from "@/components/ui/button";

// Contoh memakai teks pertanyaan asli Master Draft (P-01, P-03) hanya untuk menguji komponen.
const P01_OPTIONS = [
  { value: "di_rumah", label: "Di rumah" },
  { value: "dalam_ruangan", label: "Bekerja atau belajar di dalam ruangan" },
  { value: "bepergian", label: "Bepergian" },
  { value: "luar_ruangan", label: "Aktivitas luar ruangan" },
];

const P03_OPTIONS = [
  { value: "air_minum", label: "Air minum" },
  { value: "tempat_teduh", label: "Tempat teduh atau ruang sejuk" },
  { value: "masker", label: "Masker yang sesuai" },
  { value: "perlindungan_matahari", label: "Perlindungan matahari" },
  { value: "tidak_ada", label: "Tidak ada", exclusive: true },
  { value: "belum_tahu", label: "Belum tahu", exclusive: true },
];

const STATES = ["info", "loading", "empty", "error", "offline", "stale", "partial", "success", "restricted"];

export function ComponentPreview() {
  const [single, setSingle] = useState(null);
  const [multi, setMulti] = useState([]);
  const [scale, setScale] = useState(null);

  return (
    <PageShell
      eyebrow="Khusus pengembang"
      title="Pratinjau komponen SYCLE"
      description="Halaman ini hanya ada di mode development untuk memeriksa komponen dasar Tahap 1."
      aside={<SupportPanel title="Menu / konteks">Contoh kolom kiri (desktop).</SupportPanel>}
      panel={
        <SupportPanel title="Nilai saat ini">
          <pre className="whitespace-pre-wrap text-xs">{JSON.stringify({ single, multi, scale }, null, 2)}</pre>
        </SupportPanel>
      }
    >
      <SingleChoice
        code="P-01"
        question="Aktivitas apa yang paling menggambarkan rencanamu hari ini?"
        options={P01_OPTIONS}
        value={single}
        onChange={setSingle}
      />
      <MultiChoice
        code="P-03"
        question="Apa saja yang tersedia untuk membantumu beraktivitas dengan lebih nyaman?"
        options={P03_OPTIONS}
        value={multi}
        onChange={setMulti}
      />
      <DisruptionScale itemLabel="Contoh item: Lelah" value={scale} onChange={setScale} />

      <div className="flex flex-wrap gap-2">
        <Button>Tombol utama</Button>
        <Button variant="outline">Tombol sekunder</Button>
        <ConfirmDialog
          trigger={<Button variant="destructive">Hapus Catatan</Button>}
          title="Hapus catatan ini?"
          description="Contoh dialog konfirmasi. Tidak ada data yang dihapus di halaman pratinjau."
          confirmLabel="Hapus Catatan"
          destructive
          onConfirm={() => {}}
        />
      </div>

      <DraftContent>
        <p>Contoh wadah konten draf (K-01). Tidak berisi klaim kesehatan.</p>
      </DraftContent>

      <div className="grid gap-3 md:grid-cols-2">
        {STATES.map((state) => (
          <StatusMessage key={state} variant={state} title={`State: ${state}`}>
            Contoh pesan status.
          </StatusMessage>
        ))}
      </div>
    </PageShell>
  );
}
