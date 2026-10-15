import { ENVIRONMENT_CONFIG } from "@/lib/environment/config";
import { fetchJson } from "@/lib/environment/http";
import { minutesBetween, parseUtcDateTime } from "@/lib/environment/time";

const { revalidateSeconds, timeoutMs, maxSlotDistanceMinutes } = ENVIRONMENT_CONFIG.bmkg;

export const BMKG_SOURCE = {
  name: "BMKG",
  attribution: "Sumber: BMKG",
  detail: "Data Prakiraan Cuaca Terbuka BMKG",
  url: "https://data.bmkg.go.id/prakiraan-cuaca/",
};

export function fetchBmkgForecast(adm4) {
  const url = `https://api.bmkg.go.id/publik/prakiraan-cuaca?adm4=${encodeURIComponent(adm4)}`;
  return fetchJson("bmkg", url, { revalidate: revalidateSeconds, timeoutMs });
}

const isNumber = (value) => typeof value === "number" && Number.isFinite(value);

// Mengubah respons BMKG menjadi lokasi + satu slot prakiraan yang paling dekat dengan `now`.
export function parseBmkgForecast(json, now = new Date()) {
  const lokasi = json?.lokasi;
  const lat = Number(lokasi?.lat);
  const lon = Number(lokasi?.lon);
  const location =
    lokasi && Number.isFinite(lat) && Number.isFinite(lon)
      ? {
          village: lokasi.desa,
          district: lokasi.kecamatan,
          regency: lokasi.kotkab,
          province: lokasi.provinsi,
          lat,
          lon,
          timezone: lokasi.timezone ?? null,
        }
      : null;

  const slots = (json?.data?.[0]?.cuaca ?? []).flat();
  let best = null;
  for (const slot of slots) {
    const time = parseUtcDateTime(slot?.utc_datetime);
    if (!time) continue;
    const distance = minutesBetween(time, now);
    if (!best || distance < best.distance) best = { slot, time, distance };
  }

  if (!location) return { location: null, slot: null, reason: "invalid_location" };
  if (!best || best.distance > maxSlotDistanceMinutes) return { location, slot: null, reason: "no_current_slot" };

  const { slot, time } = best;
  return {
    location,
    slot: {
      timeUtc: time.toISOString(),
      analysisDate: slot.analysis_date ?? null,
      temperature: isNumber(slot.t) ? slot.t : null,
      humidity: isNumber(slot.hu) ? slot.hu : null,
    },
    reason: null,
  };
}
