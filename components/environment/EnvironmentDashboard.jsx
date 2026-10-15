"use client";

import Link from "next/link";
import { ChevronRight, ClipboardList, MapPin, MessageCircle, RefreshCw, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { StatusMessage } from "@/components/feedback/StatusMessage";
import { IndicatorValue } from "@/components/environment/IndicatorValue";
import { formatDataTime, formatRelative } from "@/lib/environment/format";
import { isIndicatorStale } from "@/lib/environment/freshness";
import { useEnvironment } from "@/context/EnvironmentContext";

// WF-01 screen 04 (data valid), 11 (data lama/offline), 12 (data parsial/gagal).
export function EnvironmentDashboard({ onChangeLocation, now }) {
  const { snapshot, status, error, online, refresh, location } = useEnvironment();

  if (status === "loading" && !snapshot) return <DashboardSkeleton label={location?.shortLabel} />;

  if (status === "error" && !snapshot) {
    return (
      <StatusMessage
        variant="error"
        title="Data lingkungan belum dapat ditampilkan."
        action={
          <div className="flex flex-wrap gap-2">
            <Button onClick={refresh}>
              <RefreshCw aria-hidden="true" />
              Coba Lagi
            </Button>
            <Button variant="outline" onClick={onChangeLocation}>
              Ubah Lokasi
            </Button>
          </div>
        }
      >
        {error} Informasi edukasi tetap dapat kamu baca.
      </StatusMessage>
    );
  }

  if (!snapshot) return null;

  const { indicators, location: place } = snapshot;
  const timezone = place.timezone;
  const list = Object.values(indicators);
  const unavailable = list.filter((item) => item.status === "unavailable");
  const anyStale = list.some((item) => isIndicatorStale(item, now));

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-start justify-between gap-3 rounded-xl border bg-card p-4">
        <div className="space-y-1">
          <p className="flex items-center gap-1.5 font-semibold">
            <MapPin className="size-4 text-primary-pressed" aria-hidden="true" />
            {place.label}
          </p>
          <p className="text-sm text-muted-foreground">
            Diambil {formatRelative(snapshot.retrievedAt, now)} ({formatDataTime(snapshot.retrievedAt, timezone)})
            {status === "loading" && " · memperbarui…"}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button onClick={refresh} disabled={status === "loading" || !online}>
            <RefreshCw aria-hidden="true" className={status === "loading" ? "animate-spin" : undefined} />
            Perbarui Data
          </Button>
          <Button variant="outline" onClick={onChangeLocation}>
            Ubah Lokasi
          </Button>
        </div>
      </div>

      {(!online || snapshot.fromCache) && (
        <StatusMessage variant="offline" title={online ? "Data tersimpan ditampilkan" : "Koneksi tidak tersedia"}>
          Data tersimpan — bukan kondisi terkini. Informasi edukasi tetap dapat dibaca.
        </StatusMessage>
      )}
      {online && !snapshot.fromCache && anyStale && (
        <StatusMessage variant="stale" title="Sebagian data bukan kondisi terkini" action={<Button size="sm" onClick={refresh}>Perbarui Data</Button>}>
          Waktu data ditampilkan pada setiap indikator.
        </StatusMessage>
      )}
      {status === "error" && (
        <StatusMessage variant="error" title="Pembaruan belum berhasil">
          {error} Data yang tampil adalah data sebelumnya.
        </StatusMessage>
      )}
      {unavailable.length > 0 && unavailable.length < list.length && (
        <StatusMessage variant="partial" title="Sebagian informasi belum tersedia." action={<Button size="sm" variant="outline" onClick={refresh}>Coba Lagi</Button>}>
          {unavailable.map((item) => item.label).join(", ")} belum tersedia. Indikator lain tetap ditampilkan.
        </StatusMessage>
      )}
      {place.kind === "device" && (
        <StatusMessage
          variant="info"
          title="Ingin memakai data BMKG?"
          action={<Button size="sm" variant="outline" onClick={() => onChangeLocation("manual")}>Pilih Kelurahan/Desa</Button>}
        >
          Lokasi perangkat belum dapat dipetakan ke kode desa BMKG, jadi suhu & kelembapan memakai data cadangan.
        </StatusMessage>
      )}

      <div className="grid gap-4 md:grid-cols-2">
        <IndicatorCard href="/lingkungan/suhu-kelembapan" title="Suhu & kelembapan" className="bg-blush">
          <div className="grid grid-cols-2 gap-4">
            <IndicatorValue indicator={indicators.temperature} timezone={timezone} now={now} />
            <IndicatorValue indicator={indicators.humidity} timezone={timezone} now={now} />
          </div>
        </IndicatorCard>
        <IndicatorCard href="/lingkungan/kualitas-udara" title="Kualitas udara" className="bg-sage">
          <IndicatorValue indicator={indicators.airQuality} timezone={timezone} now={now} />
          {indicators.airQuality.isFallback && (
            <p className="text-xs text-muted-foreground">ISPU belum tersedia untuk lokasi ini. US AQI bukan ISPU.</p>
          )}
          {indicators.airQuality.station && (
            <p className="text-xs text-muted-foreground">
              Stasiun {indicators.airQuality.station.name} · {indicators.airQuality.station.distanceKm.toLocaleString("id-ID")} km
            </p>
          )}
        </IndicatorCard>
        <IndicatorCard title="Heat Index & indeks UV" className="bg-powder">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <IndicatorValue indicator={indicators.heatIndex} timezone={timezone} now={now} />
              <DetailLink href="/lingkungan/heat-index" label="Detail Heat Index" />
            </div>
            <div className="space-y-2">
              <IndicatorValue indicator={indicators.uv} timezone={timezone} now={now} />
              <DetailLink href="/lingkungan/indeks-uv" label="Detail indeks UV" />
            </div>
          </div>
        </IndicatorCard>
        <section className="space-y-3 rounded-xl border bg-lavender p-4" aria-labelledby="judul-langkah">
          <h2 id="judul-langkah" className="font-semibold">Langkah berikutnya</h2>
          <ul className="space-y-1">
            <NextLink href="/panduan-umum" icon={ShieldCheck} label="Panduan perlindungan" />
            <NextLink href="/personalisasi" icon={ClipboardList} label="Personalisasi" />
            <NextLink href="/tanya-sycle" icon={MessageCircle} label="Tanya SYCLE" />
          </ul>
        </section>
      </div>
    </div>
  );
}

