"use client";

import { useState } from "react";
import Link from "next/link";
import { BookOpen, ClipboardList, MapPin, MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { StatusMessage } from "@/components/feedback/StatusMessage";
import { LocationPicker } from "@/components/environment/LocationPicker";
import { EnvironmentDashboard } from "@/components/environment/EnvironmentDashboard";
import { useEnvironment } from "@/context/EnvironmentContext";
import { useNow } from "@/hooks/useNow";

// Alur Beranda: 01 (belum ada lokasi) → 02/03 (pilih lokasi) → 04/11/12 (data lingkungan).
export function EnvironmentHome() {
  const { location } = useEnvironment();
  const [picker, setPicker] = useState(null); // null | "choose" | "manual"
  const now = useNow();

  if (picker) {
    return <LocationPicker initialMode={picker} onDone={() => setPicker(null)} onCancel={() => setPicker(null)} />;
  }

  if (!location) {
    return (
      <div className="space-y-6">
        <StatusMessage
        variant="empty"
        title="Lokasi belum dipilih"
        action={
          <div className="flex flex-wrap gap-2">
            <Button onClick={() => setPicker("choose")}>
              <MapPin aria-hidden="true" />
              Pilih Lokasi
            </Button>
            <Button asChild variant="outline">
              <Link href="/info-edukasi">
                <BookOpen aria-hidden="true" />
                Info & Edukasi
              </Link>
            </Button>
          </div>
        }
      >
          Pilih lokasi untuk melihat kondisi lingkungan. Kamu juga bisa membaca edukasi tanpa lokasi.
        </StatusMessage>
        <div className="grid gap-4 md:grid-cols-3">
          <QuickLink href="/personalisasi" icon={ClipboardList} title="Personalisasi" text="Dapatkan panduan berdasarkan rencana aktivitasmu." />
          <QuickLink href="/tanya-sycle" icon={MessageCircle} title="Tanya SYCLE" text="Tanyakan hal umum tentang lingkungan dan kesehatan perempuan." />
          <QuickLink href="/info-edukasi" icon={BookOpen} title="Info & Edukasi" text="Pelajari lingkungan dan langkah perlindungan." />
        </div>
      </div>
    );
  }

  return <EnvironmentDashboard now={now} onChangeLocation={(mode) => setPicker(mode === "manual" ? "manual" : "choose")} />;
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
