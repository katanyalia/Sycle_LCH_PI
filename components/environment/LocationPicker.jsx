"use client";

import { useEffect, useId, useState } from "react";
import { Check, LocateFixed, MapPin, Search, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { StatusMessage } from "@/components/feedback/StatusMessage";
import { roundCoordinate } from "@/lib/environment/geo";
import { useEnvironment } from "@/context/EnvironmentContext";
import { cn } from "@/lib/utils";

// WF-01 screen 02 (izin lokasi) + 03 (pemilihan lokasi manual).
// Izin browser hanya diminta setelah pengguna menekan "Gunakan Lokasi"; penolakan bukan blokir.
export function LocationPicker({ onDone, onCancel, initialMode = "choose" }) {
  const [mode, setMode] = useState(initialMode); // choose | manual
  const [geoState, setGeoState] = useState("idle"); // idle | requesting | denied | unavailable
  const { selectDevice } = useEnvironment();

  function requestDeviceLocation() {
    if (!("geolocation" in navigator)) {
      setGeoState("unavailable");
      return;
    }
    setGeoState("requesting");
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setGeoState("idle");
        selectDevice(roundCoordinate(position.coords.latitude), roundCoordinate(position.coords.longitude));
        onDone?.();
      },
      (error) => setGeoState(error.code === error.PERMISSION_DENIED ? "denied" : "unavailable"),
      { enableHighAccuracy: false, timeout: 15000, maximumAge: 600000 }
    );
  }

  if (mode === "manual") {
    return <ManualSearch onDone={onDone} onCancel={() => (initialMode === "manual" ? onCancel?.() : setMode("choose"))} />;
  }

  return (
    <section aria-labelledby="judul-izin-lokasi" className="space-y-4 rounded-xl border bg-card p-4 md:p-6">
      <h2 id="judul-izin-lokasi" className="text-lg font-semibold">
        Gunakan lokasimu untuk menampilkan informasi lingkungan.
      </h2>
      <ul className="space-y-2 text-sm text-muted-foreground">
        <li className="flex gap-2">
          <LocateFixed className="mt-0.5 size-4 shrink-0 text-primary-pressed" aria-hidden="true" />
          Izinkan lokasi melalui browser. Koordinatmu dibulatkan (± 1 km) dan tidak disimpan.
        </li>
        <li className="flex gap-2">
          <MapPin className="mt-0.5 size-4 shrink-0 text-primary-pressed" aria-hidden="true" />
          Atau pilih lokasi secara manual — data BMKG tersedia untuk kelurahan/desa yang kamu pilih.
        </li>
      </ul>

      {geoState === "denied" && (
        <StatusMessage variant="info" title="Izin lokasi tidak diberikan">
          Tidak apa-apa. Kamu tetap bisa memilih lokasi secara manual.
        </StatusMessage>
      )}
      {geoState === "unavailable" && (
        <StatusMessage variant="error" title="Lokasi perangkat belum dapat dibaca">
          Coba lagi, atau pilih lokasi secara manual.
        </StatusMessage>
      )}

      <div className="flex flex-wrap gap-2">
        <Button onClick={requestDeviceLocation} disabled={geoState === "requesting"}>
          <LocateFixed aria-hidden="true" />
          {geoState === "requesting" ? "Meminta izin…" : "Gunakan Lokasi"}
        </Button>
        <Button variant="outline" onClick={() => setMode("manual")}>
          <MapPin aria-hidden="true" />
          Pilih Manual
        </Button>
        {onCancel && (
          <Button variant="ghost" onClick={onCancel}>
            Batal
          </Button>
        )}
      </div>
    </section>
  );
}

