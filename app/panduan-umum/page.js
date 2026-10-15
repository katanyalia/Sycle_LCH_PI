import Link from "next/link";
import { BookOpen, ClipboardList, ShieldCheck, Sun, ThermometerSun, Wind } from "lucide-react";
import { PageShell, SupportPanel } from "@/components/layout/PageShell";
import { StatusMessage } from "@/components/feedback/StatusMessage";
import { ContentStatus } from "@/components/content/ContentStatus";
import { ReferenceList } from "@/components/content/ReferenceList";
import { GUIDANCE_GROUPS } from "@/content/categories";
import { getVisibleGuidance, referencesFor } from "@/lib/content";

export const metadata = { title: "Panduan perlindungan umum" };

const GROUP_ICONS = { panas: ThermometerSun, "kualitas-udara": Wind, uv: Sun };

// WF-01 screen 10. Butir panduan ditulis tim (T3-1), wajib berreferensi, dan berlabel status.
// Halaman ini tidak memakai data gejala pribadi dan tidak membuat nasihat medis baru.
export default function PanduanUmumPage() {
  const groups = GUIDANCE_GROUPS.map((group) => ({ ...group, items: getVisibleGuidance(group.id) }));

  return (
    <PageShell
      eyebrow="Beranda · Panduan perlindungan"
      title="Langkah sederhana yang dapat kamu pertimbangkan."
      panel={
        <SupportPanel title="Tentang panduan ini">
          <p>Panduan bersifat umum dan tidak memakai data kesehatan pribadimu.</p>
          <p>Setiap langkah mencantumkan alasan singkat dan referensi.</p>
          <p>Ingin panduan sesuai rencanamu? Gunakan Personalisasi.</p>
        </SupportPanel>
      }
    >
      <nav aria-label="Kelompok panduan" className="flex flex-wrap gap-2">
        {groups.map((group) => (
          <a key={group.id} href={`#${group.id}`} className="min-h-10 rounded-full border bg-card px-4 py-2 text-sm font-medium hover:bg-secondary">
            {group.label}
          </a>
        ))}
      </nav>

      {groups.map((group) => {
        const Icon = GROUP_ICONS[group.id] ?? ShieldCheck;
        return (
          <section key={group.id} id={group.id} aria-labelledby={`judul-${group.id}`} className="scroll-mt-24 space-y-3">
            <h2 id={`judul-${group.id}`} className="flex items-center gap-2 text-xl font-semibold">
              <Icon className="size-5 text-primary-pressed" aria-hidden="true" />
              {group.label}
            </h2>
            {group.items.length === 0 ? (
              <StatusMessage variant="empty" title="Panduan sedang disiapkan">
                Panduan untuk kelompok ini sedang ditulis dan ditinjau oleh tim berdasarkan sumber ilmiah.
              </StatusMessage>
            ) : (
              <ol className="space-y-3">
                {group.items.map((item) => (
                  <li key={item.id} className="space-y-3 rounded-xl border bg-card p-4">
                    <ContentStatus item={item} />
                    <p className="font-semibold">{item.text}</p>
                    <p className="text-sm text-muted-foreground">
                      <span className="font-semibold text-foreground">Alasan: </span>
                      {item.reason}
                    </p>
                    <ReferenceList references={referencesFor(item)} />
                  </li>
                ))}
              </ol>
            )}
          </section>
        );
      })}

      <div className="flex flex-wrap gap-4">
        <Link href="/personalisasi" className="inline-flex min-h-10 items-center gap-2 font-semibold text-primary-pressed hover:underline">
          <ClipboardList className="size-4" aria-hidden="true" />
          Personalisasi
        </Link>
        <Link href="/info-edukasi" className="inline-flex min-h-10 items-center gap-2 font-semibold text-primary-pressed hover:underline">
          <BookOpen className="size-4" aria-hidden="true" />
          Info & Edukasi
        </Link>
      </div>
    </PageShell>
  );
}
