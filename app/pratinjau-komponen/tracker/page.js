import { notFound } from "next/navigation";
import { PageShell } from "@/components/layout/PageShell";
import { StatusMessage } from "@/components/feedback/StatusMessage";
import { TrackerFlow } from "@/components/tracker/TrackerFlow";

export const metadata = { title: "Pratinjau Health Tracker", robots: { index: false } };

// Halaman pengembang (404 di production) untuk memeriksa tampilan formulir Tracker tanpa login.
// Tidak ada sesi palsu: tombol Simpan memanggil server sungguhan dan akan ditolak bila tidak login.
export default function PratinjauTrackerPage() {
  if (process.env.NODE_ENV === "production") notFound();
  return (
    <PageShell eyebrow="Khusus pengembang" title="Pratinjau formulir Health Tracker">
      <StatusMessage variant="info" title="Pratinjau tampilan — bukan halaman Member">
        Halaman ini hanya ada di mode development. Penyimpanan tetap memerlukan login dan akan ditolak tanpa sesi.
      </StatusMessage>
      <TrackerFlow />
    </PageShell>
  );
}
