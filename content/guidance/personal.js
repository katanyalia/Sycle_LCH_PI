// Butir panduan untuk hasil Personalisasi (WF-03 screen 24–26).
// DRAF DEMONSTRASI — disusun Claude dari sumber kandidat (belum disetujui) atas permintaan pemilik proyek
// untuk demonstrasi internal. Semua berstatus "draft", tampil berlabel, dan hilang bila sakelar K-01 dimatikan.
// Tim dapat mengganti atau menghapus butir mana pun (lihat docs/PANDUAN_KONTEN.md).
//
// `when` (semua harus terpenuhi agar butir relevan):
//   outdoor: true        → P-02 bukan "Tidak berencana keluar"
//   indoor: true         → P-01 "Di rumah" atau P-02 "Tidak berencana keluar"
//   condition: "..."     → P-00 sama dengan nilai ini
//   answerAny: { code, values } → jawaban pertanyaan `code` memuat salah satu nilai
// `signal` (opsional): "heat" | "uv" | "air" — dinaikkan prioritasnya bila data lingkungan valid menunjukkannya.

const AUTHOR = "Draf demonstrasi (Claude) — perlu ditinjau tim";
const UPDATED = "2026-10-15";

const item = (fields) => ({ status: "draft", author: AUTHOR, approvedBy: null, approvedAt: null, updatedAt: UPDATED, ...fields });

export const PERSONAL_GUIDANCE = [
  item({
    id: "pp-panas-minum",
    group: "panas",
    priority: 30,
    signal: "heat",
    when: {},
    text: "Minum air secara teratur selama beraktivitas, tanpa menunggu sampai sangat haus.",
    reason: "Saat udara panas, tubuh memerlukan lebih banyak cairan.",
    evidenceIds: ["E16", "E17"],
  }),
  item({
    id: "pp-panas-teduh",
    group: "panas",
    priority: 25,
    signal: "heat",
    when: { outdoor: true },
    text: "Rencanakan tempat teduh atau ruang sejuk untuk beristirahat di sela aktivitas luar ruangan.",
    reason: "Beristirahat di tempat yang lebih sejuk membantu tubuh beradaptasi dengan panas.",
    evidenceIds: ["E16", "E17"],
  }),
  item({
    id: "pp-panas-jam",
    group: "panas",
    priority: 20,
    signal: "heat",
    when: { outdoor: true },
    text: "Bila memungkinkan, atur aktivitas luar ruangan yang berat di luar jam terpanas siang hari.",
    reason: "Mengurangi aktivitas berat saat paling panas dapat membantu menghindari panas berlebih.",
    evidenceIds: ["E16", "E17"],
  }),
  item({
    id: "pp-panas-rumah",
    group: "panas",
    priority: 22,
    signal: "heat",
    when: { indoor: true },
    text: "Jaga ruangan tetap sejuk, misalnya dengan menutup tirai saat siang dan membuka ventilasi saat udara lebih sejuk.",
    reason: "Ruangan yang lebih sejuk membantu tubuh tetap nyaman saat cuaca panas.",
    evidenceIds: ["E16"],
  }),
  item({
    id: "pp-uv-teduh",
    group: "uv",
    priority: 18,
    signal: "uv",
    when: { outdoor: true },
    text: "Saat indeks UV 3 atau lebih, cari tempat teduh terutama di sekitar tengah hari.",
    reason: "Radiasi UV umumnya paling kuat di sekitar tengah hari.",
    evidenceIds: ["E34", "E38"],
  }),
  item({
    id: "pp-uv-pelindung",
    group: "uv",
    priority: 17,
    signal: "uv",
    when: { outdoor: true },
    text: "Gunakan perlindungan matahari seperti topi, pakaian yang menutupi kulit, kacamata hitam, atau tabir surya.",
    reason: "Perlindungan fisik dan tabir surya membantu mengurangi paparan UV pada kulit dan mata.",
    evidenceIds: ["E34", "E38"],
  }),
  item({
    id: "pp-udara-aktivitas",
    group: "kualitas-udara",
    priority: 16,
    signal: "air",
    when: { outdoor: true },
    text: "Saat kualitas udara kurang baik, kurangi aktivitas fisik berat di luar ruangan.",
    reason: "Aktivitas berat membuat kita menghirup lebih banyak udara.",
    evidenceIds: ["E36", "E37"],
  }),
  item({
    id: "pp-udara-masker",
    group: "kualitas-udara",
    priority: 15,
    signal: "air",
    when: { outdoor: true, answerAny: { code: "P-03", values: ["masker"] } },
    text: "Bila memakai masker, pilih jenis yang sesuai dan pastikan terpasang rapat di wajah.",
    reason: "Masker yang terpasang rapat lebih efektif menyaring partikel di udara.",
    evidenceIds: ["E37", "E42"],
  }),
  item({
    id: "pp-menstruasi-toilet",
    group: "menstruasi",
    priority: 40,
    when: { condition: "menstruasi", answerAny: { code: "PM-02", values: ["akses_toilet"] } },
    text: "Rencanakan lokasi toilet atau tempat mengganti pembalut di sepanjang rute dan tempat tujuanmu.",
    reason: "Akses ke fasilitas yang memadai adalah bagian dari kebutuhan menstruasi sehari-hari.",
    evidenceIds: ["E10"],
  }),
  item({
    id: "pp-menstruasi-istirahat",
    group: "menstruasi",
    priority: 38,
    when: { condition: "menstruasi", answerAny: { code: "PM-02", values: ["istirahat", "kurangi_aktivitas_berat"] } },
    text: "Sesuaikan jadwalmu agar ada waktu istirahat dan aktivitas yang lebih ringan sesuai kebutuhanmu hari ini.",
    reason: "Kamu menyebutkan kebutuhan ini; merencanakannya sejak awal membantu aktivitas tetap nyaman.",
    evidenceIds: ["E10"],
  }),
  item({
    id: "pp-kehamilan-panas",
    group: "kehamilan",
    priority: 40,
    signal: "heat",
    when: { condition: "kehamilan" },
    text: "Saat cuaca panas, sisihkan waktu beristirahat di tempat sejuk dan minum air secara teratur.",
    reason: "Panduan kesehatan masyarakat menyarankan perhatian lebih terhadap panas selama kehamilan.",
    evidenceIds: ["E02"],
  }),
  item({
    id: "pp-menyusui-tempat",
    group: "menyusui",
    priority: 40,
    when: { condition: "menyusui", answerAny: { code: "PS-01", values: ["ya", "belum_tahu"] } },
    text: "Rencanakan tempat yang nyaman dan sejuk untuk menyusui atau memompa ASI di lokasi tujuanmu.",
    reason: "Tempat yang nyaman mendukung kegiatan menyusui atau memompa ASI saat beraktivitas.",
    evidenceIds: ["E27"],
  }),
  item({
    id: "pp-menyusui-minum",
    group: "menyusui",
    priority: 36,
    signal: "heat",
    when: { condition: "menyusui" },
    text: "Saat cuaca panas, siapkan air minum untukmu selama menyusui atau memompa ASI.",
    reason: "Kebutuhan cairan dapat meningkat saat cuaca panas.",
    evidenceIds: ["E27"],
  }),
];