function IndicatorCard({ title, href, className, children }) {
  return (
    <section className={`space-y-3 rounded-xl border p-4 ${className}`} aria-label={title}>
      <h2 className="font-semibold">{title}</h2>
      {children}
      {href && <DetailLink href={href} label={`Detail ${title.toLowerCase()}`} />}
    </section>
  );
}

function DetailLink({ href, label }) {
  return (
    <Link href={href} className="inline-flex items-center gap-1 text-sm font-semibold text-primary-pressed hover:underline">
      {label}
      <ChevronRight className="size-4" aria-hidden="true" />
    </Link>
  );
}

function NextLink({ href, icon: Icon, label }) {
  return (
    <li>
      <Link href={href} className="flex min-h-10 items-center gap-2 rounded-lg px-2 font-medium hover:bg-card">
        <Icon className="size-4 text-primary-pressed" aria-hidden="true" />
        {label}
      </Link>
    </li>
  );
}

function DashboardSkeleton({ label }) {
  return (
    <div className="space-y-4" role="status" aria-live="polite">
      <p className="text-sm text-muted-foreground">Data sedang dimuat{label ? ` untuk ${label}` : ""}…</p>
      <div className="grid gap-4 md:grid-cols-2">
        {[0, 1, 2, 3].map((i) => (
          <Skeleton key={i} className="h-40 rounded-xl" />
        ))}
      </div>
    </div>
  );
}
