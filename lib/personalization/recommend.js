// Pemilihan panduan personal berbasis aturan (Master Draft 2.7; pola knowledge-based recommendation).
// Tanpa AI. Hanya memilih dari butir yang lolos gerbang konten; tidak membuat panduan baru.

import { selectVisibleContent } from "@/lib/content/rules";
import { optionLabel } from "@/content/questions/personalization";
import { formatNumber } from "@/lib/environment/format";
import { isIndicatorStale } from "@/lib/environment/freshness";

// Ambang sinyal lingkungan — DRAF DEMONSTRASI, hanya untuk mengurutkan prioritas, bukan penilaian risiko.
//  heat: Heat Index ≥ 27 °C (± batas bawah kategori "Caution" NWS, 80 °F)
//  uv:   Indeks UV ≥ 3 (skala WHO: perlindungan mulai dianjurkan)
//  air:  nilai > 100 pada ISPU atau US AQI (di atas kategori "Sedang"/"Moderate")
export const SIGNAL_THRESHOLDS = { heat: 27, uv: 3, air: 100 };

export const MIN_STEPS = 3;
export const MAX_STEPS = 5;

function usable(indicator, now) {
  return indicator && indicator.status === "ok" && !isIndicatorStale(indicator, now);
}

// Mengubah snapshot lingkungan menjadi sinyal + kalimat alasan yang faktual.
export function environmentSignals(snapshot, now = new Date()) {
  const signals = {};
  const indicators = snapshot?.indicators;
  if (!indicators) return signals;

  const heat = indicators.heatIndex;
  if (usable(heat, now) && heat.value >= SIGNAL_THRESHOLDS.heat) {
    signals.heat = `Heat Index di lokasimu saat ini ${formatNumber(heat.value)} °C.`;
  }
  const uv = indicators.uv;
  if (usable(uv, now) && uv.value >= SIGNAL_THRESHOLDS.uv) {
    signals.uv = `Indeks UV di lokasimu saat ini ${formatNumber(uv.value)}${uv.category ? ` (${uv.category.label}, skala WHO)` : ""}.`;
  }
  const air = indicators.airQuality;
  if (usable(air, now) && air.value > SIGNAL_THRESHOLDS.air) {
    signals.air = `Kualitas udara di lokasimu saat ini ${formatNumber(air.value)} ${air.standard}${air.category ? ` (${air.category.label})` : ""}.`;
  }
  return signals;
}

function matches(when, answers) {
  const p01 = answers["P-01"];
  const p02 = answers["P-02"];
  if (when.outdoor && p02 === "tidak_keluar") return false;
  if (when.indoor && !(p01 === "di_rumah" || p02 === "tidak_keluar")) return false;
  if (when.condition && answers["P-00"] !== when.condition) return false;
  if (when.answerAny) {
    const value = answers[when.answerAny.code];
    const values = Array.isArray(value) ? value : value ? [value] : [];
    if (!when.answerAny.values.some((v) => values.includes(v))) return false;
  }
  return true;
}

// Kalimat "mengapa untukmu" yang hanya mengulang jawaban pengguna & data valid.
function personalNotes(item, answers, signals) {
  const notes = [];
  if (item.when.outdoor && answers["P-02"] && answers["P-02"] !== "tidak_keluar") {
    notes.push(`Perkiraan waktu di luar ruangan: ${optionLabel("P-02", answers["P-02"]).toLowerCase()}.`);
  }
  if (item.when.indoor) notes.push(`Rencanamu: ${optionLabel("P-01", answers["P-01"] ?? "di_rumah").toLowerCase()}.`);
  if (item.when.answerAny) {
    const { code } = item.when.answerAny;
    const value = answers[code];
    const values = Array.isArray(value) ? value : [value];
    const matched = values.filter((v) => item.when.answerAny.values.includes(v)).map((v) => optionLabel(code, v).toLowerCase());
    if (matched.length) notes.push(`Kamu memilih: ${matched.join(", ")}.`);
  }
  if (item.signal && signals[item.signal]) notes.push(signals[item.signal]);
  return notes;
}

// Mengembalikan { status, steps, signals }.
//   status "ok"           → 3–5 langkah
//   status "insufficient" → kurang dari 3 langkah yang tersedia (screen 26)
export function recommendGuidance(answers, snapshot, { items, sources, approvers, showDraft, now = new Date() }) {
  const signals = environmentSignals(snapshot, now);
  const visible = selectVisibleContent(items, { sources, approvers, showDraft });

  const ranked = visible
    .filter((item) => matches(item.when ?? {}, answers))
    .map((item) => ({ item, score: item.priority + (item.signal && signals[item.signal] ? 50 : 0) }))
    .sort((a, b) => b.score - a.score)
    .slice(0, MAX_STEPS)
    .map(({ item }) => ({ ...item, notes: personalNotes(item, answers, signals) }));

  return { status: ranked.length >= MIN_STEPS ? "ok" : "insufficient", steps: ranked, signals };
}
