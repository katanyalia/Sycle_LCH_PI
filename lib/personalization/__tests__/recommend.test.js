import { PERSONAL_GUIDANCE } from "@/content/guidance/personal";
import { EVIDENCE_SOURCES } from "@/content/evidence/sources";
import { APPROVERS } from "@/content/approvers";
import { validateContentItem } from "@/lib/content/rules";
import { recommendGuidance } from "@/lib/personalization/recommend";

const NOW = new Date("2026-10-15T06:30:00Z");
const ctx = (showDraft = true) => ({ items: PERSONAL_GUIDANCE, sources: EVIDENCE_SOURCES, approvers: APPROVERS, showDraft, now: NOW });

const snapshot = ({ heat = 34, uv = 9, air = 152 } = {}) => ({
  indicators: {
    heatIndex: { status: "ok", value: heat, dataType: "prakiraan", timeUtc: "2026-10-15T06:00:00Z" },
    uv: { status: "ok", value: uv, dataType: "model", timeUtc: "2026-10-15T06:15:00Z", category: { label: "Sangat tinggi" } },
    airQuality: { status: "ok", value: air, standard: "US AQI", dataType: "model", timeUtc: "2026-10-15T06:00:00Z", category: { label: "Tidak sehat" } },
  },
});

describe("Butir panduan draf demonstrasi", () => {
  test("semua lolos gerbang konten dan berstatus draft", () => {
    for (const item of PERSONAL_GUIDANCE) {
      expect({ id: item.id, errors: validateContentItem(item, { sources: EVIDENCE_SOURCES, approvers: APPROVERS }) }).toEqual({ id: item.id, errors: [] });
      expect(item.status).toBe("draft");
      expect(item.author).toMatch(/Draf demonstrasi/);
    }
  });
});

describe("Pemilihan panduan personal (tanpa AI)", () => {
  test("menghasilkan 3–5 langkah", () => {
    const result = recommendGuidance({ "P-00": "lewati", "P-01": "luar_ruangan", "P-02": "1_2_jam", "P-03": ["air_minum"] }, null, ctx());
    expect(result.status).toBe("ok");
    expect(result.steps.length).toBeGreaterThanOrEqual(3);
    expect(result.steps.length).toBeLessThanOrEqual(5);
  });

  test("Lewati tetap mendapat panduan umum (AC-04)", () => {
    const result = recommendGuidance({ "P-00": "lewati" }, null, ctx());
    expect(result.status).toBe("ok");
    expect(result.steps.every((s) => ["panas", "uv", "kualitas-udara"].includes(s.group))).toBe(true);
  });

  test("Menstruasi + akses toilet → butir menstruasi diprioritaskan", () => {
    const result = recommendGuidance({ "P-00": "menstruasi", "PM-02": ["akses_toilet"], "P-02": "30_60" }, null, ctx());
    expect(result.steps[0].id).toBe("pp-menstruasi-toilet");
  });

  test("Tidak berencana keluar → tanpa butir khusus luar ruangan", () => {
    const result = recommendGuidance({ "P-01": "di_rumah", "P-02": "tidak_keluar" }, null, ctx());
    expect(result.steps.map((s) => s.id)).not.toContain("pp-uv-pelindung");
    expect(result.steps.map((s) => s.id)).toContain("pp-panas-rumah");
  });

  test("data lingkungan valid menaikkan prioritas dan memberi alasan faktual", () => {
    const answers = { "P-00": "lewati", "P-01": "luar_ruangan", "P-02": "lebih_2_jam" };
    const result = recommendGuidance(answers, snapshot({ heat: 20, uv: 9, air: 40 }), ctx());
    expect(result.signals.uv).toMatch(/Indeks UV di lokasimu saat ini 9/);
    expect(result.signals.heat).toBeUndefined();
    expect(result.steps[0].group).toBe("uv");
  });

  test("data lingkungan tidak tersedia/basi tidak dipakai", () => {
    const stale = snapshot();
    stale.indicators.uv.timeUtc = "2026-10-15T01:00:00Z";
    stale.indicators.heatIndex = { status: "unavailable" };
    const result = recommendGuidance({ "P-02": "1_2_jam" }, stale, ctx());
    expect(result.signals.uv).toBeUndefined();
    expect(result.signals.heat).toBeUndefined();
  });

  test("sakelar K-01 mati → tidak ada panduan (screen 26)", () => {
    const result = recommendGuidance({ "P-00": "lewati" }, null, ctx(false));
    expect(result.status).toBe("insufficient");
    expect(result.steps).toHaveLength(0);
  });
});
