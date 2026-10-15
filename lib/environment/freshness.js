import { ENVIRONMENT_CONFIG } from "@/lib/environment/config";

// Batas umur data per jenis (menit) — sama dengan batas validasi di server.
const MAX_AGE = {
  prakiraan: ENVIRONMENT_CONFIG.bmkg.maxSlotDistanceMinutes,
  model: ENVIRONMENT_CONFIG.openMeteo.maxAgeMinutes,
  pengamatan: ENVIRONMENT_CONFIG.ispu.maxAgeMinutes,
  perhitungan: ENVIRONMENT_CONFIG.bmkg.maxSlotDistanceMinutes,
};

// AC-16: data yang sudah melewati batas ditandai bukan kondisi terkini (tidak disembunyikan diam-diam).
export function isIndicatorStale(indicator, now = new Date()) {
  if (!indicator || indicator.status === "unavailable") return false;
  if (indicator.status === "stale") return true;
  const limit = MAX_AGE[indicator.dataType];
  if (!limit || !indicator.timeUtc) return false;
  return now.getTime() - new Date(indicator.timeUtc).getTime() > limit * 60000;
}
