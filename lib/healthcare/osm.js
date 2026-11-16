// Faskes dari snapshot OpenStreetMap (Master V2.1 6.4: sumber data terbuka).
// Sumber: ekspor HOT/HDX "Health Facilities (OSM)" Indonesia, lisensi ODbL; dibangun dengan
// `node scripts/build-healthcare-data.mjs`. Snapshot dipakai karena server publik Overpass sering penuh,
// sehingga Healthcare tetap cepat dan bisa dipakai saat demo. Data tidak memuat kontak (FR-15/AC-26).
import snapshot from "@/data/healthcare/faskes-osm.json";
import { distanceKm } from "@/lib/environment/geo";
import { toFacility } from "@/lib/healthcare/facility";

export const OSM_SNAPSHOT_DATE = snapshot.snapshot;

// Jenis faskes dan bentuk objek faskes dipakai bersama dengan mode offline di browser.
export { FACILITY_TYPES } from "@/lib/healthcare/facility";

// Faskes dalam radius tertentu dari titik lokasi (perhitungan lokal, tanpa panggilan API).
export function findOsmFacilities(lat, lon, radiusKm) {
  // Saring kasar dengan kotak batas dulu agar cepat, lalu hitung jarak sebenarnya.
  const latDelta = radiusKm / 111;
  const lonDelta = radiusKm / (111 * Math.max(Math.cos((lat * Math.PI) / 180), 0.2));

  return snapshot.facilities
    .filter(
      (item) =>
        Math.abs(item.y - lat) <= latDelta &&
        Math.abs(item.x - lon) <= lonDelta &&
        distanceKm(lat, lon, item.y, item.x) <= radiusKm
    )
    .map(toFacility);
}
