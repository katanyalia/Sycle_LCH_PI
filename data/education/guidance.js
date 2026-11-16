// Kumpulan panduan perlindungan umum (Info & Edukasi → Panduan Perlindungan).
// Setiap langkah disusun dari sumber yang sama dengan artikel Info & Edukasi.
// - `references`: kode E-xx di data/education/references.js (tidak ditampilkan di antarmuka).
// - `articles`: slug artikel di data/education.js untuk dibaca lebih lanjut.
export const GUIDANCE_GROUPS = [
  { value: "lingkungan", label: "Berdasarkan kondisi lingkungan" },
  { value: "kondisi", label: "Berdasarkan kondisimu" },
];

export const GUIDANCE_CATEGORIES = [
  {
    id: "panas",
    group: "lingkungan",
    icon: "panas",
    title: "Saat cuaca panas",
    description:
      "Langkah sederhana untuk menjaga tubuh tetap sejuk saat suhu dan Heat Index tinggi.",
    steps: [
      {
        action: "Minum air secara teratur",
        reason: "Tubuh kehilangan cairan lewat keringat. Jangan menunggu sampai haus.",
      },
      {
        action: "Atur waktu aktivitas",
        reason: "Kurangi aktivitas berat di luar saat siang terik. Pilih pagi atau sore hari.",
      },
      {
        action: "Cari tempat teduh atau ruangan sejuk",
        reason: "Tempat teduh dan ruangan berventilasi baik membantu tubuh mendingin.",
      },
      {
        action: "Pakai pakaian longgar dan ringan",
        reason: "Pakaian berwarna terang dan topi membantu mengurangi panas yang diserap tubuh.",
      },
    ],
    warning:
      "Segera cari pertolongan bila muncul bingung, bicara tidak jelas, pingsan, atau kejang. Segera ke IGD atau fasilitas kesehatan terdekat. Pusing, mual, lemas, dan sakit kepala juga tanda tubuh kepanasan.",
    references: ["E16", "E17", "E41"],
    articles: ["panas-dan-tubuh", "tanda-bahaya-penyakit-akibat-panas"],
  },
  {
    id: "kualitas-udara",
    group: "lingkungan",
    icon: "udara",
    title: "Saat kualitas udara buruk",
    description:
      "Cara mengurangi paparan polusi dan asap saat kategori ISPU Tidak Sehat atau lebih buruk.",
    steps: [
      {
        action: "Cek kategori kualitas udara sebelum keluar",
        reason: "Polusi berbeda menurut tempat dan jam, jadi waktu dan rute aktivitas bisa diatur.",
      },
      {
        action: "Kurangi aktivitas berat di luar ruangan",
        reason: "Tetap aktif bergerak, tetapi pindahkan olahraga berat ke dalam ruangan atau waktu lain.",
      },
      {
        action: "Jaga udara di dalam rumah",
        reason: "Tutup jendela saat ada asap dan jangan membakar apa pun di dalam rumah, misalnya lilin, dupa, atau rokok.",
      },
      {
        action: "Pakai respirator yang rapat bila harus keluar saat ada asap",
        reason: "Respirator seperti N95 menyaring partikel lebih baik daripada masker longgar. Bila punya penyakit jantung atau paru, tanyakan dulu ke tenaga kesehatan.",
      },
    ],
    warning:
      "Cari bantuan medis bila muncul keluhan baru atau keluhan memburuk, misalnya sesak napas. Ibu hamil, anak, dan orang dengan asma atau penyakit jantung perlu lebih berhati-hati.",
    references: ["E36", "E37", "E42", "E43"],
    articles: ["kualitas-udara-dan-pm25", "masker-asap-dan-paparan-polusi"],
  },
  {
    id: "uv",
    group: "lingkungan",
    icon: "uv",
    title: "Saat indeks UV tinggi",
    description:
      "Perlindungan kulit dan mata dari sinar matahari, sesuai tingkat indeks UV.",
    steps: [
      {
        action: "Cari tempat teduh saat tengah hari",
        reason: "Sinar UV paling kuat sekitar pukul 10.00–14.00. Saat indeks UV 8 ke atas, hindari berada di luar pada jam tersebut.",
      },
      {
        action: "Tutupi kulit dan pakai topi bertepi lebar",
        reason: "Pakaian dan topi melindungi kulit dari paparan langsung.",
      },
      {
        action: "Pakai kacamata hitam pelindung UV",
        reason: "Sinar UV juga dapat merusak mata.",
      },
      {
        action: "Oleskan tabir surya spektrum luas",
        reason: "Oleskan ulang secara berkala, terutama setelah berkeringat atau berenang.",
      },
    ],
    warning:
      "Indeks UV 0–2 umumnya aman. Mulai 3 ke atas, gunakan perlindungan, dan makin tinggi angkanya makin penting perlindungannya.",
    references: ["E34", "E38"],
    articles: ["indeks-uv-dan-perlindungan-matahari"],
  },
  {
    id: "menstruasi",
    group: "kondisi",
    icon: "menstruasi",
    title: "Saat menstruasi",
    description:
      "Menjaga kenyamanan saat haid, terutama ketika cuaca panas.",
    steps: [
      {
        action: "Minum air secara teratur",
        reason: "Cuaca panas membuat tubuh kehilangan cairan lewat keringat.",
      },
      {
        action: "Istirahat di tempat sejuk",
        reason: "Suhu tubuh cenderung sedikit lebih tinggi setelah ovulasi, jadi sebagian orang merasa lebih gerah.",
      },
      {
        action: "Redakan nyeri haid dengan cara sederhana",
        reason: "Kompres hangat di perut, pijat lembut, atau olahraga ringan dapat membantu. Untuk obat pereda nyeri, tanyakan ke apoteker atau tenaga kesehatan.",
      },
      {
        action: "Pilih pakaian yang longgar dan nyaman",
        reason: "Membantu tubuh tetap sejuk saat beraktivitas.",
      },
    ],
    warning:
      "Segera cari pertolongan bila nyeri sangat hebat atau lebih parah dari biasanya dan obat pereda nyeri tidak membantu. Periksakan diri juga bila perlu mengganti pembalut setiap 1–2 jam atau haid lebih dari 7 hari.",
    references: ["E09", "E10", "E21", "E23", "E17"],
    articles: [
      "menstruasi-suhu-tubuh-dan-cuaca-panas",
      "nyeri-haid-dan-haid-yang-banyak",
    ],
  },
  {
    id: "kehamilan",
    group: "kondisi",
    icon: "kehamilan",
    title: "Saat hamil",
    description:
      "Kehamilan menambah beban jantung dan pembuluh darah, sehingga panas dan polusi perlu lebih diperhatikan.",
    steps: [
      {
        action: "Minum sekitar 2–3 liter air per hari",
        reason: "Risiko utama panas pada kehamilan adalah dehidrasi. Saat cuaca panas, minum lebih banyak.",
      },
      {
        action: "Habiskan waktu di ruangan sejuk",
        reason: "Ruangan sejuk atau ber-AC membantu. Kipas angin cukup membantu bila suhu ruangan di bawah sekitar 32°C.",
      },
      {
        action: "Beraktivitas di pagi atau sore hari",
        reason: "Udara lebih sejuk. Saat panas ekstrem, kurangi jam kerja dan perjalanan bila memungkinkan.",
      },
      {
        action: "Lindungi diri dari matahari",
        reason: "Topi, kacamata hitam, dan tabir surya membantu mencegah kulit terbakar dan melasma.",
      },
      {
        action: "Kurangi paparan polusi dan asap",
        reason: "Hari panas sering disertai udara yang lebih buruk, dan gabungan keduanya lebih berisiko.",
      },
    ],
    warning:
      "Hubungi bidan atau dokter bila gerakan bayi berkurang dari biasanya, muncul kontraksi sebelum waktunya, atau ada tanda kepanasan dan dehidrasi. Segera cari pertolongan bila sakit kepala tidak hilang, penglihatan terganggu, atau tangan dan wajah sangat bengkak.",
    references: ["E01", "E02", "E40"],
    articles: [
      "kehamilan-dan-cuaca-panas",
      "polusi-udara-dan-kehamilan",
      "setelah-melahirkan-pemulihan-dan-tanda-bahaya",
    ],
  },
  {
    id: "menyusui",
    group: "kondisi",
    icon: "menyusui",
    title: "Saat menyusui",
    description:
      "Menjaga ibu dan bayi tetap nyaman dan cukup cairan saat cuaca panas.",
    steps: [
      {
        action: "Susui bayi lebih sering bila ia meminta",
        reason: "Bayi lebih sering haus saat panas, dan ASI menyesuaikan diri tanpa kehilangan gizinya.",
      },
      {
        action: "Tidak perlu air putih untuk bayi di bawah 6 bulan",
        reason: "Bayi yang mendapat ASI eksklusif sudah cukup cairan dari ASI, termasuk saat cuaca panas.",
      },
      {
        action: "Perhatikan tanda bayi kurang cairan",
        reason: "Bila bayi lebih jarang buang air kecil atau urinenya lebih gelap, susui lebih sering.",
      },
      {
        action: "Jaga cairan dan kenyamanan ibu",
        reason: "Minum air secara teratur dan menyusui di tempat yang sejuk dan teduh.",
      },
    ],
    warning:
      "Hubungi tenaga kesehatan bila tanda bayi kurang cairan berlanjut. Setelah melahirkan, segera cari pertolongan bila demam 38°C atau lebih atau perdarahan membasahi satu pembalut atau lebih dalam satu jam.",
    references: ["E26", "E27", "E39", "E40"],
    articles: [
      "menyusui-saat-cuaca-panas",
      "setelah-melahirkan-pemulihan-dan-tanda-bahaya",
    ],
  },
];
