import { ENVIRONMENT_CONFIG } from "@/lib/environment/config";
import { fetchJson } from "@/lib/environment/http";
import { distanceKm } from "@/lib/environment/geo";
import { minutesBetween, parseZonedDateTime } from "@/lib/environment/time";

const { revalidateSeconds, timeoutMs, maxDistanceKm, maxAgeMinutes } = ENVIRONMENT_CONFIG.ispu;

// K-22: endpoint aplikasi ISPU (tidak terdokumentasi). Dipakai untuk demo dengan fallback otomatis.
export const ISPU_SOURCE = {
  name: "KLH/BPLH — ISPU",
  attribution: "KLH/BPLH — ISPU",
  detail: "Indeks Standar Pencemar Udara, Kementerian Lingkungan Hidup / BPLH",
  url: "https://ispu.kemenlh.go.id/app/",
};

export function fetchIspuStations() {
  return fetchJson("ispu", "https://ispu.kemenlh.go.id/apimobile/v1/getStations", {
    revalidate: revalidateSeconds,
    timeoutMs,
  });
}

// "PM<sub>2.5</sub>" → "pm25"
export function parameterKey(param) {
  const plain = String(param ?? "").replace(/<[^>]+>/g, "").replace(/[\s.]/g, "").toLowerCase();
  return ["pm25", "pm10", "so2", "co", "o3", "no2", "hc"].includes(plain) ? plain : null;
}

const toNumber = (value) => (value === null || value === undefined || value === "" ? null : Number(value));

// Validasi satu stasiun (K-22). Mengembalikan alasan penolakan, atau null bila lolos.
export function validateStation(row, now = new Date()) {
  if (row?.stasiun_show !== "1" || row?.is_maintenance === "1") return "not_active";
  const lat = toNumber(row.lat);
  const lon = toNumber(row.lon);
  if (!Number.isFinite(lat) || !Number.isFinite(lon)) return "no_coordinates";
  const value = toNumber(row.val);
  if (!Number.isFinite(value) || value < 0 || value > 1000) return "invalid_value";
  const key = parameterKey(row.param);
  if (!key) return "unknown_parameter";
  const concentration = toNumber(row[`a_${key}`]);
  const index = toNumber(row[`t_${key}`]);
  // Pola anomali dari uji teknis: konsentrasi 0 tetapi indeks > 0.
  if (concentration === 0 && index > 0) return "inconsistent_values";
  const time = parseZonedDateTime(row.waktu, row.time_z);
  if (!time) return "invalid_time";
  if (time.getTime() - now.getTime() > 60 * 60000) return "future_time";
  return null;
}

// Memilih stasiun valid terdekat dalam radius K-24. Tidak pernah memakai stasiun di luar radius.
export function selectIspuStation(json, lat, lon, now = new Date()) {
  const rows = Array.isArray(json?.rows) ? json.rows : [];
  const candidates = rows
    .filter((row) => validateStation(row, now) === null)
    .map((row) => ({ row, distance: distanceKm(lat, lon, Number(row.lat), Number(row.lon)) }))
    .filter(({ distance }) => distance <= maxDistanceKm)
    .sort((a, b) => a.distance - b.distance);

  if (candidates.length === 0) return { station: null, reason: "no_station_in_radius" };

  const { row, distance } = candidates[0];
  const time = parseZonedDateTime(row.waktu, row.time_z);
  return {
    station: {
      id: row.id_stasiun,
      name: row.nama,
      regency: row.kota,
      province: row.provinsi,
      distanceKm: Math.round(distance * 10) / 10,
      value: Number(row.val),
      parameter: parameterKey(row.param),
      categoryLabel: row.kategori?.nilai ?? row.cat ?? null,
      categoryColor: row.kategori?.color ?? null,
      timeUtc: time.toISOString(),
      zone: row.time_z,
      isFresh: minutesBetween(time, now) <= maxAgeMinutes,
    },
    reason: null,
  };
}
