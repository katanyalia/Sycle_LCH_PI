"use client";

import { useEffect, useState } from "react";
import {
  Sun,
  Cloud,
  Cloudy,
  CloudSun,
  CloudRain,
  CloudDrizzle,
  CloudLightning,
  Droplets,
  Wind,
  ThermometerSun,
} from "lucide-react";

function toFiniteNumber(...values) {
  for (const value of values) {
    if (
      value !== null &&
      value !== undefined &&
      value !== "" &&
      Number.isFinite(Number(value))
    ) {
      return Number(value);
    }
  }

  return null;
}

function formatNumber(value) {
  if (typeof value !== "number" || !Number.isFinite(value)) {
    return "Belum tersedia";
  }

  return Number(value.toFixed(1)).toLocaleString("id-ID", {
    maximumFractionDigits: 1,
  });
}

function formatDate(date, timezone) {
  try {
    return new Intl.DateTimeFormat("id-ID", {
      day: "numeric",
      month: "short",
      year: "numeric",
      ...(timezone ? { timeZone: timezone } : {}),
    }).format(date);
  } catch {
    return new Intl.DateTimeFormat("id-ID", {
      day: "numeric",
      month: "short",
      year: "numeric",
    }).format(date);
  }
}

function formatTime(date, timezone) {
  try {
    return new Intl.DateTimeFormat("id-ID", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
      ...(timezone ? { timeZone: timezone } : {}),
    }).format(date);
  } catch {
    return new Intl.DateTimeFormat("id-ID", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    }).format(date);
  }
}

function formatLocation(location) {
  if (!location) {
    return { city: "Lokasi belum dipilih", region: "" };
  }

  if (typeof location === "object") {
    return {
      city:
        location.village ||
        location.city ||
        location.shortLabel ||
        location.label ||
        "Lokasi belum dipilih",
      region: [
        location.district,
        location.regency,
        location.province,
      ]
        .filter(Boolean)
        .join(", "),
    };
  }

  const separator = String(location).includes(">")
    ? ">"
    : ",";

  const parts = String(location)
    .split(separator)
    .map((part) => part.trim())
    .filter(Boolean);

  if (parts.length === 1) {
    return { city: parts[0], region: "" };
  }

  if (separator === ">") {
    const [province, regency, district, village] = parts;

    return {
      city: village || regency || parts[parts.length - 1],
      region: [district, regency, province]
        .filter(Boolean)
        .join(", "),
    };
  }

  // Format GPS: Kelurahan, Kecamatan, Kota/Kabupaten, Provinsi
  const [village, district, regency, province] = parts;

  return {
    city: village,
    region: [district, regency, province]
      .filter(Boolean)
      .join(", "),
  };
}

function indicatorValue(indicator, fallbackUnit = "") {
  const value = indicator?.value;

  if (
    typeof value !== "number" ||
    !Number.isFinite(value) ||
    indicator?.status === "unavailable"
  ) {
    return "Belum tersedia";
  }

  const unit = indicator?.unit ?? fallbackUnit;
  const formatted = formatNumber(value);

  if (!unit) return formatted;
  if (unit === "%") return `${formatted}%`;

  return `${formatted} ${unit}`;
}

function getSourceName(indicator, fallback = null) {
  if (indicator?.source?.name) return indicator.source.name;
  return fallback || "Belum tersedia";
}

// Satu baris keterangan kecil per kartu: sumber data, ditambah detail singkat bila perlu.
// Bila sumber belum ada (data belum tersedia), baris ini tidak ditampilkan.
function sourceNote(indicator, fallbackSource = null, detail = null) {
  if (!indicator || indicator.status === "unavailable") return null;

  const source = indicator.source?.name || fallbackSource;
  if (!source) return null;

  if (indicator.status === "stale") {
    return `Sumber: ${source} · data sudah melewati batas kesegaran`;
  }

  return detail
    ? `Sumber: ${source} · ${detail}`
    : `Sumber: ${source}`;
}

function getUvStatus(value, indicator) {
  if (indicator?.status === "unavailable" || value === null) {
    return { label: "Belum tersedia", level: "unknown" };
  }

  if (indicator?.category?.label) {
    return {
      label: indicator.category.label,
      level:
        value >= 11 ? "danger" :
        value >= 8 ? "high" :
        value >= 6 ? "high" :
        value >= 3 ? "moderate" : "good",
    };
  }

  if (value < 3) return { label: "Rendah", level: "good" };
  if (value < 6) return { label: "Sedang", level: "moderate" };
  if (value < 8) return { label: "Tinggi", level: "high" };
  if (value < 11) return { label: "Sangat tinggi", level: "high" };

  return { label: "Ekstrem", level: "danger" };
}

