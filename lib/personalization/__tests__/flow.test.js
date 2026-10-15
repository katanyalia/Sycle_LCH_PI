import { PERSONALIZATION_QUESTIONS } from "@/content/questions/personalization";
import { setAnswer, visibleSteps } from "@/lib/personalization/flow";

describe("Pertanyaan Personalisasi sesuai Master Draft Tahap 2", () => {
  test("hanya P-00..P-03, PM-01/02, PS-01/02 (tanpa P-04 & PK-01)", () => {
    expect(Object.keys(PERSONALIZATION_QUESTIONS)).toEqual(["P-00", "P-01", "P-02", "P-03", "PM-01", "PM-02", "PS-01", "PS-02"]);
  });

  test("jumlah opsi & jenis sesuai Master Draft", () => {
    const shape = Object.fromEntries(Object.values(PERSONALIZATION_QUESTIONS).map((q) => [q.code, [q.type, q.options.length]]));
    expect(shape).toEqual({
      "P-00": ["single", 4],
      "P-01": ["single", 4],
      "P-02": ["single", 6],
      "P-03": ["multi", 6],
      "PM-01": ["single", 4],
      "PM-02": ["multi", 5],
      "PS-01": ["single", 4],
      "PS-02": ["single", 5],
    });
  });

  test("opsi eksklusif P-03 & PM-02", () => {
    const exclusive = (code) => PERSONALIZATION_QUESTIONS[code].options.filter((o) => o.exclusive).map((o) => o.label);
    expect(exclusive("P-03")).toEqual(["Tidak ada", "Belum tahu"]);
    expect(exclusive("PM-02")).toEqual(["Tidak ada kebutuhan khusus", "Tidak ingin menjawab"]);
  });
});

describe("Percabangan Personalisasi", () => {
  test("P-02 selalu tampil, termasuk P-01 = Di rumah (AC-05)", () => {
    expect(visibleSteps({ "P-01": "di_rumah" })).toContain("P-02");
  });

  test("Lewati: tanpa pertanyaan cabang (AC-04)", () => {
    expect(visibleSteps({ "P-00": "lewati" })).toEqual(["P-00", "P-01", "P-02", "P-03"]);
  });

  test("Kehamilan: tanpa pertanyaan tambahan (PK-01 tidak ada)", () => {
    expect(visibleSteps({ "P-00": "kehamilan" })).toEqual(["P-00", "P-01", "P-02", "P-03"]);
  });

  test("Menstruasi: PM-01 & PM-02", () => {
    expect(visibleSteps({ "P-00": "menstruasi" }).slice(-2)).toEqual(["PM-01", "PM-02"]);
  });

  test("Menyusui: PS-02 hanya jika PS-01 = Ya atau Belum tahu", () => {
    expect(visibleSteps({ "P-00": "menyusui", "PS-01": "ya" })).toContain("PS-02");
    expect(visibleSteps({ "P-00": "menyusui", "PS-01": "belum_tahu" })).toContain("PS-02");
    expect(visibleSteps({ "P-00": "menyusui", "PS-01": "tidak" })).not.toContain("PS-02");
    expect(visibleSteps({ "P-00": "menyusui", "PS-01": "tidak_ingin_menjawab" })).not.toContain("PS-02");
  });

  test("mengubah jawaban induk menghapus jawaban turunan", () => {
    let answers = { "P-00": "menstruasi", "PM-01": "ya", "PM-02": ["istirahat"], "P-01": "bepergian" };
    answers = setAnswer(answers, "P-00", "lewati");
    expect(answers).toEqual({ "P-00": "lewati", "P-01": "bepergian" });

    answers = setAnswer({ "P-00": "menyusui", "PS-01": "ya", "PS-02": "keduanya" }, "PS-01", "tidak");
    expect(answers["PS-02"]).toBeUndefined();
  });
});
