// Healthcare saat offline: cari faskes terdekat langsung di perangkat dari snapshot OSM yang sudah
// disimpan service worker (/api/healthcare/offline-data). Aturannya sama dengan server
// (lib/services/healthcareService.js): radius 5 → 15 → 30 km, urut jarak, maksimal 40 faskes.
// Mitra SYCLE tidak ikut karena datanya ada di Supabase.
import { distanceKm, roundCoordinate } from "@/lib/environment/geo";
import { toFacility } from "@/lib/healthcare/facility";

const RADII_KM = [5, 15, 30];
const MIN_RESULTS = 5;
const MAX_RESULTS = 40;
const OFFLINE_DATA_URL = "/api/healthcare/offline-data";

// Titik lokasi desa/kelurahan hanya bisa diubah menjadi koordinat oleh server, jadi hasil
// terakhir yang berhasil diingat di perangkat untuk dipakai saat offline.
const LAST_HEALTHCARE_LOCATION_KEY = "sycle:healthcare-location";

export function rememberHealthcareLocation(adm4, location) {
  if (!location || typeof location.lat !== "number" || typeof location.lon !== "number") return;
  try {
    localStorage.setItem(
      LAST_HEALTHCARE_LOCATION_KEY,
      JSON.stringify({ adm4: adm4 ?? null, label: location.label, lat: location.lat, lon: location.lon })
    );
  } catch {
    // Penyimpanan perangkat tidak tersedia; mode offline untuk desa ini tidak bisa dipakai.
  }
}

function resolveOfflineLocation({ adm4, latitude, longitude }) {
  if (adm4) {
    try {
      const saved = JSON.parse(localStorage.getItem(LAST_HEALTHCARE_LOCATION_KEY) ?? "null");
      if (saved?.adm4 === adm4) {
        return { label: saved.label, lat: saved.lat, lon: saved.lon, coordinateSource: "Titik desa/kelurahan tersimpan" };
      }
    } catch {
      return null;
    }
    return null;
  }

  if (latitude === null || longitude === null) return null;
  return {
    label: "Lokasi perangkatmu",
    lat: roundCoordinate(latitude),
    lon: roundCoordinate(longitude),
    coordinateSource: "Perangkat (dibulatkan ± 1 km)",
  };
}

// Mengembalikan hasil dengan bentuk yang sama seperti /api/healthcare, ditambah `offline: true`.
// null bila lokasi belum bisa dipakai offline atau data faskes belum tersimpan di perangkat.
export async function findNearbyFacilitiesOffline(input) {
  const location = resolveOfflineLocation(input);
  if (!location) return { error: "no_location" };

  let snapshot;
  try {
    const response = await fetch(OFFLINE_DATA_URL);
    if (!response.ok) return { error: "no_data" };
    snapshot = await response.json();
  } catch {
    return { error: "no_data" };
  }

  const withDistance = snapshot.facilities.map((item) => ({
    item,
    km: distanceKm(location.lat, location.lon, item.y, item.x),
  }));

  let radiusKm = RADII_KM[0];
  let nearby = [];
  for (const radius of RADII_KM) {
    radiusKm = radius;
    nearby = withDistance.filter((entry) => entry.km <= radius);
    if (nearby.length >= MIN_RESULTS) break;
  }

  // Urutkan dengan jarak yang sudah dibulatkan, sama seperti server, agar hasilnya identik.
  const facilities = nearby
    .map(({ item, km }) => ({ ...toFacility(item), isPartner: false, distanceKm: Math.round(km * 10) / 10 }))
    .sort((a, b) => a.distanceKm - b.distanceKm)
    .slice(0, MAX_RESULTS);

  return {
    location,
    radiusKm,
    facilities,
    osmAvailable: true,
    snapshotDate: snapshot.snapshot,
    offline: true,
  };
}
