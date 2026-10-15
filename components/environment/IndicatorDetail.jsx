"use client";

import Link from "next/link";
import { ArrowLeft, BookA, Info, ShieldCheck } from "lucide-react";
import { PageShell, SupportPanel } from "@/components/layout/PageShell";
import { Button } from "@/components/ui/button";
import { StatusMessage } from "@/components/feedback/StatusMessage";
import { IndicatorValue } from "@/components/environment/IndicatorValue";
import { DATA_TYPE_LABEL, formatDataTime, formatNumber } from "@/lib/environment/format";
import { INDICATOR_PAGES } from "@/lib/environment/indicatorRoutes";
import { GUIDANCE_GROUPS } from "@/content/categories";
import { GLOSSARY } from "@/content/education/glossary";
import { useEnvironment } from "@/context/EnvironmentContext";
import { useNow } from "@/hooks/useNow";

// Penjelasan diambil dari Master Draft (6.2, 6.3.3) dan Master Wireframe (screen 05–09),
// bukan klaim kesehatan baru.
function Explanation({ slug, snapshot }) {
  if (slug === "suhu-kelembapan") {
    return (
      <>
        <p>Suhu udara (°C) dan kelembapan relatif (%) di lokasi pilihanmu.</p>
        <p>Nilai ini menggambarkan kondisi udara di sekitar lokasi, bukan suhu tubuhmu.</p>
      </>
    );
  }
  if (slug === "kualitas-udara") {
    const isUsAqi = snapshot?.indicators.airQuality.standard === "US AQI";
    return (
      <>
        <p>ISPU adalah Indeks Standar Pencemar Udara Indonesia. US AQI adalah indeks kualitas udara berdasarkan standar Amerika Serikat. Keduanya tidak identik.</p>
        {isUsAqi && <p>Data yang tampil adalah US AQI sebagai data cadangan. Nilainya tidak dikonversi menjadi ISPU.</p>}
        <p>Data stasiun atau model tidak sama dengan paparan pribadimu.</p>
      </>
    );
  }
  if (slug === "indeks-uv") {
    return (
      <>
        <p>Indeks UV menggambarkan intensitas radiasi ultraviolet.</p>
        <p>Nilai ini bukan ukuran paparan pribadimu.</p>
      </>
    );
  }
  return (
    <>
      <p>Heat Index adalah ukuran rasa panas dari kombinasi suhu dan kelembapan relatif.</p>
      <p>Heat Index adalah estimasi rasa panas pada kondisi tertentu, bukan ukuran langsung kondisi tubuh atau penilaian kesehatan pribadi.</p>
      <p>Heat Index bukan suhu tubuh, diagnosis stres panas, indeks UV, atau skor risiko medis.</p>
    </>
  );
}

export function IndicatorDetail({ slug }) {
  const { snapshot, location } = useEnvironment();
  const now = useNow();
  const page = INDICATOR_PAGES[slug];
  const guidanceGroup = GUIDANCE_GROUPS.find((group) => group.indicatorPages.includes(slug));
  const glossaryId = { "suhu-kelembapan": "kelembapan-relatif", "kualitas-udara": "ispu", "indeks-uv": "indeks-uv", "heat-index": "heat-index" }[slug];
  const glossaryEntry = GLOSSARY.find((entry) => entry.id === glossaryId);

  return (
    <PageShell
      eyebrow="Beranda · Detail indikator"
      title={page.title}
      panel={
        <SupportPanel title="Tentang indikator ini">
          <Explanation slug={slug} snapshot={snapshot} />
        </SupportPanel>
      }
    >
      {!snapshot ? (
        <StatusMessage
          variant="empty"
          title={location ? "Data sedang dimuat atau belum tersedia" : "Lokasi belum dipilih"}
          action={
            <Button asChild>
              <Link href="/">Kembali ke Beranda</Link>
            </Button>
          }
        >
          Pilih lokasi di Beranda untuk melihat detail indikator ini.
        </StatusMessage>
      ) : (
        <>
          {page.indicators.map((id) => (
            <IndicatorBlock key={id} indicator={snapshot.indicators[id]} place={snapshot.location} now={now} />
          ))}
        </>
      )}
      <div className="flex flex-wrap gap-2">
        <Button asChild variant="outline">
          <Link href="/">
            <ArrowLeft aria-hidden="true" />
            Kembali ke Beranda
          </Link>
        </Button>
        <Button asChild>
          <Link href={`/panduan-umum#${guidanceGroup?.id ?? ""}`}>
            <ShieldCheck aria-hidden="true" />
            Panduan Perlindungan
          </Link>
        </Button>
        {glossaryEntry && (
          <Button asChild variant="ghost">
            <Link href={`/info-edukasi/glosarium#${glossaryEntry.id}`}>
              <BookA aria-hidden="true" />
              Pelajari: {glossaryEntry.term}
            </Link>
          </Button>
        )}
      </div>
    </PageShell>
  );
}

