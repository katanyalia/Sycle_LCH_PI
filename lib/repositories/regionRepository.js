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

// "KOTA ADM. JAKARTA SELATAN" → "jakarta selatan"; "KAB. BOGOR" → "bogor".
const REGION_PREFIX = /\b(kabupaten|kab|kota|adm|administrasi)\b/g;
export function regionName(text) {
  return normalize(text).replace(REGION_PREFIX, " ").replace(/\s+/g, " ").trim();
}

// Nama provinsi versi OpenStreetMap → versi Kemendagri.
const PROVINCE_ALIASES = {
  "daerah khusus ibukota jakarta": "dki jakarta",
  "daerah khusus jakarta": "dki jakarta",
  jakarta: "dki jakarta",
  "daerah istimewa yogyakarta": "di yogyakarta",
};
export function provinceName(text) {
  const key = regionName(text);
  return PROVINCE_ALIASES[key] ?? key;
}

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
      // Nama desa tanpa spasi, untuk mencocokkan ejaan seperti "Airtawar" = "Air Tawar".
      villageCompact: normalize(name).replace(/ /g, ""),
      // Nama kab/kota dan provinsi tanpa awalan "Kota", "Kab.", "Adm.".
      regionKey: regionName(`${regency} ${province}`),
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

let regionNames = null;
function getRegionNames() {
  if (regionNames) return regionNames;
  regionNames = new Set();
  for (const item of getIndex()) {
    regionNames.add(regionName(item.regency));
    regionNames.add(provinceName(item.province));
    regionNames.add(regionName(item.province));
  }
  return regionNames;
}

export function findVillageByCode(code) {
  const entry = getIndex().find((item) => item.code === code);
  return entry ? toResult(entry) : null;
}

// Pencarian: semua kata harus ada pada jalur "desa kecamatan kab/kota provinsi".
// Urutan: nama desa sama persis → kata kunci adalah nama kab/kota atau provinsi (mis. "Jakarta", "Bogor")
// → nama desa diawali kata kunci → nama desa memuat kata pertama → lainnya.
export function searchVillages(query, limit = 10) {
  const tokens = normalize(query).split(" ").filter(Boolean);
  if (tokens.length === 0) return { total: 0, items: [] };
  const phrase = tokens.join(" ");
  const regionPhrase = regionName(query);
  // Kata kunci yang persis nama kab/kota atau provinsi (mis. "Bogor", "Padang") lebih mungkin
  // dimaksudkan sebagai kotanya daripada desa lain yang kebetulan bernama sama.
  const isRegionQuery = getRegionNames().has(regionPhrase);
  const results = [];
  for (const item of getIndex()) {
    if (!tokens.every((token) => item.pathKey.includes(token))) continue;
    const inRegion = regionPhrase && ` ${item.regionKey} `.includes(` ${regionPhrase} `);
    const exactRegion =
      regionName(item.regency) === regionPhrase || provinceName(item.province) === provinceName(query);
    const exactVillage = item.villageKey === phrase || item.villageKey === tokens[0];
    let rank = 5;
    if (isRegionQuery && exactRegion) rank = 0;
    else if (exactVillage) rank = isRegionQuery ? 1 : 0;
    else if (inRegion) rank = 2;
    else if (item.villageKey.startsWith(tokens[0])) rank = 3;
    else if (item.villageKey.includes(tokens[0])) rank = 4;
    results.push({ item, rank });
  }
  results.sort((a, b) => a.rank - b.rank || a.item.village.localeCompare(b.item.village, "id"));
  return { total: results.length, items: results.slice(0, limit).map(({ item }) => toResult(item)) };
}

// Pencocokan alamat GPS (OpenStreetMap) ke kode desa BMKG.
// villageNames/regencyNames berisi beberapa kandidat karena OSM tidak konsisten
// (mis. kelurahan bisa ada di "village", "suburb" atau "neighbourhood";
// di Jakarta kota administrasi ada di "city_district" dan provinsi di "city").
// Mengembalikan satu desa bila hasilnya unik, selain itu null.
export function matchVillageFromAddress({ villageNames = [], districtNames = [], regencyNames = [], provinceNames = [] }) {
  const villages = [...new Set(villageNames.filter(Boolean).map((v) => normalize(v).replace(/ /g, "")))];
  const regencies = [...new Set(regencyNames.filter(Boolean).map(regionName))];
  const provinces = [...new Set(provinceNames.filter(Boolean).map(provinceName))];
  const districts = [...new Set(districtNames.filter(Boolean).map(regionName))];
  if (villages.length === 0 || (regencies.length === 0 && provinces.length === 0)) return null;

  for (const village of villages) {
    let matches = getIndex().filter((item) => {
      if (item.villageCompact !== village) return false;
      const regency = regionName(item.regency);
      const province = provinceName(item.province);
      const regencyOk = regencies.length === 0 || regencies.includes(regency);
      const provinceOk = provinces.length === 0 || provinces.includes(province) || regencies.includes(province);
      return regencyOk && provinceOk;
    });

    // Bila masih ganda, persempit dengan kecamatan.
    if (matches.length > 1 && districts.length) {
      const narrowed = matches.filter((item) => districts.includes(regionName(item.district)));
      if (narrowed.length) matches = narrowed;
    }

    if (matches.length === 1) return toResult(matches[0]);
  }
  return null;
}
