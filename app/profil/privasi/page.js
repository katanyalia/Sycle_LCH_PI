import Link from "next/link";
import { redirect } from "next/navigation";
import { ArrowLeft, Bot, History, LockKeyhole, MapPin, ShieldCheck, Trash2 } from "lucide-react";
import { PageShell, SupportPanel } from "@/components/layout/PageShell";
import { DataDeletion } from "@/components/privacy/DataDeletion";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/server";
import { countTrackerRecords } from "@/lib/repositories/trackerRepository";

export const metadata = { title: "Privasi dan pengelolaan data" };

const SECTIONS = [
  {
    icon: LockKeyhole,
    title: "Penyimpanan catatan",
    points: [
      "Catatan Health Tracker hanya tersimpan ketika kamu memilih Simpan Catatan dan mengonfirmasinya.",
      "Jawaban yang sedang diisi, jawaban Personalisasi, dan sesi yang diakhiri tanpa menyimpan tidak masuk ke Riwayat.",
      "Catatan tersimpan hanya dapat dilihat olehmu sebagai pemilik akun dan tidak dapat diubah setelah disimpan.",
    ],
  },
  {
    icon: Bot,
    title: "Penggunaan AI",
    points: [
      "Refleksi AI pada Health Tracker belum aktif di prototipe ini. Ringkasan tanpa AI selalu tersedia.",
      "Bila nanti tersedia, persetujuan AI diminta terpisah setiap kali dan tidak dianggap permanen hanya karena kamu punya akun.",
    ],
  },
  {
    icon: MapPin,
    title: "Data lingkungan pada catatan",
    points: [
      "Catatan menyimpan nama wilayah dan koordinat yang dibulatkan, bukan lokasi persismu.",
      "Data lingkungan berasal dari stasiun, prakiraan, atau model untuk wilayah tersebut, bukan paparan pribadimu.",
    ],
  },
];

// WF-10 screen 70 — Privasi & pengelolaan data; screen 71 — konfirmasi hapus data/akun (DataDeletion).
export default async function PrivasiPage() {
  const supabase = await createClient();
  const { data } = await supabase.auth.getClaims();
  if (!data?.claims) redirect("/masuk?next=/profil/privasi");

  const counted = await countTrackerRecords(supabase);
  const recordCount = counted.ok ? counted.count : null;

  return (
    <PageShell
      eyebrow="Profil · Privasi"
      title="Kamu mengendalikan catatan dan datamu."
      panel={
        <SupportPanel title="Hak aksesmu">
          <p>Melihat catatan tersimpan di Riwayat.</p>
          <p>Mengunduh PDF dari catatan tersimpan.</p>
          <p>Menghapus satu catatan, semua catatan, atau akunmu.</p>
          <p>Setiap penghapusan memerlukan konfirmasi dan hanya ditampilkan berhasil setelah server mengonfirmasi.</p>
        </SupportPanel>
      }
    >
      {SECTIONS.map(({ icon: Icon, title, points }) => (
        <section key={title} className="space-y-2 rounded-xl border bg-card p-4 md:p-6">
          <h2 className="flex items-center gap-2 text-lg font-semibold">
            <Icon className="size-5 text-primary-pressed" aria-hidden="true" />
            {title}
          </h2>
          <ul className="list-disc space-y-1 pl-5 text-sm">
            {points.map((point) => (
              <li key={point}>{point}</li>
            ))}
          </ul>
        </section>
      ))}

      <section aria-labelledby="judul-kelola" className="space-y-4">
        <h2 id="judul-kelola" className="flex items-center gap-2 text-lg font-semibold">
          <Trash2 className="size-5 text-primary-pressed" aria-hidden="true" />
          Kelola data
        </h2>
        <div className="space-y-2 rounded-xl border bg-card p-4 md:p-6">
          <h3 className="flex items-center gap-2 font-semibold">
            <History className="size-5 text-primary-pressed" aria-hidden="true" />
            Hapus satu catatan
          </h3>
          <p className="text-sm text-muted-foreground">
            {recordCount === null ? "Buka Riwayat" : `Kamu memiliki ${recordCount} catatan tersimpan. Buka Riwayat`}, pilih
            catatan, lalu gunakan tombol Hapus Catatan di halaman detailnya.
          </p>
          <Button asChild variant="outline" size="sm">
            <Link href="/health-tracker/riwayat">Buka Riwayat</Link>
          </Button>
        </div>
        <DataDeletion recordCount={recordCount} />
      </section>

      <Button asChild variant="ghost">
        <Link href="/profil">
          <ArrowLeft aria-hidden="true" />
          Kembali ke Profil
        </Link>
      </Button>
      <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
        <ShieldCheck className="size-4" aria-hidden="true" />
        Data catatan dilindungi Row Level Security: database hanya mengizinkan akses oleh pemilik akun.
      </p>
    </PageShell>
  );
}
