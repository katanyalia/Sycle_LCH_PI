// Menyusun kondisi lingkungan untuk satu lokasi dari beberapa sumber (Master Draft Tahap 6, LOCKED):
//   Suhu & Kelembapan  → BMKG (prakiraan), cadangan Open-Meteo (model)
//   Kualitas udara     → ISPU KLH/BPLH (pengamatan), cadangan Open-Meteo US AQI (model)
//   Indeks UV          → Open-Meteo (model), tanpa cadangan fiktif
//   Heat Index         → dihitung SYCLE (NWS/NOAA) dari suhu + RH yang berasal dari sumber & waktu yang sama
// Kegagalan satu sumber tidak menghapus indikator lain. Tidak ada angka yang dikarang.

import { BMKG_SOURCE, fetchBmkgForecast, parseBmkgForecast } from "@/lib/environment/adapters/bmkg";
import { ISPU_SOURCE, fetchIspuStations, selectIspuStation } from "@/lib/environment/adapters/ispu";
import {
  OPEN_METEO_AIR_SOURCE,
  OPEN_METEO_WEATHER_SOURCE,
  fetchOpenMeteoAirQuality,
  fetchOpenMeteoWeather,
  parseOpenMeteoCurrent,
} from "@/lib/environment/adapters/openMeteo";
import { ispuCategory, usAqiCategory, uvCategory } from "@/lib/environment/categories";
import { ENVIRONMENT_CONFIG } from "@/lib/environment/config";
import { computeHeatIndexC, isValidHeatIndexInput } from "@/lib/environment/heatIndex";
import { findVillageByCode } from "@/lib/repositories/regionRepository";

const settle = async (promise) => {
  try {
    return { ok: true, data: await promise };
  } catch (error) {
    return { ok: false, reason: error?.reason ?? "error" };
  }
};

function unavailable(id, label, message) {
  return { id, label, status: "unavailable", message };
}

function indicator(fields) {
  return { status: "ok", isFallback: false, fallbackReason: null, category: null, standard: null, ...fields };
}

const DEVICE_NOT_MAPPED = "Lokasi perangkat belum dipetakan ke kode desa BMKG. Pilih kelurahan/desa untuk memakai data BMKG.";