function IndicatorBlock({ indicator, place, now }) {
  const timezone = place.timezone;
  const available = indicator.status !== "unavailable";

  return (
    <section className="space-y-4 rounded-xl border bg-card p-4 md:p-6" aria-label={indicator.label}>
      <IndicatorValue indicator={indicator} timezone={timezone} now={now} />

      {indicator.isFallback && (
        <StatusMessage variant="partial" title="Data cadangan">
          {indicator.fallbackReason}
        </StatusMessage>
      )}

      {available && (
        <dl className="grid gap-x-6 gap-y-3 text-sm sm:grid-cols-[12rem_1fr]">
          <Row term="Sumber">
            {indicator.source.detail}
            <span className="block text-muted-foreground">{indicator.source.attribution}</span>
          </Row>
          <Row term="Jenis data">{DATA_TYPE_LABEL[indicator.dataType]}</Row>
          <Row term="Waktu data">
            {formatDataTime(indicator.timeUtc, timezone)}
            <span className="block text-muted-foreground">{indicator.timeNote}</span>
          </Row>
          {indicator.standard && <Row term="Standar indeks">{indicator.standard}</Row>}
          {indicator.category && (
            <Row term="Kategori">
              {indicator.category.label}
              {indicator.category.original && <span className="text-muted-foreground"> ({indicator.category.original})</span>}
            </Row>
          )}
          {indicator.station && (
            <Row term="Stasiun">
              {indicator.station.name}, {indicator.station.regency}
              <span className="block text-muted-foreground">
                ± {formatNumber(indicator.station.distanceKm)} km dari lokasi pilihan
              </span>
            </Row>
          )}
          {indicator.method && (
            <Row term="Metode">
              Rumus Heat Index NWS/NOAA, dari suhu {formatNumber(indicator.inputs.temperature)} °C dan kelembapan{" "}
              {formatNumber(indicator.inputs.humidity, 0)}% ({indicator.inputs.source}, {DATA_TYPE_LABEL[indicator.inputs.dataType].toLowerCase()})
            </Row>
          )}
          <Row term="Lokasi">
            {place.label}
            {Number.isFinite(place.lat) && (
              <span className="block text-muted-foreground">
                Koordinat {formatNumber(place.lat, 2)}; {formatNumber(place.lon, 2)} — {place.coordinateSource}
              </span>
            )}
          </Row>
          <Row term="Status">{indicator.isFallback ? "Sumber cadangan" : "Sumber utama"}</Row>
        </dl>
      )}

      {!available && (
        <p className="flex items-center gap-2 text-sm text-muted-foreground">
          <Info className="size-4" aria-hidden="true" />
          SYCLE tidak menampilkan angka bila data belum tersedia atau tidak valid.
        </p>
      )}
    </section>
  );
}

function Row({ term, children }) {
  return (
    <>
      <dt className="font-semibold">{term}</dt>
      <dd>{children}</dd>
    </>
  );
}
