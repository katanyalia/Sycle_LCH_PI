"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import {
  BadgeCheck,
  Building2,
  ChevronRight,
  ExternalLink,
  Hospital,
  Info,
  Loader2,
  LocateFixed,
  MapPin,
  Navigation,
  RefreshCw,
  Search,
  ShieldCheck,
  Stethoscope,
  UserRound,
  X,
} from "lucide-react";

import { useAssessment } from "@/context/AssessmentContext";
import { readLastLocation } from "@/lib/location/lastLocation";
import {
  findNearbyFacilitiesOffline,
  rememberHealthcareLocation,
} from "@/lib/healthcare/offlineNearby";

/* =========================
   BUTTON STYLES
========================= */

const PRIMARY_BUTTON =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-full border border-transparent !bg-[#B84E73] px-5 text-sm font-bold !text-white shadow-sm transition-colors duration-200 hover:!bg-[#8E3E5E] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#B84E73] focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50";

const SECONDARY_BUTTON =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-full border border-[#E8D5DE] bg-white px-5 text-sm font-bold text-[#8E3E5E] transition-colors duration-200 hover:border-[#B84E73] hover:bg-[#FFF8FB] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#B84E73] focus-visible:ring-offset-2";

const FILTER_BUTTON =
  "inline-flex min-h-10 items-center justify-center rounded-full border px-4 text-sm font-bold transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#B84E73] focus-visible:ring-offset-2";

/* =========================
   CONSTANTS
========================= */

const TYPE_FILTERS = [
  { value: "all", label: "Semua" },
  { value: "hospital", label: "Rumah sakit" },
  { value: "puskesmas", label: "Puskesmas" },
  { value: "clinic", label: "Klinik" },
  { value: "midwife", label: "Bidan" },
  { value: "doctor", label: "Praktik dokter" },
];

const TYPE_ICON = {
  hospital: Building2,
  puskesmas: Hospital,
  clinic: Stethoscope,
  midwife: UserRound,
  doctor: Stethoscope,
};

const COMPLETENESS = {
  lengkap: {
    label: "Data lengkap",
    className: "bg-[#E9F2EA] text-[#3E6E4B]",
    description: "Nama, alamat, dan layanan tersedia.",
  },
  sebagian: {
    label: "Data sebagian",
    className: "bg-[#FFF4E2] text-[#8A5A1E]",
    description:
      "Nama dan alamat tersedia, informasi layanan belum ada.",
  },
  terbatas: {
    label: "Data terbatas",
    className: "bg-[#F4EFF2] text-[#6E5F6C]",
    description: "Hanya nama dan titik lokasi yang tersedia.",
  },
};

const OFFLINE_FACILITY_MESSAGE =
  "Kamu sedang offline. Daftar fasilitas kesehatan butuh koneksi internet. Sambungkan internet, lalu tekan Coba lagi.";

const OFFLINE_NEEDS_GPS_MESSAGE =
  "Kamu sedang offline. Gunakan lokasi perangkat (GPS) untuk mencari fasilitas terdekat dari data yang tersimpan di perangkat.";

const OFFLINE_SEARCH_MESSAGE =
  "Kamu sedang offline. Pencarian lokasi butuh koneksi internet.";

/* =========================
   HELPERS
========================= */

function formatDistance(km) {
  if (km < 1) return `${Math.round(km * 1000)} m`;

  return `${km.toLocaleString("id-ID", {
    maximumFractionDigits: 1,
  })} km`;
}

function directionsUrl(facility) {
  return `https://www.google.com/maps/dir/?api=1&destination=${facility.lat},${facility.lon}`;
}

function osmUrl(facility) {
  if (facility.osmRef) {
    return `https://www.openstreetmap.org/${facility.osmRef}`;
  }

  return `https://www.openstreetmap.org/?mlat=${facility.lat}&mlon=${facility.lon}#map=17/${facility.lat}/${facility.lon}`;
}

function isConnectionError(error) {
  return (
    (typeof navigator !== "undefined" && navigator.onLine === false) ||
    error instanceof TypeError
  );
}

/* =========================
   MAIN PAGE
========================= */

export default function HealthcarePage() {
  const { environmentLocation, setEnvironmentLocation } =
    useAssessment();

  const [result, setResult] = useState(null);
  const [status, setStatus] = useState("idle");
  const [errorMessage, setErrorMessage] = useState("");

  const [activeType, setActiveType] = useState("all");
  const [selected, setSelected] = useState(null);

  // Pencarian lokasi
  const [searchText, setSearchText] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [searching, setSearching] = useState(false);
  const [locationMessage, setLocationMessage] = useState("");
  const [changingLocation, setChangingLocation] = useState(false);
  const [detectingLocation, setDetectingLocation] = useState(false);

  const closeButtonRef = useRef(null);

  const adm4 = environmentLocation?.adm4 ?? null;
  const latitude =
    environmentLocation?.coordinates?.latitude ?? null;
  const longitude =
    environmentLocation?.coordinates?.longitude ?? null;

  const hasLocation =
    Boolean(adm4) || (latitude !== null && longitude !== null);

  const showLocationPicker =
    !hasLocation || changingLocation;

  /* =========================
     LOAD FACILITIES
  ========================= */

  // Pulihkan lokasi terakhir dari perangkat bila halaman dibuka langsung (mis. saat offline).
  useEffect(() => {
    if (hasLocation) return;
    const saved = readLastLocation();
    if (!saved) return;

    const frame = requestAnimationFrame(() => {
      setEnvironmentLocation({
        adm4: saved.adm4 ?? null,
        coordinates: saved.coordinates ?? null,
      });
    });

    return () => cancelAnimationFrame(frame);
    // Hanya saat halaman pertama dibuka.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const loadFacilities = useCallback(async () => {
    if (!hasLocation) return;

    const params = new URLSearchParams();

    if (adm4) {
      params.set("adm4", adm4);
    } else {
      params.set("lat", String(latitude));
      params.set("lon", String(longitude));
    }

    setStatus("loading");
    setErrorMessage("");

    try {
      const response = await fetch(`/api/healthcare?${params}`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Data belum dapat dimuat.");
      }

      setResult(data);
      setStatus("ready");
      // Ingat titik lokasi desa/kelurahan agar bisa dipakai saat offline.
      rememberHealthcareLocation(adm4, data.location);
    } catch (error) {
      if (isConnectionError(error)) {
        // Offline: cari faskes terdekat dari snapshot OSM yang tersimpan di perangkat.
        const offlineResult = await findNearbyFacilitiesOffline({
          adm4,
          latitude,
          longitude,
        });

        if (!offlineResult.error) {
          setResult(offlineResult);
          setStatus("ready");
          return;
        }

        setErrorMessage(
          offlineResult.error === "no_location"
            ? OFFLINE_NEEDS_GPS_MESSAGE
            : OFFLINE_FACILITY_MESSAGE
        );
        setStatus("error");
        return;
      }

      setErrorMessage(error.message || "Data fasilitas belum dapat dimuat.");
      setStatus("error");
    }
  }, [hasLocation, adm4, latitude, longitude]);

  useEffect(() => {
    if (!hasLocation) return;

    const frame = requestAnimationFrame(() => {
      setChangingLocation(false);
      loadFacilities();
    });

    return () => cancelAnimationFrame(frame);
  }, [hasLocation, loadFacilities]);

  /* =========================
     SEARCH LOCATION
  ========================= */

  useEffect(() => {
    const query = searchText.trim();

    if (query.length < 3) return;

    const controller = new AbortController();

    const timeout = setTimeout(async () => {
      setSearching(true);
      setLocationMessage("");

      try {
        const response = await fetch(
          `/api/locations/search?q=${encodeURIComponent(query)}`,
          { signal: controller.signal }
        );

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || "Pencarian lokasi gagal.");
        }

        const items = Array.isArray(data.items)
          ? data.items
          : [];

        setSearchResults(items);

        setLocationMessage(
          items.length > 0
            ? "Pilih lokasi yang sesuai."
            : "Desa/kelurahan tidak ditemukan."
        );
      } catch (error) {
        if (error.name !== "AbortError") {
          setSearchResults([]);

          setLocationMessage(
            isConnectionError(error)
              ? OFFLINE_SEARCH_MESSAGE
              : error.message || "Pencarian lokasi gagal."
          );
        }
      } finally {
        if (!controller.signal.aborted) {
          setSearching(false);
        }
      }
    }, 400);

    return () => {
      clearTimeout(timeout);
      controller.abort();
    };
  }, [searchText]);

  /* =========================
     DETAIL MODAL
  ========================= */

  useEffect(() => {
    if (!selected) return;

    const previousOverflow = document.body.style.overflow;

    document.body.style.overflow = "hidden";

    function handleKeyDown(event) {
      if (event.key === "Escape") {
        setSelected(null);
      }
    }

    document.addEventListener("keydown", handleKeyDown);

    const frame = requestAnimationFrame(() =>
      closeButtonRef.current?.focus()
    );

    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", handleKeyDown);
      cancelAnimationFrame(frame);
    };
  }, [selected]);

  /* =========================
     FACILITY FILTERS
  ========================= */

  const facilities = useMemo(
    () => result?.facilities ?? [],
    [result]
  );

  const typeCounts = useMemo(() => {
    const counts = { all: facilities.length };

    for (const facility of facilities) {
      counts[facility.type] =
        (counts[facility.type] ?? 0) + 1;
    }

    return counts;
  }, [facilities]);

  const visibleFacilities = useMemo(
    () =>
      activeType === "all"
        ? facilities
        : facilities.filter(
            (facility) => facility.type === activeType
          ),
    [facilities, activeType]
  );

  /* =========================
     LOCATION ACTIONS
  ========================= */

  function handleDeviceLocation() {
    if (!navigator.geolocation) {
      setLocationMessage(
        "Browser tidak mendukung deteksi lokasi. Cari nama desa/kelurahan."
      );
      return;
    }

    setDetectingLocation(true);
    setLocationMessage("Sedang mendeteksi lokasi…");

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setDetectingLocation(false);
        setLocationMessage("");
        setSearchResults([]);
        setSearchText("");
        setChangingLocation(false);

        setEnvironmentLocation({
          adm4: null,
          coordinates: {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
          },
        });
      },
      () => {
        setDetectingLocation(false);

        setLocationMessage(
          "Izin lokasi ditolak atau gagal. Silakan cari nama desa/kelurahan."
        );
      },
      { timeout: 10000 }
    );
  }

  function chooseVillage(item) {
    setSearchResults([]);
    setSearchText("");
    setLocationMessage("");
    setChangingLocation(false);
    setActiveType("all");

    setEnvironmentLocation({
      adm4: item.code,
      coordinates: null,
    });
  }

  function clearLocationSearch() {
    setSearchText("");
    setSearchResults([]);
    setLocationMessage("");
    setSearching(false);
  }

  /* =========================
     RENDER
  ========================= */

  return (
    <main className="min-h-screen bg-[#FFF8FB] px-4 py-8 text-[#332A35] sm:px-6 lg:px-8">
      <div className="mx-auto max-w-6xl space-y-8">
        {/* HERO */}
        <section className="relative isolate overflow-hidden rounded-[28px] border border-[#F0DFE7] bg-white p-6 shadow-[0_5px_24px_rgb(120_70_90_/_6%)] sm:p-9 lg:p-12">
          <div
            aria-hidden="true"
            className="pointer-events-none absolute -right-16 -top-20 -z-10 size-64 rounded-full bg-[#F8E8EF] opacity-80 blur-3xl"
          />

          <div
            aria-hidden="true"
            className="pointer-events-none absolute -bottom-24 right-36 -z-10 size-56 rounded-full bg-[#E9F2EA] opacity-90 blur-3xl"
          />

          <div className="relative max-w-[760px]">
            <div className="inline-flex items-center gap-2 rounded-full border border-[#EAD7E0] bg-[#FFF8FB] px-3.5 py-2 text-sm font-extrabold text-[#984568]">
              <Stethoscope className="size-4" />
              Healthcare SYCLE
            </div>

            <p className="mt-5 text-xs font-extrabold uppercase tracking-[0.17em] text-[#B84E73]">
              INFORMASI LAYANAN KESEHATAN
            </p>

            <h1 className="mt-3 text-3xl font-extrabold leading-tight tracking-[-0.035em] sm:text-4xl lg:text-[42px]">
              Temukan fasilitas kesehatan
              <span className="block text-[#B84E73]">
                terdekat dari lokasimu.
              </span>
            </h1>

            <p className="mt-5 max-w-[620px] text-base leading-7 text-[#756774] sm:text-lg sm:leading-8">
              Temukan rumah sakit, puskesmas, klinik, bidan,
              dan praktik dokter di sekitarmu. Daftar fasilitas
              diurutkan berdasarkan jarak dari lokasi pilihanmu.
            </p>

            <div className="mt-6 inline-flex items-center gap-2 rounded-full border border-[#EAD7E0] bg-[#FFF8FB] px-4 py-2 text-sm font-bold text-[#765C6D]">
              <ShieldCheck className="size-4 text-[#B84E73]" />
              Informasi fasilitas kesehatan di sekitarmu
            </div>
          </div>
        </section>

        {/* LOCATION SECTION */}
        <section
          aria-labelledby="judul-lokasi"
          className="rounded-[24px] border border-[#F0E3E9] bg-white p-5 shadow-[0_5px_24px_rgb(120_70_90_/_5%)] sm:p-7"
        >
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div className="flex min-w-0 items-start gap-3">
              <span className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-[#F8E8EF] text-[#B84E73]">
                <MapPin className="size-5" />
              </span>

              <div className="min-w-0">
                <p className="text-xs font-extrabold uppercase tracking-[0.13em] text-[#B84E73]">
                  LOKASI PENCARIAN
                </p>

                <h2
                  id="judul-lokasi"
                  className="mt-1 text-lg font-extrabold"
                >
                  {hasLocation && result?.location
                    ? result.location.label
                    : "Pilih lokasimu"}
                </h2>

                <p className="mt-1 text-sm leading-6 text-[#766976]">
                  {hasLocation && result?.location
                    ? `Titik lokasi: ${result.location.coordinateSource}.`
                    : "Lokasi diperlukan untuk mengurutkan fasilitas berdasarkan jarak."}
                </p>
              </div>
            </div>

            {hasLocation && !changingLocation && (
              <button
                type="button"
                onClick={() => {
                  setChangingLocation(true);
                  clearLocationSearch();
                }}
                className={SECONDARY_BUTTON}
              >
                <MapPin className="size-4" />
                Ganti lokasi
              </button>
            )}
          </div>

          {showLocationPicker && (
            <div className="mt-6 space-y-5">

              {/* LOCATION SEARCH */}

              <div>
                <label
                  htmlFor="healthcare-location-search"
                  className="mb-2 block text-sm font-bold text-[#514351]"
                >
                  Cari desa atau kelurahan
                </label>

                <div className="flex h-12 items-center gap-3 rounded-xl border border-[#E8DCE3] bg-[#FFFCFE] px-4 transition-colors focus-within:border-[#B84E73] focus-within:ring-2 focus-within:ring-[#B84E73]/10">
                  <Search className="size-5 shrink-0 text-[#B84E73]" />

                  <input
                    id="healthcare-location-search"
                    type="search"
                    value={searchText}
                    onChange={(event) => {
                      const value = event.target.value;

                      setSearchText(value);

                      if (value.trim().length < 3) {
                        setSearchResults([]);
                        setLocationMessage("");
                        setSearching(false);
                      }
                    }}
                    placeholder="Contoh: Cileungsi atau Jati Padang"
                    autoComplete="off"
                    className="h-full w-full bg-transparent text-sm text-[#332A35] outline-none placeholder:text-[#A99AA3]"
                  />

                  {searching && (
                    <Loader2
                      className="size-5 shrink-0 animate-spin text-[#B84E73]"
                      aria-label="Sedang mencari"
                    />
                  )}

                  {searchText && !searching && (
                    <button
                      type="button"
                      onClick={clearLocationSearch}
                      aria-label="Hapus pencarian"
                      className="rounded-full p-1 text-[#8B7D8A] transition-colors hover:bg-[#F8E8EF] hover:text-[#B84E73]"
                    >
                      <X className="size-4" />
                    </button>
                  )}
                </div>

                <p className="mt-2 text-xs leading-5 text-[#8B7D8A]">
                  Ketik minimal 3 huruf untuk melihat rekomendasi lokasi.
                </p>
              </div>

              {/* SEARCH RESULTS */}

              {searchResults.length > 0 && (
                <div className="overflow-hidden rounded-2xl border border-[#F0E3E9] bg-white shadow-[0_5px_20px_rgb(120_70_90_/_6%)]">
                  <div className="border-b border-[#F3E6EC] bg-[#FFF8FB] px-4 py-3">
                    <p className="text-xs font-extrabold text-[#8E3E5E]">
                      Rekomendasi lokasi
                    </p>
                  </div>

                  <ul className="max-h-64 divide-y divide-[#F3E6EC] overflow-y-auto">
                    {searchResults.map((item) => (
                      <li key={item.code}>
                        <button
                          type="button"
                          onClick={() => chooseVillage(item)}
                          className="flex w-full items-start gap-3 px-4 py-3.5 text-left transition-colors hover:bg-[#FFF8FB] focus-visible:bg-[#FFF8FB] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[#B84E73]"
                        >
                          <span className="mt-0.5 flex size-9 shrink-0 items-center justify-center rounded-xl bg-[#F8E8EF] text-[#B84E73]">
                            <MapPin className="size-4" />
                          </span>

                          <span className="min-w-0 flex-1">
                            <span className="block text-sm font-bold text-[#332A35]">
                              {item.village || item.name}
                            </span>

                            <span className="mt-0.5 block text-xs leading-5 text-[#766976]">
                              {[
                                item.district,
                                item.regency,
                                item.province,
                              ]
                                .filter(Boolean)
                                .join(", ")}
                            </span>
                          </span>

                          <span className="mt-1 text-xs font-bold text-[#B84E73]">
                            Pilih
                          </span>
                        </button>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* LOCATION MESSAGE */}

              {locationMessage && (
                <p
                  className="rounded-xl bg-[#FFF8FB] px-4 py-3 text-sm leading-6 text-[#8E3E5E]"
                  aria-live="polite"
                >
                  {locationMessage}
                </p>
              )}

              {/* GPS */}

              <div className="flex flex-col gap-4 border-t border-[#F0E7EC] pt-5 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="text-sm font-extrabold text-[#514351]">
                    Gunakan lokasi saat ini
                  </p>

                  <p className="mt-1 text-xs leading-5 text-[#8B7D8A]">
                    Izinkan akses lokasi pada browser untuk mendeteksi posisimu.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={handleDeviceLocation}
                  disabled={detectingLocation}
                  className={PRIMARY_BUTTON}
                >
                  {detectingLocation ? (
                    <Loader2 className="size-4 animate-spin" />
                  ) : (
                    <LocateFixed className="size-4" />
                  )}

                  {detectingLocation
                    ? "Mendeteksi lokasi..."
                    : "Gunakan Lokasiku"}
                </button>
              </div>

              {changingLocation && hasLocation && (
                <button
                  type="button"
                  onClick={() => {
                    setChangingLocation(false);
                    clearLocationSearch();
                  }}
                  className="text-sm font-bold text-[#8E3E5E] transition-colors hover:text-[#B84E73]"
                >
                  Batal mengganti lokasi
                </button>
              )}
            </div>
          )}
        </section>

        {/* FACILITIES */}

        {hasLocation && (
          <section
            aria-labelledby="judul-faskes"
            className="space-y-5"
          >
            {/* SECTION HEADER */}

            <div className="flex flex-wrap items-end justify-between gap-3">
              <div>
                <p className="text-xs font-extrabold uppercase tracking-[0.13em] text-[#B84E73]">
                  LAYANAN KESEHATAN
                </p>

                <h2
                  id="judul-faskes"
                  className="mt-1 text-xl font-extrabold sm:text-2xl"
                >
                  Fasilitas kesehatan terdekat
                </h2>

                {status === "ready" && (
                  <p
                    className="mt-1 text-sm text-[#766976]"
                    aria-live="polite"
                  >
                    {visibleFacilities.length} fasilitas dalam radius{" "}
                    {result.radiusKm} km, diurutkan dari yang terdekat.
                  </p>
                )}
              </div>

              {status === "ready" && (
                <button
                  type="button"
                  onClick={loadFacilities}
                  className={SECONDARY_BUTTON}
                >
                  <RefreshCw className="size-4" />
                  Muat ulang
                </button>
              )}
            </div>

            {/* FILTERS */}

            {status === "ready" && facilities.length > 0 && (
              <div
                className="flex flex-wrap gap-2"
                role="group"
                aria-label="Filter jenis fasilitas"
              >
                {TYPE_FILTERS.filter(
                  (type) =>
                    type.value === "all" ||
                    typeCounts[type.value]
                ).map((type) => {
                  const active = activeType === type.value;

                  return (
                    <button
                      key={type.value}
                      type="button"
                      onClick={() => setActiveType(type.value)}
                      aria-pressed={active}
                      className={`${FILTER_BUTTON} ${
                        active
                          ? "border-[#B84E73] !bg-[#B84E73] !text-white"
                          : "border-[#E8D5DE] bg-white text-[#8E3E5E] hover:border-[#B84E73] hover:bg-[#FFF8FB]"
                      }`}
                    >
                      {type.label}{" "}
                      <span className={active ? "text-white/90" : "text-[#A38C9A]"}>
                        ({typeCounts[type.value] ?? 0})
                      </span>
                    </button>
                  );
                })}
              </div>
            )}

            {/* LOADING */}

            {status === "loading" && (
              <div className="flex flex-col items-center justify-center gap-3 rounded-[24px] border border-[#F0E3E9] bg-white px-6 py-12 text-center">
                <Loader2 className="size-7 animate-spin text-[#B84E73]" />

                <div>
                  <p className="font-extrabold text-[#332A35]">
                    Sedang mencari fasilitas kesehatan
                  </p>

                  <p className="mt-1 text-sm text-[#766976]">
                    Mohon tunggu sebentar.
                  </p>
                </div>
              </div>
            )}

            {/* ERROR */}

            {status === "error" && (
              <div className="rounded-[24px] border border-[#F2D6B8] bg-[#FFF6EC] p-6">
                <div className="flex items-start gap-3">
                  <Info className="mt-0.5 size-5 shrink-0 text-[#A35F2A]" />

                  <div>
                    <p className="font-extrabold text-[#7A4A1F]">
                      Data fasilitas belum dapat dimuat
                    </p>

                    <p className="mt-1 text-sm leading-6 text-[#6E5236]">
                      {errorMessage}
                    </p>

                    <button
                      type="button"
                      onClick={loadFacilities}
                      className="mt-4 inline-flex min-h-10 items-center justify-center gap-2 rounded-full bg-[#B84E73] px-5 text-sm font-bold !text-white transition-colors hover:bg-[#8E3E5E]"
                    >
                      <RefreshCw className="size-4" />
                      Coba lagi
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* MODE OFFLINE */}

            {status === "ready" && result?.offline && (
              <p
                role="status"
                className="rounded-2xl border border-[#F2D6B8] bg-[#FFF6EC] p-4 text-sm leading-6 text-[#6E5236]"
              >
                <strong>Mode offline.</strong> Fasilitas dihitung di
                perangkatmu dari data OpenStreetMap per{" "}
                {result.snapshotDate}. Petunjuk arah dan peta butuh
                internet, dan faskes mitra SYCLE belum ditampilkan.
              </p>
            )}

            {/* OSM NOTICE */}

            {status === "ready" && !result.osmAvailable && (
              <div className="rounded-2xl border border-[#F2D6B8] bg-[#FFF6EC] p-4">
                <p className="text-sm leading-6 text-[#6E5236]">
                  Data OpenStreetMap sedang tidak dapat diakses.
                  Yang tampil hanya faskes mitra SYCLE (bila ada).
                  Coba muat ulang beberapa saat lagi.
                </p>
              </div>
            )}

            {/* EMPTY STATE */}

            {status === "ready" && visibleFacilities.length === 0 && (
              <div className="rounded-[24px] border border-dashed border-[#E4CBD7] bg-white px-6 py-12 text-center">
                <span className="mx-auto flex size-14 items-center justify-center rounded-2xl bg-[#F8E8EF]">
                  <Hospital className="size-7 text-[#B84E73]" />
                </span>

                <h3 className="mt-4 font-extrabold text-[#332A35]">
                  Belum ada fasilitas ditemukan
                </h3>

                <p className="mx-auto mt-1 max-w-md text-sm leading-6 text-[#766976]">
                  Belum ada fasilitas kesehatan yang tercatat
                  untuk kategori ini di sekitar lokasi pilihanmu.
                  Coba pilih kategori lain.
                </p>
              </div>
            )}

            {/* FACILITY CARDS */}

            {status === "ready" && visibleFacilities.length > 0 && (
              <ol className="grid grid-cols-1 gap-4 md:grid-cols-2">
                {visibleFacilities.map((facility) => {
                  const Icon =
                    TYPE_ICON[facility.type] ?? Hospital;

                  const quality =
                    COMPLETENESS[facility.completeness] ??
                    COMPLETENESS.terbatas;

                  return (
                    <li
                      key={facility.id}
                      className="flex flex-col rounded-[24px] border border-[#F0E3E9] bg-white p-5 shadow-[0_5px_24px_rgb(120_70_90_/_5%)] transition-all duration-200 hover:-translate-y-0.5 hover:border-[#E5C6D4] hover:shadow-[0_10px_26px_rgb(120_70_90_/_8%)] sm:p-6"
                    >
                      <div className="flex items-start gap-3">
                        <span className="flex size-12 shrink-0 items-center justify-center rounded-2xl bg-[#F8E8EF] text-[#B84E73]">
                          <Icon className="size-6" />
                        </span>

                        <div className="min-w-0 flex-1">
                          <div className="flex flex-wrap items-center gap-1.5">
                            <span className="rounded-full bg-[#F8E8EF] px-2.5 py-1 text-xs font-bold text-[#8E3E5E]">
                              {facility.typeLabel}
                            </span>

                            {facility.isPartner && (
                              <span className="inline-flex items-center gap-1 rounded-full bg-[#EEEAF8] px-2.5 py-1 text-xs font-bold text-[#5E4A86]">
                                <BadgeCheck className="size-3.5" />
                                Mitra SYCLE
                              </span>
                            )}
                          </div>

                          <h3 className="mt-2 text-base font-extrabold leading-snug text-[#332A35] sm:text-lg">
                            {facility.name}
                          </h3>
                        </div>
                      </div>

                      {/* DISTANCE */}

                      <div className="mt-4 flex items-center gap-2 rounded-xl bg-[#FFF8FB] px-3 py-2.5">
                        <Navigation className="size-4 shrink-0 text-[#B84E73]" />

                        <span className="text-xs font-semibold text-[#766976]">
                          Jarak dari lokasi pilihan
                        </span>

                        <span className="ml-auto text-sm font-extrabold text-[#B84E73]">
                          {formatDistance(facility.distanceKm)}
                        </span>
                      </div>

                      {/* ADDRESS */}

                      <div className="mt-4 flex items-start gap-2">
                        <MapPin className="mt-1 size-4 shrink-0 text-[#A38C9A]" />

                        <p className="text-sm leading-6 text-[#766976]">
                          {facility.address ??
                            "Alamat jalan belum tercatat"}

                          {facility.area && (
                            <span className="mt-0.5 block text-xs text-[#8B7D8A]">
                              {facility.area}
                            </span>
                          )}
                        </p>
                      </div>

                      {/* CARD FOOTER */}

                      <div className="mt-auto flex flex-wrap items-center justify-between gap-3 border-t border-[#F0E7EC] pt-4 mt-5">
                        <span
                          className={`inline-flex min-h-7 items-center rounded-full px-3 py-1 text-xs font-bold ${quality.className}`}
                        >
                          {quality.label}
                        </span>

                        <button
                          type="button"
                          onClick={() => setSelected(facility)}
                          className="inline-flex min-h-10 items-center justify-center gap-2 rounded-full border border-[#E8D5DE] bg-white px-4 text-sm font-bold text-[#8E3E5E] transition-colors hover:border-[#B84E73] hover:bg-[#FFF8FB] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#B84E73] focus-visible:ring-offset-2"
                        >
                          <Info className="size-4" />
                          Lihat detail
                          <ChevronRight className="size-4" />
                        </button>
                      </div>
                    </li>
                  );
                })}
              </ol>
            )}

            {/* DATA SOURCE */}

            {status === "ready" && (
              <div className="flex items-start gap-2 rounded-xl bg-[#F8F4F6] p-4">
                <Info className="mt-0.5 size-4 shrink-0 text-[#8E3E5E]" />

                <p className="text-xs leading-6 text-[#8B7D8A]">
                  Data faskes ©{" "}
                  <a
                    href="https://www.openstreetmap.org/copyright"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-bold text-[#8E3E5E] underline-offset-2 hover:underline"
                  >
                    kontributor OpenStreetMap
                  </a>{" "}
                  (ODbL), snapshot {result.snapshotDate}. Data
                  terbuka bisa belum lengkap atau belum diperbarui.
                  Label Mitra SYCLE tidak memengaruhi urutan.
                </p>
              </div>
            )}
          </section>
        )}
      </div>

      {/* FACILITY DETAIL MODAL */}

      {selected && (
        <div
          className="fixed inset-0 z-50 flex items-end justify-center bg-[#332A35]/45 p-0 backdrop-blur-[3px] sm:items-center sm:p-5"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) {
              setSelected(null);
            }
          }}
        >
          <section
            role="dialog"
            aria-modal="true"
            aria-labelledby="judul-detail-faskes"
            className="relative max-h-[90dvh] w-full max-w-[560px] overflow-y-auto rounded-t-[28px] border border-[#F0E3E9] bg-[#FFFDFE] p-6 shadow-2xl sm:rounded-[28px] sm:p-7"
          >
            {/* CLOSE */}

            <button
              ref={closeButtonRef}
              type="button"
              onClick={() => setSelected(null)}
              aria-label="Tutup detail fasilitas"
              className="absolute right-5 top-5 flex size-10 items-center justify-center rounded-full border border-[#F0E3E9] bg-white text-[#8A7A85] transition-colors hover:bg-[#F8E8EF] hover:text-[#B84E73] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#B84E73]"
            >
              <X className="size-5" />
            </button>

            {/* MODAL HEADER */}

            <div className="pr-12">
              <p className="text-xs font-extrabold uppercase tracking-[0.13em] text-[#B84E73]">
                DETAIL FASILITAS
              </p>

              <div className="mt-3 flex flex-wrap items-center gap-1.5">
                <span className="rounded-full bg-[#F8E8EF] px-2.5 py-1 text-xs font-bold text-[#8E3E5E]">
                  {selected.typeLabel}
                </span>

                {selected.isPartner && (
                  <span className="inline-flex items-center gap-1 rounded-full bg-[#EEEAF8] px-2.5 py-1 text-xs font-bold text-[#5E4A86]">
                    <BadgeCheck className="size-3.5" />
                    Mitra SYCLE
                  </span>
                )}
              </div>

              <h2
                id="judul-detail-faskes"
                className="mt-3 text-2xl font-extrabold leading-tight text-[#332A35]"
              >
                {selected.name}
              </h2>

              <p className="mt-2 inline-flex items-center gap-2 text-sm font-bold text-[#B84E73]">
                <Navigation className="size-4" />
                {formatDistance(selected.distanceKm)} dari lokasimu
              </p>
            </div>

            {/* DETAIL INFORMATION */}

            <div className="mt-6 space-y-3">
              <div className="rounded-2xl border border-[#F0E3E9] bg-white p-4">
                <p className="text-xs font-extrabold uppercase tracking-wide text-[#B84E73]">
                  Alamat
                </p>

                <p className="mt-2 flex items-start gap-2 text-sm leading-6 text-[#6F6370]">
                  <MapPin className="mt-1 size-4 shrink-0 text-[#A38C9A]" />

                  {selected.address ??
                    "Alamat jalan belum tercatat"}
                </p>
              </div>

              {selected.area && (
                <div className="rounded-2xl border border-[#F0E3E9] bg-white p-4">
                  <p className="text-xs font-extrabold uppercase tracking-wide text-[#B84E73]">
                    Wilayah
                  </p>

                  <p className="mt-2 text-sm leading-6 text-[#6F6370]">
                    {selected.area}
                  </p>
                </div>
              )}

              <div className="rounded-2xl border border-[#F0E3E9] bg-white p-4">
                <p className="text-xs font-extrabold uppercase tracking-wide text-[#B84E73]">
                  Layanan
                </p>

                <p className="mt-2 text-sm leading-6 text-[#6F6370]">
                  {selected.services.length > 0
                    ? selected.services.join(", ")
                    : "Informasi layanan belum tercatat"}
                </p>
              </div>

              <div className="rounded-2xl border border-[#F0E3E9] bg-white p-4">
                <p className="text-xs font-extrabold uppercase tracking-wide text-[#B84E73]">
                  Kelengkapan data
                </p>

                <p className="mt-2 text-sm leading-6 text-[#6F6370]">
                  {
                    (
                      COMPLETENESS[selected.completeness] ??
                      COMPLETENESS.terbatas
                    ).label
                  }
                  .{" "}
                  {
                    (
                      COMPLETENESS[selected.completeness] ??
                      COMPLETENESS.terbatas
                    ).description
                  }
                </p>
              </div>

              <div className="rounded-2xl border border-[#F0E3E9] bg-white p-4">
                <p className="text-xs font-extrabold uppercase tracking-wide text-[#B84E73]">
                  Sumber data
                </p>

                <p className="mt-2 text-sm leading-6 text-[#6F6370]">
                  {selected.source === "mitra"
                    ? "Data mitra SYCLE"
                    : `OpenStreetMap (data terbuka), snapshot ${result?.snapshotDate ?? ""}`}
                </p>
              </div>
            </div>

            {/* MAP ACTIONS */}

            <div className="mt-6 grid gap-3 border-t border-[#F0E7EC] pt-5 sm:grid-cols-2">
              <a
                href={directionsUrl(selected)}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex min-h-11 items-center justify-center gap-2 rounded-full border border-transparent !bg-[#B84E73] px-4 text-sm font-bold !text-white transition-colors hover:!bg-[#8E3E5E] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#B84E73] focus-visible:ring-offset-2"
              >
                <Navigation className="size-4" />
                Petunjuk arah
                {result?.offline && (
                  <span className="text-xs font-semibold opacity-80">
                    (butuh internet)
                  </span>
                )}
                <span className="sr-only">
                  (buka Google Maps di tab baru)
                </span>
              </a>

              <a
                href={osmUrl(selected)}
                target="_blank"
                rel="noopener noreferrer"
                className={SECONDARY_BUTTON}
              >
                <ExternalLink className="size-4" />
                Lihat di peta
                {result?.offline && (
                  <span className="text-xs font-semibold opacity-80">
                    (butuh internet)
                  </span>
                )}
                <span className="sr-only">
                  (buka OpenStreetMap di tab baru)
                </span>
              </a>
            </div>

            {/* DISCLAIMER */}

            <p className="mt-5 rounded-xl bg-[#F8F4F6] p-4 text-xs leading-6 text-[#8A7A85]">
              Sebelum berkunjung, pastikan jam layanan langsung
              ke fasilitas. Butuh informasi tanda bahaya? Baca{" "}
              <Link
                href="/education/guidance"
                className="font-bold text-[#8E3E5E] underline-offset-2 hover:text-[#B84E73] hover:underline"
              >
                Panduan Perlindungan
              </Link>
              .
            </p>
          </section>
        </div>
      )}
    </main>
  );
}