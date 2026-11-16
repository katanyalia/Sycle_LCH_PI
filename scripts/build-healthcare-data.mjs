// Membangun data/healthcare/faskes-osm.json dari ekspor HOT/HDX "Health Facilities (OSM), GeoJSON" Indonesia.
// Pemakaian:  node scripts/build-healthcare-data.mjs <path/health_facilities.geojson> <tanggal-snapshot>
// Contoh:     node scripts/build-healthcare-data.mjs ~/Downloads/health_facilities.geojson 2026-10-09
// - Hanya faskes bernama dengan jenis yang dipakai Healthcare (apotek, laboratorium, dll. tidak diambil).
// - Tanpa kontak (Master V2.1 FR-15/AC-26): ekspor HOT memang tidak memuat telepon/email.
import { readFileSync, writeFileSync } from "node:fs";

const [inputPath, snapshotDate] = process.argv.slice(2);
if (!inputPath || !/^\d{4}-\d{2}-\d{2}$/.test(snapshotDate ?? "")) {
  console.error("Pemakaian: node scripts/build-healthcare-data.mjs <geojson> <YYYY-MM-DD>");
  process.exit(1);
}

// Jenis ditentukan dari nama lebih dulu (tag OSM kadang keliru), lalu dari tag.
function classify(p) {
  const name = String(p.name_id || p.name || "").toLowerCase();
  if (/posyandu|apotek|apotik|optik|laborator|veteriner|hewan|\buks\b/.test(name)) return null;
  if (/\b(rs|rsu|rsud|rsia|rsup|rsj)\b|rumah sakit/.test(name)) return "hospital";
  if (/puskesmas|puskemas|\bpustu\b|poskesdes|polindes/.test(name)) return "puskesmas";
  if (/\bbidan\b|\bbpm\b|bersalin/.test(name)) return "midwife";
  if (/klinik|clinic/.test(name)) return "clinic";
  if (/\b(dr|drg)\.?\s|dokter|praktik|praktek/.test(name)) return "doctor";

  if (p.amenity === "hospital" || p.healthcare === "hospital") return "hospital";
  if (p.healthcare === "centre") return "puskesmas";
  if (p.healthcare === "midwife" || p.healthcare === "birthing_centre") return "midwife";
  if (p.amenity === "doctors" || p.healthcare === "doctor") return "doctor";
  if (p.amenity === "clinic" || p.healthcare === "clinic") return "clinic";
  return null;
}

// Titik tengah sederhana untuk poligon (rata-rata titik ring luar).
function center(geometry) {
  if (!geometry) return null;
  const { type, coordinates } = geometry;
  if (type === "Point") return coordinates;
  const ring =
    type === "Polygon" ? coordinates[0] :
    type === "MultiPolygon" ? coordinates[0][0] :
    type === "LineString" ? coordinates : null;
  if (!ring?.length) return null;
  const sum = ring.reduce((acc, [x, y]) => [acc[0] + x, acc[1] + y], [0, 0]);
  return [sum[0] / ring.length, sum[1] / ring.length];
}

const SPECIALITY = {
  general: "Umum", gynaecology: "Kandungan", obstetrics: "Kebidanan", paediatrics: "Anak",
  emergency: "Gawat darurat", dentistry: "Gigi", internal: "Penyakit dalam",
};

const geojson = JSON.parse(readFileSync(inputPath, "utf8"));
const facilities = [];

for (const feature of geojson.features ?? []) {
  const p = feature.properties ?? {};
  const name = (p.name_id || p.name || "").trim();
  const type = classify(p);
  const point = center(feature.geometry);
  if (!name || !type || !point) continue;

  const services = String(p.healthcare_speciality ?? "")
    .split(";")
    .map((s) => s.trim())
    .filter(Boolean)
    .map((s) => SPECIALITY[s] ?? s);

  facilities.push({
    i: p.id,                                   // rujukan OSM, mis. "node/123"
    n: name,
    t: type,
    a: p.addr_full || null,                    // alamat dari OSM (bila ada)
    w: [p.adm4_name, p.adm3_name, p.adm2_name].filter(Boolean).join(", ") || null, // wilayah administratif
    s: services,
    y: Math.round(point[1] * 1e5) / 1e5,
    x: Math.round(point[0] * 1e5) / 1e5,
  });
}

// Hapus duplikat: nama sama (tanpa beda huruf besar/spasi) dalam jarak ± 300 m.
// Simpan versi dengan data paling lengkap (alamat dan layanan).
const score = (f) => (f.a ? 2 : 0) + (f.s.length > 0 ? 1 : 0);
const closeBy = (a, b) => Math.abs(a.y - b.y) < 0.003 && Math.abs(a.x - b.x) < 0.003;
const byName = new Map();
for (const facility of facilities) {
  const key = facility.n.toLowerCase().replace(/\s+/g, " ");
  const group = byName.get(key) ?? [];
  const index = group.findIndex((item) => closeBy(item, facility));
  if (index === -1) group.push(facility);
  else if (score(facility) > score(group[index])) group[index] = facility;
  byName.set(key, group);
}
facilities.length = 0;
for (const group of byName.values()) facilities.push(...group);

writeFileSync(
  new URL("../data/healthcare/faskes-osm.json", import.meta.url),
  JSON.stringify({
    source: "OpenStreetMap contributors (ODbL) — ekspor HOT/HDX Health Facilities Indonesia",
    snapshot: snapshotDate,
    count: facilities.length,
    facilities,
  })
);
console.log(`Selesai: ${facilities.length} faskes ditulis (snapshot ${snapshotDate}).`);
