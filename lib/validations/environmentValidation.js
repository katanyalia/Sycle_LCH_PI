// Validasi input endpoint lingkungan & lokasi. Mengembalikan { ok, value } atau { ok:false, error }.
import { roundCoordinate } from "@/lib/environment/geo";

const ADM4_PATTERN = /^\d{2}\.\d{2}\.\d{2}\.\d{4}$/;

const parseCoordinate = (value, min, max) => {
  if (value === null || value === undefined || value === "") return null;
  const number = Number(value);
  return Number.isFinite(number) && number >= min && number <= max ? roundCoordinate(number) : null;
};

// Wilayah Indonesia kira-kira: lintang −11..6, bujur 95..141 (dengan sedikit margin).
const INDONESIA = { lat: [-12, 7], lon: [94, 142] };

export function validateEnvironmentQuery(searchParams) {
  const adm4 = searchParams.get("adm4");
  const latRaw = searchParams.get("lat");
  const lonRaw = searchParams.get("lon");
  const lat = parseCoordinate(latRaw, ...INDONESIA.lat);
  const lon = parseCoordinate(lonRaw, ...INDONESIA.lon);
  const hasCoords = lat !== null && lon !== null;

  if (adm4) {
    if (!ADM4_PATTERN.test(adm4)) return { ok: false, error: "Kode wilayah tidak valid." };
    return { ok: true, value: { kind: "village", adm4, coords: hasCoords ? { lat, lon } : null } };
  }
  if (latRaw !== null || lonRaw !== null) {
    if (!hasCoords) return { ok: false, error: "Koordinat tidak valid atau di luar wilayah Indonesia." };
    return { ok: true, value: { kind: "device", coords: { lat, lon } } };
  }
  return { ok: false, error: "Lokasi belum dipilih." };
}

export function validateLocationSearch(searchParams) {
  const query = (searchParams.get("q") ?? "").trim();
  if (query.length < 3) return { ok: false, error: "Ketik minimal 3 huruf." };
  if (query.length > 80) return { ok: false, error: "Kata kunci terlalu panjang." };
  return { ok: true, value: { query } };
}
