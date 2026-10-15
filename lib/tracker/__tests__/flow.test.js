import { TRACKER_QUESTIONS } from "@/content/questions/tracker";
import { setTrackerAnswer, trackerSteps } from "@/lib/tracker/flow";

describe("Pertanyaan Health Tracker sesuai Master Draft Tahap 3", () => {
  test("jenis & jumlah opsi", () => {
    const shape = Object.fromEntries(
      Object.values(TRACKER_QUESTIONS).filter((q) => q.options).map((q) => [q.code, [q.type, q.options.length]])
    );
    expect(shape).toEqual({
      KONTEKS: ["single", 4],
      "HT-01": ["single", 6],
      "HT-02": ["multi", 7],
      "HT-04": ["single", 6],
      "HM-01": ["single", 4],
      "HM-02": ["single", 9],
      "HM-03": ["single", 4],
      "HM-04": ["single", 3],
      "HK-01": ["multi", 5],
      "HS-01": ["single", 3],
      "HS-02": ["single", 3],
      "HS-04": ["multi", 6],
    });
  });

  test("teks Lainnya hanya untuk HT-02 dan HK-01 (tidak untuk HS-04)", () => {
    expect(Object.values(TRACKER_QUESTIONS).filter((q) => q.other).map((q) => q.code)).toEqual(["HT-02", "HK-01"]);
  });
});

describe("Percabangan Health Tracker", () => {
  test("Lewati: HT-01..HT-04 + cerita, tanpa cabang reproduksi", () => {
    expect(trackerSteps({ KONTEKS: "lewati" })).toEqual(["KONTEKS", "HT-01", "HT-02", "HT-04", "CERITA"]);
  });

  test("HT-03 hanya muncul bila ada gejala (AC-07)", () => {
    expect(trackerSteps({ "HT-02": ["tidak_ada_gejala"] })).not.toContain("HT-03");
    expect(trackerSteps({ "HT-02": ["lelah", "pusing"] })).toContain("HT-03");
  });

  test("Menstruasi: HM-02/HM-03 bila HM-01 = Ya; HM-04 tetap; HM-05 bila HM-04 = Ya", () => {
    expect(trackerSteps({ KONTEKS: "menstruasi", "HM-01": "tidak" })).toEqual(["KONTEKS", "HT-01", "HT-02", "HT-04", "HM-01", "HM-04", "CERITA"]);
    expect(trackerSteps({ KONTEKS: "menstruasi", "HM-01": "ya", "HM-04": "ya" })).toEqual(
      ["KONTEKS", "HT-01", "HT-02", "HT-04", "HM-01", "HM-02", "HM-03", "HM-04", "HM-05", "CERITA"]
    );
  });

  test("Kehamilan: HK-02 hanya bila ada hambatan", () => {
    expect(trackerSteps({ KONTEKS: "kehamilan", "HK-01": ["tidak_ada"] })).not.toContain("HK-02");
    expect(trackerSteps({ KONTEKS: "kehamilan", "HK-01": ["aktivitas_berat"] })).toContain("HK-02");
  });

  test("Menyusui: HS-02 & HS-04 bila HS-01 = Ya; HS-03 bila HS-02 = Ya", () => {
    expect(trackerSteps({ KONTEKS: "menyusui", "HS-01": "tidak" })).toEqual(["KONTEKS", "HT-01", "HT-02", "HT-04", "HS-01", "CERITA"]);
    expect(trackerSteps({ KONTEKS: "menyusui", "HS-01": "ya", "HS-02": "ya" }).slice(4)).toEqual(["HS-01", "HS-02", "HS-03", "HS-04", "CERITA"]);
  });

  test("mengganti konteks menghapus jawaban cabang lama", () => {
    let a = { KONTEKS: "menstruasi", "HM-01": "ya", "HM-02": "hari_2", "HM-04": "ya", "HM-05": 3, "HT-01": "nyaman" };
    a = setTrackerAnswer(a, "KONTEKS", "lewati");
    expect(a).toEqual({ KONTEKS: "lewati", "HT-01": "nyaman" });
  });

  test("membatalkan gejala menghapus skalanya; membatalkan Lainnya menghapus teksnya", () => {
    let a = { "HT-02": ["lelah", "lainnya"], "HT-02-other": "pegal", "HT-03": { lelah: 2, lainnya: 1 } };
    a = setTrackerAnswer(a, "HT-02", ["lelah"]);
    expect(a["HT-03"]).toEqual({ lelah: 2 });
    expect(a["HT-02-other"]).toBeUndefined();
    a = setTrackerAnswer(a, "HT-02", ["tidak_ada_gejala"]);
    expect(a["HT-03"]).toBeUndefined();
  });

  test("HM-01 bukan Ya menghapus HM-02/HM-03; HS-02 bukan Ya menghapus HS-03", () => {
    let a = setTrackerAnswer({ KONTEKS: "menstruasi", "HM-01": "ya", "HM-02": "hari_1", "HM-03": "sedang" }, "HM-01", "tidak");
    expect(a["HM-02"]).toBeUndefined();
    expect(a["HM-03"]).toBeUndefined();
    a = setTrackerAnswer({ KONTEKS: "menyusui", "HS-01": "ya", "HS-02": "ya", "HS-03": 2 }, "HS-02", "tidak");
    expect(a["HS-03"]).toBeUndefined();
  });
});