function getTemperatureStatus(value) {
  if (value === null) {
    return { label: "Belum tersedia", level: "unknown" };
  }

  if (value < 20) return { label: "Sejuk", level: "good" };
  if (value < 30) return { label: "Normal", level: "good" };
  if (value < 35) return { label: "Panas", level: "moderate" };

  return { label: "Sangat panas", level: "high" };
}

function getHumidityStatus(value) {
  if (value === null) {
    return { label: "Belum tersedia", level: "unknown" };
  }

  if (value < 30) return { label: "Kering", level: "moderate" };
  if (value <= 60) return { label: "Rentang nyaman", level: "good" };
  if (value <= 80) return { label: "Lembap", level: "moderate" };

  return { label: "Sangat lembap", level: "high" };
}

function getAirQualityStatus(indicator) {
  if (
    !indicator ||
    indicator.status === "unavailable" ||
    !Number.isFinite(indicator.value)
  ) {
    return { label: "Belum tersedia", level: "unknown" };
  }

  // Gunakan kategori dari adapter/backend jika tersedia.
  if (indicator.category?.label) {
    const label = indicator.category.label;
    const normalized = label.toLowerCase();

    let level = "moderate";

    if (
      normalized.includes("baik") ||
      normalized.includes("good")
    ) {
      level = "good";
    } else if (
      normalized.includes("sangat tidak sehat") ||
      normalized.includes("berbahaya") ||
      normalized.includes("hazardous")
    ) {
      level = "danger";
    } else if (
      normalized.includes("tidak sehat") ||
      normalized.includes("unhealthy")
    ) {
      level = "high";
    }

    return { label, level };
  }

  // Fallback kategori berdasarkan standar yang sesuai.
  const value = indicator.value;
  const isUsAqi =
    indicator.standard === "US AQI" ||
    indicator.unit === "US AQI" ||
    indicator.source?.name?.toLowerCase().includes("open-meteo");

  if (isUsAqi) {
    if (value <= 50) return { label: "Baik", level: "good" };
    if (value <= 100) return { label: "Sedang", level: "moderate" };
    if (value <= 150) {
      return {
        label: "Tidak sehat bagi kelompok sensitif",
        level: "high",
      };
    }
    if (value <= 200) return { label: "Tidak sehat", level: "high" };
    if (value <= 300) {
      return { label: "Sangat tidak sehat", level: "danger" };
    }
    return { label: "Berbahaya", level: "danger" };
  }

  if (value <= 50) return { label: "Baik", level: "good" };
  if (value <= 100) return { label: "Sedang", level: "moderate" };
  if (value <= 200) return { label: "Tidak sehat", level: "high" };
  if (value <= 300) {
    return { label: "Sangat tidak sehat", level: "danger" };
  }

  return { label: "Berbahaya", level: "danger" };
}

function getHeatIndexStatus(value) {
  if (value === null) {
    return { label: "Belum tersedia", level: "unknown" };
  }

  // Ambang perkiraan Heat Index NWS/NOAA dalam Celsius.
  if (value < 27) return { label: "Risiko rendah", level: "good" };
  if (value < 32) return { label: "Waspada", level: "moderate" };
  if (value < 40) return { label: "Sangat waspada", level: "high" };
  if (value < 52) return { label: "Bahaya", level: "danger" };

  return { label: "Bahaya ekstrem", level: "danger" };
}

