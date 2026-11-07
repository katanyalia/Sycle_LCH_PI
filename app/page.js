"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAssessment } from "@/context/AssessmentContext";
import { MapPin, LocateFixed, Search } from "lucide-react";
import HeroSection from "@/components/home/HeroSection";
import WeatherCard from "@/components/home/WeatherCard";
import ActivitySelector from "@/components/home/ActivitySelector";

export default function HomePage() {
  const router = useRouter();

  const {
    location,
    setLocation,
    setEnvironmentLocation,
    activity,
    setActivity,
    resetAssessment,
  } = useAssessment();

  const [coordinates, setCoordinates] = useState(null);
  const [locationStatus, setLocationStatus] = useState("");
  const [locationResults, setLocationResults] = useState([]);
  const [isSearchingLocation, setIsSearchingLocation] = useState(false);
  const [searchText, setSearchText] = useState("");
  const [selectedLocation, setSelectedLocation] = useState(null);
  const [selectedRegion, setSelectedRegion] = useState(null);
  const [selectedAdm4, setSelectedAdm4] = useState(null);
  const [hasChosenActivity, setHasChosenActivity] = useState(false);

  useEffect(() => {
    const query = searchText.trim();

    if (query.length < 3 || selectedLocation === query) {
      setLocationResults([]);
      return;
    }

    const controller = new AbortController();

    const timeoutId = setTimeout(async () => {
      setIsSearchingLocation(true);

      try {
        const response = await fetch(
          `/api/locations/search?q=${encodeURIComponent(query)}`,
          { signal: controller.signal }
        );

        const result = await response.json();

        if (!response.ok) {
          throw new Error(result.error || "Pencarian wilayah gagal.");
        }

        setLocationResults(
          Array.isArray(result.items) ? result.items : []
        );

        setLocationStatus(
          result.items?.length
            ? "Pilih lokasi yang sesuai dari daftar."
            : "Wilayah tidak ditemukan. Coba kata kunci lain."
        );
      } catch (error) {
        if (error.name !== "AbortError") {
          setLocationResults([]);
          setLocationStatus(error.message || "Pencarian wilayah gagal.");
        }
      } finally {
        if (!controller.signal.aborted) {
          setIsSearchingLocation(false);
        }
      }
    }, 350);

    return () => {
      clearTimeout(timeoutId);
      controller.abort();
    };
  }, [searchText, selectedLocation]);

  const hasSelectedLocation = Boolean(
    selectedAdm4 || (coordinates && selectedLocation)
  );

  function startCheckin() {
    if (!hasChosenActivity || !activity) {
      return;
    }

    resetAssessment("guest");
    setActivity(activity);
    router.push(`/assessment?activity=${activity}`);
  }

  async function handleUseMyLocation() {
    setHasChosenActivity(false);

    if (!navigator.geolocation) {
      setLocationStatus("Browser tidak mendukung deteksi lokasi.");
      return;
    }

    setLocationStatus("Sedang mendeteksi lokasi...");

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const latitude = position.coords.latitude;
        const longitude = position.coords.longitude;

        setCoordinates({ latitude, longitude });
        setSelectedAdm4(null);
        setSelectedRegion(null);

        setEnvironmentLocation({
          adm4: null,
          coordinates: { latitude, longitude },
        });

        setLocationStatus("GPS berhasil. Mencari nama wilayah...");

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

          if (!result.location) {
            setLocationStatus(
              "Koordinat ditemukan, tetapi nama wilayah belum tersedia. Silakan isi lokasi secara manual."
            );
            return;
          }

          const locationName = result.location;

          setLocation(locationName);
          setSelectedLocation(locationName);
          setSearchText(locationName);
          setLocationResults([]);

          setLocationStatus(
            `Lokasi ditemukan: ${locationName}. Periksa nama wilayah dan koreksi jika kurang tepat.`
          );
        } catch (error) {
          setLocationStatus(
            error.message ||
              "Nama wilayah gagal ditemukan. Silakan isi lokasi secara manual."
          );
        }
      },
      (error) => {
        const messages = {
          1: "Izin lokasi ditolak. Periksa izin lokasi situs di browser.",
          2: "Posisi tidak tersedia. Periksa layanan lokasi perangkat.",
          3: "Permintaan lokasi kehabisan waktu. Coba lagi.",
        };

        setLocationStatus(
          messages[error.code] ?? `GPS gagal: ${error.message}`
        );
      },
      {
        enableHighAccuracy: false,
        timeout: 20000,
        maximumAge: 60000,
      }
    );
  }

  async function handleLocationSearch() {
    const query = searchText.trim();

    if (query.length < 3) {
      setLocationResults([]);
      setLocationStatus("Ketik minimal 3 huruf untuk mencari lokasi.");
      return;
    }

    if (selectedLocation === query) {
      setLocationResults([]);
      return;
    }

    setIsSearchingLocation(true);
    setLocationResults([]);
    setLocationStatus("Sedang mencari wilayah...");

    try {
      const response = await fetch(
        `/api/locations/search?q=${encodeURIComponent(query)}`
      );

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Pencarian wilayah gagal.");
      }

      const items = Array.isArray(result.items) ? result.items : [];

      setLocationResults(items);
      setLocationStatus(
        items.length
          ? `Ditemukan ${items.length} hasil. Pilih wilayah yang sesuai.`
          : "Wilayah tidak ditemukan. Coba nama wilayah lain."
      );
    } catch (error) {
      setLocationStatus(error.message || "Pencarian wilayah gagal.");
    } finally {
      setIsSearchingLocation(false);
    }
  }

  function handleSelectLocation(item) {
    const village =
      item.village ||
      item.name ||
      item.nama ||
      item.label ||
      "";

    const label =
      item.label ||
      item._displayPath ||
      item.full_path ||
      item.fullPath ||
      item.path ||
      village;

    const adm4 = item.code ?? item.kode ?? null;

    setHasChosenActivity(false);

    if (!adm4) {
      setLocationStatus(
        "Lokasi ditemukan, tetapi kode wilayah BMKG tidak tersedia. Coba pilih hasil wilayah lainnya."
      );
      return;
    }

    // PERBAIKAN: simpan kode wilayah ke state yang digunakan WeatherCard.
    setSelectedAdm4(adm4);

    const locationPath = [
      item.province,
      item.regency,
      item.district,
      village,
    ]
      .filter(Boolean)
      .join(" > ");

    setSelectedLocation(village);
    setSearchText(village);
    setLocation(locationPath);
    setLocationResults([]);
    setCoordinates(null);
    setSelectedRegion(item);

    setEnvironmentLocation({
      adm4,
      coordinates: null,
    });

    setLocationStatus(
      `Lokasi dipilih: ${label}. Kode wilayah BMKG: ${adm4}.`
    );
  }

  return (
    <div className="home-page">
      <HeroSection onStartCheckin={startCheckin} />

      <section id="environment" className="home-dashboard">
        <div className="weather-column">
          <div className="weather-wrapper">
            <div className="location-panel">
              <div className="location-heading">
                <div className="location-icon">
                  <MapPin size={20} />
                </div>

                <div className="location-heading-text">
                  <label htmlFor="location">Lokasi kamu</label>

                  <p>
                    Gunakan lokasi agar kondisi lingkungan sesuai
                    dengan area tempatmu berada.
                  </p>
                </div>
              </div>

              <div className="location-input-wrapper">
                <MapPin
                  size={18}
                  className="location-input-icon"
                />

                <input
                  id="location"
                  type="text"
                  value={searchText}
                  onChange={(event) => {
                    const value = event.target.value;

                    setSearchText(value);
                    setHasChosenActivity(false);
                    setSelectedLocation(null);
                    setSelectedRegion(null);
                    setSelectedAdm4(null);
                    setCoordinates(null);

                    setEnvironmentLocation({
                      adm4: null,
                      coordinates: null,
                    });

                    setLocationResults([]);
                    setLocationStatus("");
                  }}
                  onKeyDown={(event) => {
                    if (event.key === "Enter") {
                      handleLocationSearch();
                    }
                  }}
                  placeholder="Cari kota atau wilayah..."
                />

                <button
                  type="button"
                  className="location-search-button"
                  aria-label="Cari lokasi"
                  onClick={handleLocationSearch}
                >
                  <Search size={18} />
                </button>
              </div>

              {locationResults.length > 0 && (
                <div
                  className="location-results"
                  role="listbox"
                  aria-label="Hasil pencarian lokasi"
                  style={{
                    maxHeight: "240px",
                    overflowY: "auto",
                    border: "1px solid #E8DCE2",
                    borderRadius: "12px",
                    marginTop: "8px",
                    background: "#FFFFFF",
                  }}
                >
                  {locationResults.map((item, index) => {
                    const name =
                      item.village ??
                      item.name ??
                      item.nama ??
                      "";

                    const label =
                      item.label ??
                      item._displayPath ??
                      item.full_path ??
                      item.fullPath ??
                      item.path ??
                      name;

                    return (
                      <button
                        key={
                          item.code ??
                          item.kode ??
                          `${label}-${index}`
                        }
                        type="button"
                        role="option"
                        aria-selected={false}
                        onClick={() => handleSelectLocation(item)}
                        style={{
                          display: "block",
                          width: "100%",
                          padding: "12px 14px",
                          textAlign: "left",
                          background: "#FFFFFF",
                          border: "none",
                          borderBottom: "1px solid #F3E9EE",
                          cursor: "pointer",
                        }}
                      >
                        <strong>{name || label}</strong>

                        {label !== name && (
                          <span
                            style={{
                              display: "block",
                              fontSize: "12px",
                              color: "#746873",
                              marginTop: "4px",
                            }}
                          >
                            {[
                              item.district,
                              item.regency,
                              item.province,
                            ]
                              .filter(Boolean)
                              .join(", ")}
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>
              )}

              {isSearchingLocation && (
                <p className="location-status" role="status">
                  Mencari wilayah...
                </p>
              )}

              <button
                type="button"
                className="location-detect-button"
                onClick={handleUseMyLocation}
              >
                <LocateFixed size={17} />
                Gunakan lokasi saya
              </button>

              {locationStatus && (
                <p className="location-status" role="status">
                  {locationStatus}
                </p>
              )}
            </div>

            <WeatherCard
              location={location}
              adm4={selectedAdm4}
              coordinates={coordinates}
            />
          </div>
        </div>

        <div className="activity-column">
          <ActivitySelector
            activity={activity}
            setActivity={(value) => {
              setActivity(value);
              setHasChosenActivity(true);
            }}
            onStartCheckin={startCheckin}
            hasSelectedLocation={hasSelectedLocation}
            hasChosenActivity={hasChosenActivity}
          />
        </div>
      </section>
    </div>
  );
}