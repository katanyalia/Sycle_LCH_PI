import { notFound } from "next/navigation";
import { PageShell } from "@/components/layout/PageShell";
import { StatusMessage } from "@/components/feedback/StatusMessage";
import { RecordList } from "@/components/history/RecordList";
import { RecordDetail } from "@/components/history/RecordDetail";
import { RecordUnavailable } from "@/components/history/RecordUnavailable";
import { DeleteRecordButton } from "@/components/history/DeleteRecordButton";
import { DataDeletion } from "@/components/privacy/DataDeletion";
import { buildTrackerPayload } from "@/lib/validations/trackerValidation";
import { buildRecordCard, buildRecordView } from "@/lib/tracker/record";

export const metadata = { title: "Pratinjau Riwayat", robots: { index: false } };

// Halaman pengembang (404 di production) untuk memeriksa tampilan Tahap 7 tanpa login.
// Semua isi adalah CONTOH PRATINJAU, bukan data nyata. Tombol hapus memanggil server sungguhan dan
// akan ditolak tanpa sesi (tidak ada sesi palsu).
function sampleRow(id, recordedAt, answers, snapshot) {
  const { record, items } = buildTrackerPayload(answers);
  return { id, recorded_at: recordedAt, ...record, tracker_record_items: items, tracker_environment_snapshots: snapshot };
}

const SAMPLE = sampleRow(
  "00000000-0000-4000-8000-000000000001",
  "2026-10-15T05:30:00Z",
  { KONTEKS: "menstruasi", "HT-01": "kurang_nyaman", "HT-02": ["lelah", "lainnya"], "HT-02-other": "Contoh teks", "HT-03": { lelah: 2 }, "HT-04": "1_2_jam", "HM-01": "ya", "HM-02": "hari_2", "HM-04": "tidak", CERITA: "Contoh cerita pratinjau." },
  {
    captured_at: "2026-10-15T05:00:00Z",
    location_label: "CONTOH PRATINJAU — bukan data nyata",
    location_code: "31.71.01.1001",
    indicators: {
      temperature: { label: "Suhu udara", value: 30, unit: "°C", standard: null, category: null, source: "Contoh", dataType: "prakiraan", timeUtc: "2026-10-15T05:00:00Z", isFallback: false },
      airQuality: { label: "Kualitas udara", value: 50, unit: "US AQI", standard: "US AQI", category: "Contoh kategori", source: "Contoh", dataType: "model", timeUtc: "2026-10-15T05:00:00Z", isFallback: true },
    },
  }
);
const CARDS = [
  SAMPLE,
  sampleRow("00000000-0000-4000-8000-000000000002", "2026-10-14T09:10:00Z", { KONTEKS: "lewati" }, null),
].map(buildRecordCard);

export default function PratinjauRiwayatPage() {
  if (process.env.NODE_ENV === "production") notFound();
  const view = buildRecordView(SAMPLE);
  return (
    <PageShell eyebrow="Khusus pengembang" title="Pratinjau Riwayat, detail, dan penghapusan">
      <StatusMessage variant="info" title="Pratinjau tampilan — CONTOH, bukan data nyata">
        Halaman ini hanya ada di mode development. Hapus & unduh tetap memerlukan login dan akan ditolak tanpa sesi.
      </StatusMessage>
      <h2 className="text-lg font-semibold">Screen 55 — daftar</h2>
      <RecordList cards={CARDS} />
      <h2 className="text-lg font-semibold">Screen 56 — detail</h2>
      <RecordDetail view={view} />
      <div className="flex flex-wrap gap-2">
        <DeleteRecordButton recordId={view.id} timeText={view.timeText} />
      </div>
      <h2 className="text-lg font-semibold">Catatan tidak ditemukan</h2>
      <RecordUnavailable reason="not_found" />
      <h2 className="text-lg font-semibold">Screen 71 — hapus data/akun</h2>
      <DataDeletion recordCount={2} />
    </PageShell>
  );
}