function WeatherConditionIcon({ condition }) {
  const normalized = (condition || "").toLowerCase().trim();

  // Petir
  if (
    normalized.includes("petir") ||
    normalized.includes("thunder") ||
    normalized.includes("badai")
  ) {
    return <CloudLightning size={36} strokeWidth={1.6} color="#E6A23C" />;
  }

  // Hujan lebat
  if (
    normalized.includes("hujan lebat") ||
    normalized.includes("heavy rain")
  ) {
    return <CloudRain size={36} strokeWidth={1.6} color="#4A90C2" />;
  }

  // Hujan ringan
  if (
    normalized.includes("hujan ringan") ||
    normalized.includes("gerimis") ||
    normalized.includes("drizzle")
  ) {
    return <CloudDrizzle size={36} strokeWidth={1.6} color="#4A90C2" />;
  }

  // Hujan
  if (
    normalized.includes("hujan") ||
    normalized.includes("rain")
  ) {
    return <CloudRain size={36} strokeWidth={1.6} color="#4A90C2" />;
  }

  // Cerah berawan — harus sebelum pemeriksaan berawan
  if (
    normalized.includes("cerah berawan") ||
    normalized.includes("partly cloudy") ||
    normalized.includes("sebagian berawan")
  ) {
    return <CloudSun size={36} strokeWidth={1.6} color="#E6A23C" />;
  }

  // Berawan tebal atau mendung
  if (
    normalized.includes("berawan tebal") ||
    normalized.includes("mendung") ||
    normalized.includes("overcast")
  ) {
    return <Cloudy size={36} strokeWidth={1.6} color="#8A9BAA" />;
  }

  // Berawan biasa
  if (
    normalized.includes("berawan") ||
    normalized.includes("cloudy")
  ) {
    return <Cloud size={36} strokeWidth={1.6} color="#8A9BAA" />;
  }

  // Cerah
  return <Sun size={36} strokeWidth={1.6} color="#E6A23C" />;
}

function StatusBadge({ status }) {
  return (
    <span
      className={`metric-status status-${status.level}`}
      role="status"
    >
      {status.label}
    </span>
  );
}

