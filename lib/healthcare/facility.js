// Bentuk data faskes yang sama untuk server (lib/healthcare/osm.js) dan mode offline di browser
// (lib/healthcare/offlineNearby.js). File ini sengaja tidak mengimpor data snapshot agar ringan.
export const FACILITY_TYPES = {
  hospital: "Rumah sakit",
  puskesmas: "Puskesmas",
  clinic: "Klinik",
  midwife: "Bidan",
  doctor: "Praktik dokter",
};

// Label kelengkapan data (Master V2.1 6.4): data OSM bisa tidak lengkap.
function completeness(item) {
  if (item.a && item.s.length > 0) return "lengkap";
  if (item.a) return "sebagian";
  return "terbatas";
}

// Ubah format ringkas snapshot (i, n, t, a, w, s, y, x) menjadi objek faskes.
export function toFacility(item) {
  return {
    id: `osm-${item.i.replace("/", "-")}`,
    osmRef: item.i,
    name: item.n,
    hasName: true,
    type: item.t,
    typeLabel: FACILITY_TYPES[item.t],
    address: item.a,
    area: item.w,
    services: item.s,
    lat: item.y,
    lon: item.x,
    completeness: completeness(item),
    source: "osm",
  };
}
