// Utilitas waktu. Semua waktu internal disimpan sebagai ISO UTC; zona waktu asli ikut dibawa
// sebagai label agar UI bisa menampilkan waktu lokal sumber data dengan jujur.

const ZONE_OFFSETS_HOURS = { WIB: 7, WITA: 8, WIT: 9 };

export const IANA_BY_ZONE = { WIB: "Asia/Jakarta", WITA: "Asia/Makassar", WIT: "Asia/Jayapura" };

// "2026-10-15 06:00:00" (UTC) → Date
export function parseUtcDateTime(value) {
  if (typeof value !== "string" || !/^\d{4}-\d{2}-\d{2}[ T]\d{2}:\d{2}(:\d{2})?$/.test(value.trim())) return null;
  const date = new Date(`${value.trim().replace(" ", "T")}${value.trim().length === 16 ? ":00" : ""}Z`);
  return Number.isNaN(date.getTime()) ? null : date;
}

// "2026-10-15 13:00:00" dalam zona WIB/WITA/WIT → Date
export function parseZonedDateTime(value, zone) {
  const offset = ZONE_OFFSETS_HOURS[zone];
  const asUtc = parseUtcDateTime(value);
  if (offset === undefined || !asUtc) return null;
  return new Date(asUtc.getTime() - offset * 3600 * 1000);
}

// Waktu lokal + utc_offset_seconds (format Open-Meteo, mis. "2026-10-15T13:15") → Date
export function parseLocalWithOffset(value, offsetSeconds) {
  const asUtc = parseUtcDateTime(value);
  if (!asUtc || !Number.isFinite(offsetSeconds)) return null;
  return new Date(asUtc.getTime() - offsetSeconds * 1000);
}

export const minutesBetween = (a, b) => Math.abs(a.getTime() - b.getTime()) / 60000;