export async function getEnvironmentSnapshot(input, now = new Date()) {
  // ---------- Lokasi ----------
  let place = null;
  let coords = input.coords ?? null;
  let bmkg = null;

  if (input.kind === "village") {
    place = findVillageByCode(input.adm4);
    if (!place) return { error: "not_found" };
    const result = await settle(fetchBmkgForecast(input.adm4));
    bmkg = result.ok ? parseBmkgForecast(result.data, now) : { location: null, slot: null, reason: result.reason };
    if (bmkg.location) coords = { lat: bmkg.location.lat, lon: bmkg.location.lon };
  }

  const location = {
    kind: input.kind,
    code: place?.code ?? null,
    label: place ? place.label : "Lokasi perangkatmu",
    shortLabel: place ? `${place.village}, ${place.regency}` : "Lokasi perangkatmu",
    lat: coords?.lat ?? null,
    lon: coords?.lon ?? null,
    timezone: bmkg?.location?.timezone ?? null,
    coordinateSource: input.kind === "device" ? "Perangkat (dibulatkan ± 1 km)" : bmkg?.location ? "Titik desa/kelurahan dari BMKG" : coords ? "Titik desa/kelurahan (tersimpan dari permintaan sebelumnya)" : null,
  };

  // ---------- Sumber berbasis koordinat (paralel) ----------
  const [weatherRes, airRes, ispuRes] = coords
    ? await Promise.all([
        settle(fetchOpenMeteoWeather(coords.lat, coords.lon)),
        settle(fetchOpenMeteoAirQuality(coords.lat, coords.lon)),
        settle(fetchIspuStations()),
      ])
    : [{ ok: false, reason: "no_coordinates" }, { ok: false, reason: "no_coordinates" }, { ok: false, reason: "no_coordinates" }];

  const weather = weatherRes.ok ? parseOpenMeteoCurrent(weatherRes.data, now) : null;
  const air = airRes.ok ? parseOpenMeteoCurrent(airRes.data, now) : null;
  const ispu = ispuRes.ok && coords ? selectIspuStation(ispuRes.data, coords.lat, coords.lon, now) : null;

  // ---------- Suhu & kelembapan (berpasangan, sumber & waktu sama) ----------
  let pair = null;
  const bmkgSlot = bmkg?.slot;
  if (bmkgSlot && isValidHeatIndexInput(bmkgSlot.temperature, bmkgSlot.humidity)) {
    pair = {
      temperature: bmkgSlot.temperature,
      humidity: bmkgSlot.humidity,
      source: BMKG_SOURCE,
      dataType: "prakiraan",
      timeUtc: bmkgSlot.timeUtc,
      timeNote: "Waktu slot prakiraan (per 3 jam)",
      isFallback: false,
      fallbackReason: null,
    };
  } else if (weather?.values && isValidHeatIndexInput(weather.values.temperature, weather.values.humidity)) {
    pair = {
      temperature: weather.values.temperature,
      humidity: weather.values.humidity,
      source: OPEN_METEO_WEATHER_SOURCE,
      dataType: "model",
      timeUtc: weather.timeUtc,
      timeNote: "Waktu data model (per 15 menit)",
      isFallback: true,
      fallbackReason: input.kind === "device" ? DEVICE_NOT_MAPPED : "Prakiraan BMKG untuk lokasi ini belum tersedia saat ini.",
    };
  }

  const pairBase = pair && {
    source: pair.source,
    dataType: pair.dataType,
    timeUtc: pair.timeUtc,
    timeNote: pair.timeNote,
    isFallback: pair.isFallback,
    fallbackReason: pair.fallbackReason,
  };

  const temperature = pair
    ? indicator({ id: "temperature", label: "Suhu udara", value: pair.temperature, unit: "°C", ...pairBase })
    : unavailable("temperature", "Suhu udara", "Data suhu belum tersedia.");

  const humidity = pair
    ? indicator({ id: "humidity", label: "Kelembapan relatif", value: pair.humidity, unit: "%", ...pairBase })
    : unavailable("humidity", "Kelembapan relatif", "Data kelembapan belum tersedia.");

  // ---------- Heat Index ----------
  const heatValue = pair ? computeHeatIndexC(pair.temperature, pair.humidity) : null;
  const heatIndex =
    heatValue !== null
      ? indicator({
          id: "heatIndex",
          label: "Heat Index",
          value: heatValue,
          unit: "°C",
          source: { name: "Perhitungan SYCLE", attribution: "Dihitung SYCLE (metode NWS/NOAA)", detail: "Rumus Heat Index NWS/NOAA (Rothfusz + penyesuaian)", url: "https://www.wpc.ncep.noaa.gov/html/heatindex_equation.shtml" },
          dataType: "perhitungan",
          timeUtc: pair.timeUtc,
          timeNote: "Mengikuti waktu data suhu & kelembapan",
          method: "NWS/NOAA",
          inputs: { temperature: pair.temperature, humidity: pair.humidity, source: pair.source.name, dataType: pair.dataType },
        })
      : unavailable("heatIndex", "Heat Index", "Indeks Panas belum tersedia.");

  // ---------- Kualitas udara ----------
  let airQuality;
  const station = ispu?.station;
  const usAqi = air?.values?.usAqi ?? null;
  const ispuIndicator = (isFresh) =>
    indicator({
      id: "airQuality",
      label: "Kualitas udara",
      status: isFresh ? "ok" : "stale",
      value: station.value,
      unit: "ISPU",
      standard: "ISPU",
      category: ispuCategory({ label: station.categoryLabel, color: station.categoryColor }),
      source: ISPU_SOURCE,
      dataType: "pengamatan",
      timeUtc: station.timeUtc,
      timeNote: `Waktu pengukuran stasiun (${station.zone})`,
      station: { name: station.name, regency: station.regency, distanceKm: station.distanceKm, parameter: station.parameter },
    });

  if (station?.isFresh) {
    airQuality = ispuIndicator(true);
  } else if (Number.isFinite(usAqi) && usAqi >= 0) {
    const reason = !ispuRes.ok
      ? "Data ISPU belum dapat diambil saat ini."
      : station
        ? "Data ISPU stasiun terdekat sudah lebih dari 3 jam."
        : `Tidak ada stasiun ISPU dalam radius ${ENVIRONMENT_CONFIG.ispu.maxDistanceKm} km dari lokasi ini.`;
    airQuality = indicator({
      id: "airQuality",
      label: "Kualitas udara",
      value: usAqi,
      unit: "US AQI",
      standard: "US AQI",
      category: usAqiCategory(usAqi),
      source: OPEN_METEO_AIR_SOURCE,
      dataType: "model",
      timeUtc: air.timeUtc,
      timeNote: "Waktu data model (per jam)",
      isFallback: true,
      fallbackReason: `${reason} Ditampilkan US AQI sebagai data cadangan — US AQI bukan ISPU.`,
    });
  } else if (station) {
    airQuality = ispuIndicator(false);
  } else {
    airQuality = unavailable("airQuality", "Kualitas udara", "Data kualitas udara belum tersedia.");
  }

  // ---------- Indeks UV ----------
  const uvValue = weather?.values?.uvIndex;
  const uv = Number.isFinite(uvValue) && uvValue >= 0
    ? indicator({
        id: "uv",
        label: "Indeks UV",
        value: Math.round(uvValue * 10) / 10,
        unit: "",
        standard: "Skala WHO",
        category: uvCategory(uvValue),
        source: OPEN_METEO_WEATHER_SOURCE,
        dataType: "model",
        timeUtc: weather.timeUtc,
        timeNote: "Waktu data model (per 15 menit)",
      })
    : unavailable("uv", "Indeks UV", "Data indeks UV belum tersedia.");

  location.timezone = location.timezone ?? weather?.timezone ?? air?.timezone ?? "Asia/Jakarta";

  return {
    location,
    retrievedAt: now.toISOString(),
    indicators: { temperature, humidity, heatIndex, airQuality, uv },
  };
}
