// Pengelompokan topik untuk daftar referensi (Info & Edukasi). Kunci kiri = nilai `topik_pemetaan` di CSV evidence.
// Urutan = urutan filter di layar. `deferred` = topik yang ditunda di prototipe (T3-3, E-3): referensinya tetap tampil.
export const REFERENCE_TOPICS = [
  { id: "panas", label: "Panas", keys: ["panas", "indeks_panas", "penyakit_terkait_panas", "hidrasi"] },
  { id: "kualitas-udara", label: "Kualitas udara", keys: ["polusi_udara", "PM2.5", "kualitas_udara", "masker", "asap_kebakaran"] },
  { id: "uv", label: "UV", keys: ["UV", "radiasi_matahari", "perlindungan_matahari"] },
  { id: "menstruasi", label: "Menstruasi", keys: ["menstruasi", "kesehatan_menstruasi", "termoregulasi", "nyeri", "perdarahan"] },
  { id: "kehamilan", label: "Kehamilan", keys: ["kehamilan", "hasil_kehamilan", "hipertensi"] },
  { id: "menyusui", label: "Menyusui", keys: ["menyusui"] },
  { id: "iklim", label: "Iklim & kebijakan", keys: ["iklim", "kebijakan", "kebijakan_kesehatan"] },
  {
    id: "ditunda",
    label: "Topik lain (belum dibahas)",
    keys: ["menopause", "perimenopause", "keringat_malam", "pascapersalinan", "cadangan_ovarium"],
    deferred: true,
  },
];

export function topicIdsOf(source) {
  return REFERENCE_TOPICS.filter((topic) => source.topics?.some((key) => topic.keys.includes(key))).map((topic) => topic.id);
}
