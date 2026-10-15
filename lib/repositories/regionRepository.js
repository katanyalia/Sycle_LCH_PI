import wilayah from "@/data/wilayah-2022.json";

// Satu-satunya akses ke data kode wilayah (Kepmendagri 100.1.1-6117/2022, dataset MIT cahyadsn/wilayah).
// Versi 2022 sengaja dipakai karena sama dengan versi yang dirujuk API BMKG.

const SMALL_WORDS = new Set(["dan"]);
// Singkatan yang tetap huruf kapital (mis. "DKI Jakarta", "DI Yogyakarta").
const ACRONYMS = new Set(["dki", "di"]);

// "KOTA ADM. JAKARTA PUSAT" → "Kota Adm. Jakarta Pusat"
export function toTitleCase(text) {
  return String(text)
    .toLowerCase()
    .split(" ")
    .map((word, index) =>
      ACRONYMS.has(word)
        ? word.toUpperCase()
        : index > 0 && SMALL_WORDS.has(word)
          ? word
          : word.replace(/(^|[-(/])([a-z])/g, (m, p, c) => p + c.toUpperCase())
    )
    .join(" ");
}

const normalize = (text) =>
  String(text)
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9 ]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();

let index = null;
function getIndex() {
  if (index) return index;
  index = wilayah.villages.map(([code, name]) => {
    const district = wilayah.districts[code.slice(0, 8)];
    const regency = wilayah.regencies[code.slice(0, 5)];
    const province = wilayah.provinces[code.slice(0, 2)];
    return {
      code,
      village: name,
      district,
      regency: toTitleCase(regency),
      province: toTitleCase(province),
      villageKey: normalize(name),
      pathKey: normalize(`${name} ${district} ${regency} ${province}`),
    };
  });
  return index;
}

const toResult = ({ code, village, district, regency, province }) => ({
  code,
  village,
  district,
  regency,
  province,
  label: `${village}, ${district}, ${regency}, ${province}`,
});

export function findVillageByCode(code) {
  const entry = getIndex().find((item) => item.code === code);
  return entry ? toResult(entry) : null;
}

// Pencarian: semua kata harus ada pada jalur "desa kecamatan kab/kota provinsi".
// Urutan: nama desa sama persis → nama desa diawali kata kunci → nama desa memuat kata pertama → lainnya.
export function searchVillages(query, limit = 10) {
  const tokens = normalize(query).split(" ").filter(Boolean);
  if (tokens.length === 0) return { total: 0, items: [] };
  const phrase = tokens.join(" ");
  const results = [];
  for (const item of getIndex()) {
    if (!tokens.every((token) => item.pathKey.includes(token))) continue;
    let rank = 3;
    if (item.villageKey === phrase || item.villageKey === tokens[0]) rank = 0;
    else if (item.villageKey.startsWith(tokens[0])) rank = 1;
    else if (item.villageKey.includes(tokens[0])) rank = 2;
    results.push({ item, rank });
  }
  results.sort((a, b) => a.rank - b.rank || a.item.village.localeCompare(b.item.village, "id"));
  return { total: results.length, items: results.slice(0, limit).map(({ item }) => toResult(item)) };
}
