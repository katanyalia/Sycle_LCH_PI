// Format tampilan (aman untuk client). Angka memakai format Indonesia (koma desimal).
const ZONE_LABEL = { "Asia/Jakarta": "WIB", "Asia/Pontianak": "WIB", "Asia/Makassar": "WITA", "Asia/Jayapura": "WIT" };

export function formatNumber(value, maximumFractionDigits = 1) {
  return new Intl.NumberFormat("id-ID", { maximumFractionDigits }).format(value);
}

export function zoneLabel(timezone) {
  return ZONE_LABEL[timezone] ?? timezone ?? "";
}

// "15 Okt, 19.00 WIB"
export function formatDataTime(isoString, timezone = "Asia/Jakarta") {
  if (!isoString) return "Waktu tidak diketahui";
  const date = new Date(isoString);
  const text = new Intl.DateTimeFormat("id-ID", {
    timeZone: timezone,
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
  return `${text} ${zoneLabel(timezone)}`.trim();
}

export function formatRelative(isoString, now = new Date()) {
  const minutes = Math.round((now.getTime() - new Date(isoString).getTime()) / 60000);
  if (minutes < 1) return "baru saja";
  if (minutes < 60) return `${minutes} menit lalu`;
  const hours = Math.floor(minutes / 60);
  return `${hours} jam lalu`;
}

export const DATA_TYPE_LABEL = {
  prakiraan: "Prakiraan",
  pengamatan: "Pengamatan stasiun",
  model: "Data model",
  perhitungan: "Hasil perhitungan",
};