function ManualSearch({ onDone, onCancel }) {
  const id = useId();
  const { selectVillage } = useEnvironment();
  const [query, setQuery] = useState("");
  const [result, setResult] = useState({ query: "", status: "idle", items: [], total: 0, error: null });
  const [chosen, setChosen] = useState(null);
  const trimmed = query.trim();
  // Hasil hanya berlaku untuk kata kunci yang sedang diketik; selain itu dianggap masih memuat/idle.
  const state =
    trimmed.length < 3
      ? { status: "idle", items: [], total: 0, error: null }
      : result.query === trimmed
        ? result
        : { status: "loading", items: [], total: 0, error: null };

  useEffect(() => {
    if (trimmed.length < 3) return undefined;
    const controller = new AbortController();
    const timer = setTimeout(async () => {
      try {
        const response = await fetch(`/api/locations/search?q=${encodeURIComponent(trimmed)}`, { signal: controller.signal });
        const body = await response.json();
        if (!response.ok) throw new Error(body.error);
        setResult({ query: trimmed, status: "done", items: body.items, total: body.total, error: null });
      } catch (error) {
        if (error.name === "AbortError") return;
        setResult({ query: trimmed, status: "error", items: [], total: 0, error: error.message || "Pencarian belum dapat dilakukan." });
      }
    }, 300);
    return () => {
      clearTimeout(timer);
      controller.abort();
    };
  }, [trimmed]);

  function confirm() {
    if (!chosen) return;
    selectVillage(chosen);
    onDone?.();
  }

  return (
    <section aria-labelledby={`${id}-judul`} className="space-y-4 rounded-xl border bg-card p-4 md:p-6">
      <h2 id={`${id}-judul`} className="text-lg font-semibold">
        Cari lokasi yang ingin kamu lihat.
      </h2>
      <div className="space-y-2">
        <Label htmlFor={`${id}-q`}>Kelurahan/desa (boleh ditambah kecamatan atau kota)</Label>
        <div className="relative">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" aria-hidden="true" />
          <Input
            id={`${id}-q`}
            value={query}
            onChange={(event) => {
              setQuery(event.target.value);
              setChosen(null);
            }}
            placeholder="Contoh: Kemayoran, atau Dago Bandung"
            className="h-11 pl-9 text-base"
            autoComplete="off"
            aria-describedby={`${id}-status`}
          />
        </div>
        <p id={`${id}-status`} className="text-sm text-muted-foreground" aria-live="polite">
          {state.status === "idle" && "Ketik minimal 3 huruf."}
          {state.status === "loading" && "Mencari…"}
          {state.status === "done" && state.total === 0 && "Lokasi tidak ditemukan. Periksa ejaan, atau coba nama kecamatan/kota."}
          {state.status === "done" && state.total > 0 &&
            (state.total > state.items.length
              ? `Menampilkan ${state.items.length} dari ${state.total} hasil. Tambahkan nama kecamatan atau kota untuk mempersempit.`
              : `${state.total} hasil ditemukan.`)}
          {state.status === "error" && state.error}
        </p>
      </div>

      {state.items.length > 0 && (
        <ul className="max-h-80 space-y-2 overflow-y-auto" aria-label="Hasil pencarian lokasi">
          {state.items.map((item) => {
            const selected = chosen?.code === item.code;
            return (
              <li key={item.code}>
                <button
                  type="button"
                  onClick={() => setChosen(item)}
                  aria-pressed={selected}
                  className={cn(
                    "flex w-full items-start gap-3 rounded-xl border bg-card px-4 py-3 text-left hover:bg-secondary",
                    selected && "border-primary bg-secondary"
                  )}
                >
                  {selected ? (
                    <Check className="mt-0.5 size-4 shrink-0 text-primary-pressed" aria-hidden="true" />
                  ) : (
                    <MapPin className="mt-0.5 size-4 shrink-0 text-muted-foreground" aria-hidden="true" />
                  )}
                  <span>
                    <span className="block font-semibold">{item.village}</span>
                    <span className="block text-sm text-muted-foreground">
                      Kec. {item.district}, {item.regency}, {item.province}
                    </span>
                  </span>
                </button>
              </li>
            );
          })}
        </ul>
      )}

      {chosen && (
        <p className="flex items-start gap-2 rounded-lg bg-sage px-3 py-2 text-sm">
          <ShieldCheck className="mt-0.5 size-4 shrink-0 text-primary-pressed" aria-hidden="true" />
          Lokasi pilihan: {chosen.label}
        </p>
      )}

      <div className="flex flex-wrap gap-2">
        <Button variant="outline" onClick={onCancel}>
          Batal
        </Button>
        <Button onClick={confirm} disabled={!chosen}>
          <Check aria-hidden="true" />
          Gunakan Lokasi
        </Button>
      </div>
    </section>
  );
}