export default function WeatherCard({
  location,
  adm4,
  coordinates,
}) {
  const [currentTime, setCurrentTime] = useState(null);
  const [weather, setWeather] = useState(null);
  const [environment, setEnvironment] = useState(null);
  const [weatherStatus, setWeatherStatus] = useState("idle");
  const [environmentStatus, setEnvironmentStatus] = useState("idle");
  // true bila data lingkungan berasal dari simpanan offline (service worker), bukan kondisi terkini.
  const [environmentStored, setEnvironmentStored] = useState(false);

  const formattedLocation = formatLocation(location);
  const forecast = weather?.forecasts?.[0] ?? null;
  const timezone = environment?.location?.timezone;
  const indicators = environment?.indicators;

  const temperatureIndicator = indicators?.temperature;
  const humidityIndicator = indicators?.humidity;
  const heatIndexIndicator = indicators?.heatIndex;
  const airQualityIndicator = indicators?.airQuality;
  const uvIndicator = indicators?.uv;

  const temperatureValue =
    ["ok", "stale"].includes(temperatureIndicator?.status)
      ? toFiniteNumber(temperatureIndicator.value)
      : null;

  const humidityValue =
    ["ok", "stale"].includes(humidityIndicator?.status)
      ? toFiniteNumber(humidityIndicator.value)
      : null;

  const heatIndexValue =
    heatIndexIndicator?.status !== "unavailable"
      ? toFiniteNumber(heatIndexIndicator?.value)
      : null;

  const uvValue =
    uvIndicator?.status !== "unavailable"
      ? toFiniteNumber(uvIndicator?.value)
      : null;

  const airQualityValue =
    airQualityIndicator?.status !== "unavailable"
      ? toFiniteNumber(airQualityIndicator?.value)
      : null;

  const temperatureStatus = getTemperatureStatus(temperatureValue);
  const humidityStatus = getHumidityStatus(humidityValue);
  const uvStatus = getUvStatus(uvValue, uvIndicator);
  const airQualityStatus = getAirQualityStatus(airQualityIndicator);
  const heatIndexStatus = getHeatIndexStatus(heatIndexValue);

  useEffect(() => {
    const updateTime = () => setCurrentTime(new Date());

    updateTime();
    const interval = setInterval(updateTime, 60_000);

    return () => clearInterval(interval);
  }, []);

  // Prakiraan cuaca wilayah berdasarkan kode desa/kelurahan.
  useEffect(() => {
    let cancelled = false;

    async function fetchWeather() {
      setWeather(null);

      if (!adm4) {
        setWeatherStatus("idle");
        return;
      }

      setWeatherStatus("loading");

      try {
        const response = await fetch(
          `/api/weather?adm4=${encodeURIComponent(adm4)}`,
          { cache: "no-store" }
        );

        const result = await response.json();

        if (!response.ok) {
          throw new Error(
            result.error || result.message || "Data cuaca gagal dimuat."
          );
        }

        if (!cancelled) {
          setWeather(result);
          setWeatherStatus("success");
        }
      } catch (error) {
        if (!cancelled) {
          console.error("Gagal memuat prakiraan cuaca:", error);
          setWeather(null);
          setWeatherStatus("error");
        }
      }
    }

    fetchWeather();

    return () => {
      cancelled = true;
    };
  }, [adm4]);

  // Data lingkungan: kode wilayah atau koordinat perangkat.
  useEffect(() => {
    let cancelled = false;

    async function fetchEnvironment() {
      const latitude = toFiniteNumber(
        coordinates?.latitude,
        coordinates?.lat,
        weather?.location?.latitude,
        weather?.location?.lat
      );

      const longitude = toFiniteNumber(
        coordinates?.longitude,
        coordinates?.lon,
        weather?.location?.longitude,
        weather?.location?.lon
      );

      const params = new URLSearchParams();

      if (adm4) {
        params.set("adm4", adm4);
      } else if (
        latitude !== null &&
        longitude !== null &&
        latitude >= -90 &&
        latitude <= 90 &&
        longitude >= -180 &&
        longitude <= 180
      ) {
        params.set("lat", String(latitude));
        params.set("lon", String(longitude));
      } else {
        setEnvironment(null);
        setEnvironmentStatus("unavailable");
        return;
      }

      setEnvironment(null);
      setEnvironmentStatus("loading");

      try {
        const response = await fetch(
          `/api/environment?${params.toString()}`,
          { cache: "no-store" }
        );

        const result = await response.json();

        if (!response.ok) {
          throw new Error(result.error || "Data lingkungan gagal dimuat.");
        }

        if (!cancelled) {
          setEnvironment(result);
          setEnvironmentStatus("success");
          setEnvironmentStored(response.headers.get("x-sycle-cache") === "stored");
        }
      } catch (error) {
        if (!cancelled) {
          console.error("Gagal memuat data lingkungan:", error);
          setEnvironment(null);
          setEnvironmentStatus("error");
        }
      }
    }

    fetchEnvironment();

    return () => {
      cancelled = true;
    };
  }, [
    adm4,
    coordinates?.latitude,
    coordinates?.longitude,
    coordinates?.lat,
    coordinates?.lon,
    weather?.location?.latitude,
    weather?.location?.longitude,
    weather?.location?.lat,
    weather?.location?.lon,
  ]);

  const temperatureSource =
    temperatureIndicator?.source?.name ?? "Belum tersedia";

  const humiditySource =
    humidityIndicator?.source?.name ?? "Belum tersedia";

  const temperatureDescription =
    temperatureIndicator?.fallbackReason ||
    (temperatureIndicator?.timeUtc
      ? `${temperatureIndicator.dataType === "prakiraan" ? "Prakiraan" : "Data lingkungan"} · ${formatTime(
          new Date(temperatureIndicator.timeUtc),
          timezone
        )}`
      : forecast
        ? "Data prakiraan cuaca"
        : "");

  const metrics = [
    {
      icon: <Droplets size={18} strokeWidth={1.8} />,
      label: "Kelembapan",
      value:
        humidityValue !== null
          ? `${formatNumber(humidityValue)}%`
          : "Belum tersedia",
      status: humidityStatus,
      note: sourceNote(
        humidityIndicator,
        null,
        humidityIndicator?.dataType === "model"
          ? "model Open-Meteo"
          : humidityIndicator?.dataType === "prakiraan"
            ? "prakiraan BMKG"
            : null
      ),
      type: "humidity",
    },
    {
      icon: <Sun size={18} strokeWidth={1.8} />,
      label: "Indeks UV",
      value: uvValue !== null ? formatNumber(uvValue) : "Belum tersedia",
      status: uvStatus,
      note: sourceNote(uvIndicator),
      type: "uv",
    },
    {
      icon: <Wind size={18} strokeWidth={1.8} />,
      label: "Kualitas udara",
      value:
        airQualityValue !== null
          ? `${formatNumber(airQualityValue)} ${airQualityIndicator?.unit || ""}`.trim()
          : "Belum tersedia",
      status: airQualityStatus,
      note: sourceNote(
        airQualityIndicator,
        null,
        airQualityIndicator?.station?.name
          ? `Stasiun ${airQualityIndicator.station.name}`
          : null
      ),
      type: "air-quality",
    },
    {
      icon: <ThermometerSun size={18} strokeWidth={1.8} />,
      label: "Heat Index",
      value:
        heatIndexValue !== null
          ? `${formatNumber(heatIndexValue)} °C`
          : "Belum tersedia",
      status: heatIndexStatus,
      note:
        heatIndexValue !== null
          ? heatIndexIndicator?.source?.attribution ||
            sourceNote(heatIndexIndicator)
          : null,
      type: "heat-index",
    },
  ];

  const isLoading =
    environmentStatus === "loading" ||
    (adm4 && weatherStatus === "loading");

  return (
    <section className="weather-card">
      <div className="weather-header">
        <div className="weather-heading">
          <span className="weather-eyebrow">KONDISI LINGKUNGAN</span>

          <h2 className="weather-location">
            {formattedLocation.city}
          </h2>

          {formattedLocation.region && (
            <p className="weather-region">{formattedLocation.region}</p>
          )}

          <p className="weather-subtitle">
            Gambaran cuaca dan paparan lingkungan
          </p>
        </div>

        <div className="weather-datetime">
          <span className="datetime-label">Waktu lokal</span>
          <strong>
            {currentTime ? formatTime(currentTime, timezone) : "--:--"}
          </strong>
          <span>
            {currentTime
              ? formatDate(currentTime, timezone)
              : "Memuat tanggal..."}
          </span>
        </div>
      </div>

      {environmentStored && environmentStatus === "success" && (
        <p
          role="status"
          className="mb-3 inline-flex rounded-full bg-[#FFF4E5] px-3 py-1 text-xs font-bold text-[#7A4B00]"
        >
          Data tersimpan — bukan kondisi terkini
        </p>
      )}

      <div className="weather-main">
        <div className="weather-temperature">
          <span className="weather-sun" aria-hidden="true">
            <WeatherConditionIcon condition={forecast?.condition} />
          </span>

          <div className="temperature-reading">
            <span className="temperature-value">
              {temperatureValue !== null
                ? formatNumber(temperatureValue)
                : "—"}
            </span>

            {temperatureValue !== null && (
              <span className="temperature-unit">°C</span>
            )}
          </div>
          <span className="weather-condition">
            {forecast?.condition || "Kondisi cuaca"}
          </span>

          <StatusBadge status={temperatureStatus} />

          {temperatureValue !== null && (
            <span className="temperature-source">
              Sumber: {temperatureSource}
              {temperatureIndicator?.status === "stale" && " · Data tersimpan"}
            </span>
          )}
        </div>

        <div className="weather-feels">
          <span className="feels-label">Kondisi terasa</span>

          <strong className="feels-description">
            {heatIndexValue !== null
              ? getHeatDescription(heatIndexValue)
              : "Belum tersedia"}
          </strong>
        </div>
      </div>

      <div className="weather-metrics">
        {metrics.map((metric) => (
          <div
            key={metric.type}
            className={`weather-metric metric-${metric.type}`}
          >
            <div className="metric-top">
              <span className="metric-icon" aria-hidden="true">
                {metric.icon}
              </span>

              <span className="metric-label">{metric.label}</span>
            </div>

            <strong className="metric-value">{metric.value}</strong>

            <StatusBadge status={metric.status} />

            {metric.note && (
              <span className="metric-source">{metric.note}</span>
            )}
          </div>
        ))}
      </div>

      <div className="weather-notice">
        <span className="notice-icon" aria-hidden="true">!</span>
        <div>
          <strong>Perhatikan paparan panas dan UV</strong>
          <p>
            Lindungi diri dari paparan matahari langsung, cari tempat
            teduh saat diperlukan, dan cukup minum. Indikator lingkungan
            merupakan informasi pendukung, bukan diagnosis kesehatan.
          </p>
        </div>
      </div>

      <div className="weather-source">
        <span className="source-indicator" />
        <span>
          {isLoading
            ? "Sedang memperbarui data lingkungan..."
            : environmentStatus === "error"
              ? "Data lingkungan gagal dimuat. Periksa koneksi atau lokasi yang dipilih."
              : environmentStatus === "unavailable"
                ? "Pilih lokasi atau gunakan lokasi perangkat untuk memuat data lingkungan."
                : environmentStatus === "success" && environmentStored
                  ? "Kamu sedang offline. Ini data terakhir yang tersimpan; sambungkan internet untuk data terbaru."
                : environmentStatus === "success"
                  ? "Waktu data mengikuti informasi dari masing-masing sumber."
                  : "Menunggu informasi data lingkungan."}

          {adm4 && weatherStatus === "loading"
            ? " Memuat prakiraan cuaca..."
            : adm4 && weatherStatus === "error"
              ? " Prakiraan cuaca wilayah tidak berhasil dimuat."
              : ""}
        </span>
      </div>
    </section>
  );
}

function getHeatDescription(heatIndex) {
  if (heatIndex < 27) return "Relatif nyaman";
  if (heatIndex < 32) return "Hangat";
  if (heatIndex < 41) return "Panas dan lembap";
  if (heatIndex < 54) return "Sangat panas";
  return "Panas ekstrem";
}