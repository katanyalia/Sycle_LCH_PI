const US_AQI_CATEGORIES = [
  { max: 50, label: "Baik", original: "Good", color: "#00E400" },
  { max: 100, label: "Sedang", original: "Moderate", color: "#FFFF00" },
  { max: 150, label: "Tidak sehat bagi kelompok sensitif", original: "Unhealthy for Sensitive Groups", color: "#FF7E00" },
  { max: 200, label: "Tidak sehat", original: "Unhealthy", color: "#FF0000" },
  { max: 300, label: "Sangat tidak sehat", original: "Very Unhealthy", color: "#8F3F97" },
  { max: Infinity, label: "Berbahaya", original: "Hazardous", color: "#7E0023" },
];

// Indeks UV — kategori standar WHO (Global Solar UV Index).
const UV_CATEGORIES = [
  { max: 2, label: "Rendah", original: "Low", color: "#4EB400" },
  { max: 5, label: "Sedang", original: "Moderate", color: "#F7E400" },
  { max: 7, label: "Tinggi", original: "High", color: "#F85900" },
  { max: 10, label: "Sangat tinggi", original: "Very High", color: "#D8001D" },
  { max: Infinity, label: "Ekstrem", original: "Extreme", color: "#6B49C8" },
];

function withTextColor(category) {
  return category ? { ...category, textColor: readableTextColor(category.color) } : null;
}

function pick(categories, value) {
  if (!Number.isFinite(value) || value < 0) return null;
  const { max, ...category } = categories.find((item) => value <= item.max);
  return withTextColor(category);
}

export const usAqiCategory = (value) => pick(US_AQI_CATEGORIES, value);
// UV dibulatkan ke bilangan bulat sebelum dikategorikan (kebiasaan pelaporan UV Index).
export const uvCategory = (value) => pick(UV_CATEGORIES, Math.round(value));

export function ispuCategory({ label, color }) {
  if (!label) return null;
  return withTextColor({ label, original: null, color: /^#[0-9a-f]{6}$/i.test(color ?? "") ? color : null });
}

// Hitam atau putih — yang kontrasnya lebih tinggi terhadap warna kategori.
export function readableTextColor(hex) {
  if (!hex) return "#332A35";
  const [r, g, b] = [1, 3, 5].map((i) => {
    const c = parseInt(hex.slice(i, i + 2), 16) / 255;
    return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
  });
  const luminance = 0.2126 * r + 0.7152 * g + 0.0722 * b;
  return (luminance + 0.05) / 0.05 > 1.05 / (luminance + 0.05) ? "#000000" : "#FFFFFF";
}
