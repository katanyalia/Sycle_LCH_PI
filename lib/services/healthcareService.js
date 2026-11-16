// Healthcare (Master V2.1: FR-15, AC-24–26, WF-11, 6.4)
//   - Faskes terdekat dari snapshot OpenStreetMap + faskes mitra dari tabel tim.
//   - Diurutkan HANYA berdasarkan jarak; status mitra tidak memengaruhi urutan (AC-24).
//   - Tanpa nomor kontak atau nomor darurat (AC-26).
import { fetchBmkgForecast, parseBmkgForecast } from "@/lib/environment/adapters/bmkg";
import { distanceKm, roundCoordinate } from "@/lib/environment/geo";
import { FACILITY_TYPES, OSM_SNAPSHOT_DATE, findOsmFacilities } from "@/lib/healthcare/osm";
import { getPartnerFacilities } from "@/lib/healthcare/partners";
import { findVillageByCode } from "@/lib/repositories/regionRepository";

// Radius pencarian bertahap: mulai 5 km, diperluas bila faskes terlalu sedikit.
const RADII_KM = [5, 15, 30];
const MIN_RESULTS = 5;
const MAX_RESULTS = 40;

async function resolveLocation(input) {
  if (input.kind === "village") {
    const place = findVillageByCode(input.adm4);
    if (!place) return { error: "not_found" };

    let coords = input.coords;
    if (!coords) {
      try {
        const bmkg = parseBmkgForecast(await fetchBmkgForecast(input.adm4));
        if (bmkg.location) coords = { lat: bmkg.location.lat, lon: bmkg.location.lon };
      } catch {
        coords = null;
      }
    }
    if (!coords) return { error: "no_coordinates" };

    return {
      label: `${place.village}, ${place.regency}`,
      lat: roundCoordinate(coords.lat),
      lon: roundCoordinate(coords.lon),
      coordinateSource: "Titik desa/kelurahan dari BMKG",
    };
  }

  return {
    label: "Lokasi perangkatmu",
    lat: input.coords.lat,
    lon: input.coords.lon,
    coordinateSource: "Perangkat (dibulatkan ± 1 km)",
  };
}

function withDistance(facility, location) {
  const km = distanceKm(location.lat, location.lon, facility.lat, facility.lon);
  return { ...facility, distanceKm: Math.round(km * 10) / 10 };
}

export async function getNearbyFacilities(input) {
  const location = await resolveLocation(input);
  if (location.error) return { error: location.error };

  let osmFacilities = [];
  let radiusKm = RADII_KM[0];

  for (const radius of RADII_KM) {
    radiusKm = radius;
    osmFacilities = findOsmFacilities(location.lat, location.lon, radius);
    if (osmFacilities.length >= MIN_RESULTS) break;
  }

  const partners = await getPartnerFacilities();
  const partnerByOsmRef = new Map(
    partners.filter((partner) => partner.osmRef).map((partner) => [partner.osmRef, partner])
  );

  // Faskes OSM yang juga mitra cukup diberi label, tidak digandakan.
  const facilities = osmFacilities.map((facility) => ({
    ...facility,
    isPartner: partnerByOsmRef.has(facility.osmRef),
  }));

  const matchedRefs = new Set(facilities.filter((f) => f.isPartner).map((f) => f.osmRef));
  for (const partner of partners) {
    if (partner.osmRef && matchedRefs.has(partner.osmRef)) continue;
    const item = withDistance(partner, location);
    if (item.distanceKm > radiusKm) continue;
    facilities.push({
      ...partner,
      hasName: true,
      typeLabel: FACILITY_TYPES[partner.type] ?? "Fasilitas kesehatan",
      completeness: "lengkap",
      source: "mitra",
      isPartner: true,
    });
  }

  const sorted = facilities
    .map((facility) => withDistance(facility, location))
    .sort((a, b) => a.distanceKm - b.distanceKm)
    .slice(0, MAX_RESULTS);

  return {
    location,
    radiusKm,
    facilities: sorted,
    osmAvailable: true,
    snapshotDate: OSM_SNAPSHOT_DATE,
  };
}
