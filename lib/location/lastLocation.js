// Lokasi terakhir yang dipilih pengguna diingat di perangkat (bukan di server), agar Beranda dan
// Healthcare tetap tahu lokasinya saat halaman dimuat ulang, termasuk saat offline.
// Yang disimpan hanya kode wilayah/koordinat dan nama wilayah.
const LAST_LOCATION_KEY = "sycle:last-location";

export function readLastLocation() {
  try {
    const saved = JSON.parse(localStorage.getItem(LAST_LOCATION_KEY) ?? "null");
    return saved && (saved.adm4 || saved.coordinates) ? saved : null;
  } catch {
    return null;
  }
}

export function rememberLocation(value) {
  try {
    localStorage.setItem(LAST_LOCATION_KEY, JSON.stringify(value));
  } catch {
    // Penyimpanan perangkat tidak tersedia (mis. mode privat); lokasi tetap dipakai di sesi ini.
  }
}
