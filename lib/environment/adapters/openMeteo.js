import { ENVIRONMENT_CONFIG } from "@/lib/environment/config";
import { fetchJson } from "@/lib/environment/http";
import { minutesBetween, parseLocalWithOffset } from "@/lib/environment/time";

const { revalidateSeconds, timeoutMs, maxAgeMinutes } = ENVIRONMENT_CONFIG.openMeteo;

export const OPEN_METEO_WEATHER_SOURCE = {
  name: "Open-Meteo",
  attribution: "Open-Meteo (CC BY 4.0)",
  detail: "Open-Meteo Weather Forecast API — data model",
  url: "https://open-meteo.com/",
};

export const OPEN_METEO_AIR_SOURCE = {
  name: "Open-Meteo",
  attribution: "Open-Meteo (CC BY 4.0)",
  detail: "Open-Meteo Air Quality API — data model",
  url: "https://open-meteo.com/",
};

const coords = (lat, lon) => `latitude=${lat}&longitude=${lon}&timezone=auto`;

export function fetchOpenMeteoWeather(lat, lon) {
  const url = `https://api.open-meteo.com/v1/forecast?${coords(lat, lon)}&current=temperature_2m,relative_humidity_2m,uv_index`;
  return fetchJson("open_meteo_weather", url, { revalidate: revalidateSeconds, timeoutMs });
}

export function fetchOpenMeteoAirQuality(lat, lon) {
  const url = `https://air-quality-api.open-meteo.com/v1/air-quality?${coords(lat, lon)}&current=us_aqi`;
  return fetchJson("open_meteo_air", url, { revalidate: revalidateSeconds, timeoutMs });
}

const isNumber = (value) => typeof value === "number" && Number.isFinite(value);

// Mengambil nilai "current" beserta waktu UTC-nya, dan mengecek satuan & kesegaran.
export function parseOpenMeteoCurrent(json, now = new Date()) {
  const current = json?.current;
  const time = parseLocalWithOffset(current?.time, json?.utc_offset_seconds);
  if (!current || !time) return { values: null, timeUtc: null, reason: "invalid_response" };
  if (minutesBetween(time, now) > maxAgeMinutes) return { values: null, timeUtc: time.toISOString(), reason: "stale" };

  const units = json.current_units ?? {};
  const values = {
    temperature: isNumber(current.temperature_2m) && units.temperature_2m === "°C" ? current.temperature_2m : null,
    humidity: isNumber(current.relative_humidity_2m) && units.relative_humidity_2m === "%" ? current.relative_humidity_2m : null,
    uvIndex: isNumber(current.uv_index) ? current.uv_index : null,
    usAqi: isNumber(current.us_aqi) && (units.us_aqi ?? "USAQI") === "USAQI" ? current.us_aqi : null,
  };
  return { values, timeUtc: time.toISOString(), timezone: json.timezone ?? null, reason: null };
}
