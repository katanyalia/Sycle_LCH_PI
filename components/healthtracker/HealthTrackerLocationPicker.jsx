"use client";

import { useEffect, useState } from "react";
import { MapPin, LocateFixed, Search, CheckCircle2 } from "lucide-react";
import { useAssessment } from "@/context/AssessmentContext";
import { Button } from "@/components/ui/button";

export default function HealthTrackerLocationPicker() {
  const {
    location,
    setLocation,
    environmentLocation,
    setEnvironmentLocation,
  } = useAssessment();

  const [searchText, setSearchText] = useState("");
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState("");
  const [showPicker, setShowPicker] = useState(false);

  useEffect(() => {
    const query = searchText.trim();

    // Hasil dikosongkan di handleSearchChange, bukan di sini (aturan react-hooks/set-state-in-effect).
    if (query.length < 3) return;

    const timeout = setTimeout(async () => {
      setLoading(true);
      setStatus("");

      try {
        const response = await fetch(
          `/api/locations/search?q=${encodeURIComponent(query)}`
        );

        const result = await response.json();

        if (!response.ok) {
          throw new Error(result.error || "Pencarian wilayah gagal.");
        }

        const items = Array.isArray(result.items) ? result.items : [];

        setResults(items);
        setStatus(
          items.length
            ? "Pilih lokasi yang sesuai."
            : "Wilayah tidak ditemukan."
        );
      } catch (error) {
        setResults([]);
        setStatus(error.message || "Pencarian lokasi gagal.");
      } finally {
        setLoading(false);
      }
    }, 400);

    return () => clearTimeout(timeout);
  }, [searchText]);

  const hasLocation = Boolean(
    environmentLocation?.adm4 ||
    (
      environmentLocation?.coordinates?.latitude != null &&
      environmentLocation?.coordinates?.longitude != null
    )
  );

  function handleSearchChange(event) {
    const value = event.target.value;
    setSearchText(value);

    if (value.trim().length < 3) {
      setResults([]);
      setStatus("");
    }
  }

  function handleSelectLocation(item) {
    const village =
      item.village || item.name || item.nama || item.label || "";

    const adm4 = item.code ?? item.kode ?? null;

    if (!adm4) {
      setStatus("Kode wilayah tidak tersedia. Coba pilih hasil lainnya.");
      return;
    }

    const locationLabel = [
      village,
      item.regency,
    ].filter(Boolean).join(", ");

    setLocation(locationLabel);

    setEnvironmentLocation({
      adm4,
      coordinates: null,
    });

    setSearchText("");
    setResults([]);
    setStatus("Lokasi berhasil dipilih.");
    setShowPicker(false);
  }

  function handleUseMyLocation() {
    if (!navigator.geolocation) {
      setStatus("Browser tidak mendukung deteksi lokasi.");
      return;
    }

    setLoading(true);
    setStatus("Sedang mendeteksi lokasi...");

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const latitude = position.coords.latitude;
        const longitude = position.coords.longitude;

        setEnvironmentLocation({
          adm4: null,
          coordinates: { latitude, longitude },
        });

        try {
          const response = await fetch(
            `/api/locations/reverse?lat=${latitude}&lon=${longitude}`
          );

          const result = await response.json();

          if (!response.ok) {
            throw new Error(
              result.message || "Nama wilayah gagal ditemukan."
            );
          }

          if (result.location) {
            setLocation(result.location);
          }

          setStatus(
            result.location
              ? `Lokasi ditemukan: ${result.location}`
              : "Koordinat ditemukan. Nama wilayah belum tersedia."
          );

          setShowPicker(false);
        } catch (error) {
          setStatus(
            error.message || "Nama wilayah gagal ditemukan."
          );
        } finally {
          setLoading(false);
        }
      },
      (error) => {
        const messages = {
          1: "Izin lokasi ditolak. Periksa izin lokasi browser.",
          2: "Posisi tidak tersedia. Periksa layanan lokasi perangkat.",
          3: "Permintaan lokasi kehabisan waktu. Coba lagi.",
        };

        setStatus(messages[error.code] || "GPS gagal mendeteksi lokasi.");
        setLoading(false);
      },
      {
        enableHighAccuracy: false,
        timeout: 20000,
        maximumAge: 60000,
      }
    );
  }

  return (
    <div className="mt-4 rounded-2xl border border-[#F0E3E9] bg-white p-4 sm:p-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex min-w-0 items-start gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#F8E8EF] text-[#B84E73]">
            <MapPin size={19} />
          </div>

          <div className="min-w-0">
            <p className="text-sm font-bold text-[#332A35]">
              Lokasi lingkungan
            </p>

            {hasLocation ? (
              <>
                <p className="mt-1 break-words text-sm text-[#52745A]">
                  <CheckCircle2 size={14} className="mr-1 inline" />
                  {location || "Lokasi berhasil dipilih"}
                </p>
                <p className="mt-1 text-xs text-[#8A7B87]">
                  Data lingkungan akan disesuaikan dengan lokasi ini.
                </p>
              </>
            ) : (
              <p className="mt-1 text-sm text-[#746875]">
                Lokasi belum dipilih. Kamu tetap bisa check-in.
              </p>
            )}
          </div>
        </div>

        <button
          type="button"
          onClick={() => {
            setShowPicker((current) => !current);
            setStatus("");
          }}
          className="rounded-xl border border-[#B84E73] px-4 py-2.5 text-sm font-semibold text-[#8E3E5E] transition hover:bg-[#FFF8FB]"
        >
          {showPicker ? "Tutup" : hasLocation ? "Ubah Lokasi" : "Pilih Lokasi"}
        </button>
      </div>

      {showPicker && (
        <div className="mt-5 border-t border-[#F0E3E9] pt-4">
          <label
            htmlFor="health-tracker-location"
            className="text-sm font-semibold text-[#332A35]"
          >
            Cari kota atau wilayah
          </label>

          <div className="relative mt-2">
            <div className="flex min-w-0 items-center rounded-xl border border-[#EADDE3] px-3">
              <Search size={17} className="shrink-0 text-[#8A7B87]" />

              <input
                id="health-tracker-location"
                type="text"
                value={searchText}
                onChange={handleSearchChange}
                placeholder="Cari kelurahan/desa, mis. Ancol Jakarta"
                autoComplete="off"
                className="w-full min-w-0 bg-transparent px-2 py-3 text-sm text-[#332A35] outline-none"
              />
            </div>

            {/* Status pencarian/GPS (mis. "Wilayah tidak ditemukan.") */}
            {(loading || status) && (
              <p role="status" className="mt-2 text-xs text-[#8A7B87]">
                {status || "Sedang mencari lokasi..."}
              </p>
            )}
          </div>

          {results.length > 0 && (
            <div className="mt-3 max-h-60 overflow-y-auto rounded-xl border border-[#EADDE3]">
              {results.map((item, index) => {
                const name =
                  item.village || item.name || item.nama || "";

                const label =
                  item.label ||
                  item._displayPath ||
                  item.full_path ||
                  item.fullPath ||
                  item.path ||
                  name;

                return (
                  <button
                    key={item.code ?? item.kode ?? `${label}-${index}`}
                    type="button"
                    onClick={() => handleSelectLocation(item)}
                    className="block w-full border-b border-[#F3E9EE] px-4 py-3 text-left last:border-0 hover:bg-[#FFF8FB]"
                  >
                    <span className="block text-sm font-semibold text-[#332A35]">
                      {name || label}
                    </span>
                    <span className="mt-1 block text-xs text-[#746875]">
                      {[
                        item.district,
                        item.regency,
                        item.province,
                      ].filter(Boolean).join(", ")}
                    </span>
                  </button>
                );
              })}
            </div>
          )}

          <Button
            type="button"
            variant="outline"
            size="lg"
            onClick={handleUseMyLocation}
            disabled={loading}
            className="mt-3 h-9 justify-center gap-2 rounded-xl border-[#F0E3E9] bg-[#FFF8FB] px-4 text-sm font-semibold text-[#8E3E5E] shadow-none hover:border-[#E8C7D4] hover:bg-[#F8E8EF] hover:text-[#8E3E5E]"
          >
            <LocateFixed size={17} />
            Gunakan Lokasi Saya
          </Button>

        </div>
      )}
    </div>
  );
}