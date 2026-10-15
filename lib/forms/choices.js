// Logika pilihan ganda dengan opsi eksklusif (Lampiran A wireframe):
// P-03, PM-02, HT-02, HK-01, HS-04.
// - Memilih opsi eksklusif membatalkan semua pilihan lain.
// - Memilih opsi biasa membatalkan opsi eksklusif.
// - Menekan opsi yang sudah terpilih membatalkannya.
export function toggleMultiChoice(selected, value, exclusiveValues = []) {
  if (selected.includes(value)) {
    return selected.filter((item) => item !== value);
  }
  if (exclusiveValues.includes(value)) {
    return [value];
  }
  return [...selected.filter((item) => !exclusiveValues.includes(item)), value];
}

// Skala gangguan aktivitas 0–4 (HT-03, HM-05, HK-02, HS-03).
// Nilai dilewati = null (tidak ada data), BUKAN 0, dan tidak pernah dijumlahkan.
export const DISRUPTION_SCALE = [
  { value: 0, label: "Tidak mengganggu" },
  { value: 1, label: "Sedikit mengganggu" },
  { value: 2, label: "Cukup mengganggu" },
  { value: 3, label: "Sangat mengganggu" },
  { value: 4, label: "Amat sangat mengganggu" },
];

export function normalizeDisruptionValue(value) {
  if (value === null || value === undefined || value === "") return null;
  const number = Number(value);
  return Number.isInteger(number) && number >= 0 && number <= 4 ? number : null;
}
