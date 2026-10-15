import Link from "next/link";
import { BookOpen, ClipboardList, MapPin, MessageCircle } from "lucide-react";
import { PageShell, SupportPanel } from "@/components/layout/PageShell";
import { StatusMessage } from "@/components/feedback/StatusMessage";
import { PlannedFeature } from "@/components/feedback/PlannedFeature";
import { Button } from "@/components/ui/button";

// WF-01 screen 01 — Beranda, belum memilih lokasi.
// Tidak ada angka lingkungan di sini: data asli baru tersedia pada Tahap 2.
export default function BerandaPage() {
  return (
    <PageShell
      eyebrow="Beranda"
      title="Kenali lingkunganmu, proteksi awalmu."
      description="Lihat kondisi lingkungan di lokasi pilihanmu, pahami artinya, dan temukan langkah perlindungan yang sesuai dengan rencanamu."
      panel={
        <SupportPanel title="Mengapa lokasi dibutuhkan?">
          <p>Lokasi dipakai untuk menampilkan kondisi lingkungan di wilayah yang kamu pilih.</p>
          <p>Kamu tetap bisa memilih lokasi secara manual tanpa memberi izin lokasi otomatis.</p>
        </SupportPanel>
      }
    >
      <StatusMessage
        variant="empty"
        title="Lokasi belum dipilih"
        action={
          <Button disabled>
            <MapPin aria-hidden="true" />
            Pilih Lokasi
          </Button>
        }
      >
        Pilih lokasi untuk melihat kondisi lingkungan. Kamu juga bisa membaca edukasi tanpa lokasi.
      </StatusMessage>

      <PlannedFeature stage={2} screens="01–12">
        Pemilihan lokasi dan data lingkungan (suhu, kelembapan, kualitas udara, indeks UV, Heat Index)
        belum aktif.
      </PlannedFeature>

      <div className="grid gap-4 md:grid-cols-3">
        <QuickLink href="/personalisasi" icon={ClipboardList} title="Personalisasi" text="Dapatkan panduan berdasarkan rencana aktivitasmu." />
        <QuickLink href="/tanya-sycle" icon={MessageCircle} title="Tanya SYCLE" text="Tanyakan hal umum tentang lingkungan dan kesehatan perempuan." />
        <QuickLink href="/info-edukasi" icon={BookOpen} title="Info & Edukasi" text="Pelajari lingkungan dan langkah perlindungan." />
      </div>
    </PageShell>
  );
}

function QuickLink({ href, icon: Icon, title, text }) {
  return (
    <Link href={href} className="group rounded-xl border bg-card p-4 transition-colors hover:bg-secondary">
      <Icon className="size-5 text-primary-pressed" aria-hidden="true" />
      <p className="mt-2 font-semibold group-hover:underline">{title}</p>
      <p className="text-sm text-muted-foreground">{text}</p>
    </Link>
  );
}
