// Artikel Info & Edukasi (WF-08 screen 62–63).
// T3-1: ISI DITULIS OLEH TIM. Claude hanya memasukkan teks yang diberikan tim apa adanya.
// Panduan pengisian: docs/PANDUAN_KONTEN.md. Setiap artikel dicek oleh lib/content/rules.js:
// tanpa referensi / referensi internal atau safety draft / status tidak sah → tidak ditampilkan.
//
// Bentuk satu artikel:
// {
//   slug: "contoh-slug",                    // huruf kecil & tanda hubung, unik
//   category: "panas",                      // panas | kualitas-udara | uv | kesehatan-perempuan
//   title: "Judul artikel",
//   summary: "Ringkasan 1–2 kalimat untuk kartu katalog.",
//   sections: [{ heading: "Subjudul", paragraphs: ["Paragraf 1", "Paragraf 2"] }],
//   terms: ["heat-index"],                  // id istilah glosarium yang relevan (opsional)
//   limitations: "Batasan informasi ini.",  // wajib diisi tim
//   evidenceIds: ["E16"],                   // kode sumber dari content/evidence/sources.js (≥ 1)
//   status: "draft",                        // draft | approved
//   author: "Nama penulis (tim)",
//   approvedBy: null, approvedAt: null,     // wajib untuk "approved" (lihat content/approvers.js)
//   updatedAt: "2026-10-15",
//   moreEvidenceIds: ["E33"],               // opsional: referensi lain untuk topik ini (boleh studi populasi /
//                                           // safety draft; ditampilkan sebagai daftar bacaan, bukan dasar isi)
// }
//
// E-1 (15 Oktober 2026, disetujui pemilik proyek): tujuh topik di bawah adalah DRAF DEMONSTRASI yang ditulis Claude
// hanya dari isi sumber resmi yang dibaca langsung (evidenceIds). Belum ditinjau tim; status evidence tetap
// not_granted. Tim boleh mengganti atau menghapusnya kapan saja.
const DEMO_AUTHOR = "Draf demonstrasi (Claude) — perlu ditinjau tim";

export const ARTICLES = [
  {
    slug: "panas-dan-tubuh",
    category: "panas",
    title: "Panas dan tubuh: mengapa cuaca panas perlu diperhatikan",
    summary: "Cara tubuh mendinginkan diri, siapa yang lebih rentan saat cuaca panas, dan langkah umum yang disarankan WHO dan CDC.",
    sections: [
      {
        heading: "Bagaimana tubuh menghadapi panas",
        paragraphs: [
          "Tubuh berusaha menjaga suhunya dengan melepaskan panas, misalnya lewat keringat. Menurut WHO, ketika tubuh tidak mampu melepaskan panas dengan cukup, risiko kelelahan akibat panas (heat exhaustion) dan sengatan panas (heatstroke) meningkat. Usaha tubuh untuk mendinginkan diri juga memberi beban pada jantung dan ginjal.",
          "CDC menyebut panas dapat memengaruhi siapa saja dan dapat memperburuk kondisi kesehatan yang sudah ada.",
        ],
      },
      {
        heading: "Siapa yang lebih rentan",
        paragraphs: [
          "WHO dan CDC menyebut beberapa kelompok lebih rentan saat cuaca panas, antara lain orang berusia di atas 65 tahun, bayi dan anak kecil, perempuan hamil, orang dengan penyakit jantung, paru, atau ginjal, serta orang yang bekerja atau berolahraga di luar ruangan.",
          "Menurut WHO, kerentanan juga dipengaruhi pekerjaan, kondisi tempat tinggal, dan ada tidaknya akses ke tempat yang sejuk.",
        ],
      },
      {
        heading: "Langkah umum yang disarankan",
        paragraphs: [
          "Hindari aktivitas berat pada jam terpanas dan carilah tempat teduh. Atur kegiatan di luar ruangan pada waktu yang lebih sejuk, misalnya pagi atau sore (WHO, CDC).",
          "Minum air secara teratur sepanjang hari, dan batasi minuman manis, berkafein, atau beralkohol (CDC). Kenakan pakaian ringan dan longgar; mandi air sejuk atau kain basah dapat membantu mendinginkan kulit (WHO).",
          "Pantau peringatan cuaca panas resmi, dan sempatkan menengok keluarga, teman, atau tetangga yang lebih rentan (WHO, CDC).",
        ],
      },
      {
        heading: "Kapan mencari bantuan",
        paragraphs: [
          "WHO menyebut sengatan panas (heatstroke) sebagai keadaan darurat medis. Bila kamu atau orang di sekitarmu merasa sangat tidak sehat saat cuaca panas, segera cari bantuan tenaga kesehatan.",
        ],
      },
    ],
    terms: ["heat-index", "kelembapan-relatif", "dehidrasi"],
    limitations:
      "Informasi ini bersifat umum untuk populasi dan tidak menilai kondisi tubuhmu secara pribadi. Angka Heat Index di Beranda adalah estimasi rasa panas dari data wilayah, bukan ukuran paparan pribadimu.",
    evidenceIds: ["E16", "E17"],
    moreEvidenceIds: ["E41"],
    status: "draft",
    author: DEMO_AUTHOR,
    approvedBy: null,
    approvedAt: null,
    updatedAt: "2026-10-15",
  },
  {
    slug: "kualitas-udara-dan-pm25",
    category: "kualitas-udara",
    title: "Kualitas udara dan PM2.5",
    summary: "Apa itu polusi udara luar ruangan dan PM2.5, mengapa ISPU berbeda dari US AQI, dan langkah umum untuk mengurangi paparan.",
    sections: [
      {
        heading: "Apa itu polusi udara luar ruangan",
        paragraphs: [
          "WHO menyebut polusi udara luar ruangan sebagai masalah kesehatan lingkungan utama yang terjadi di kota maupun desa. Pencemar utamanya antara lain partikulat (PM), ozon, nitrogen dioksida, sulfur dioksida, dan karbon monoksida.",
          "PM2.5 adalah partikel di udara yang berukuran 2,5 mikrometer atau lebih kecil (BMKG). Menurut WHO, paparan partikel halus berkaitan dengan penyakit jantung dan pernapasan pada tingkat populasi.",
        ],
      },
      {
        heading: "Membaca indeks kualitas udara",
        paragraphs: [
          "WHO menjelaskan bahwa indeks kualitas udara tidak memiliki metode perhitungan yang seragam antarnegara, sehingga angkanya tidak bisa dibandingkan begitu saja.",
          "Karena itu SYCLE selalu menuliskan standar yang dipakai: ISPU untuk data resmi Indonesia, dan US AQI hanya sebagai data cadangan bila ISPU tidak tersedia.",
        ],
      },
      {
        heading: "Langkah umum mengurangi paparan",
        paragraphs: [
          "Menurut WHO, mengatur lokasi, waktu, dan jenis kegiatan di luar ruangan dapat mengubah paparan secara berarti, karena tingkat polusi berbeda menurut tempat dan waktu. Tetap di dalam ruangan dapat membantu, tetapi manfaatnya bergantung pada kualitas udara di dalam ruangan, misalnya asap masak, rokok, atau dupa.",
          "WHO menyarankan kelompok yang lebih rentan, seperti perempuan hamil, anak-anak, lansia, dan orang dengan penyakit jantung atau pernapasan, untuk mengurangi paparan jangka pendek.",
          "Tentang masker: CDC menjelaskan respirator yang menempel rapat di wajah lebih melindungi daripada masker biasa, tetapi masker maupun respirator tidak menyaring gas. Orang dengan penyakit jantung atau paru disarankan bertanya kepada dokter sebelum memakai respirator.",
        ],
      },
    ],
    terms: ["pm25", "ispu", "us-aqi"],
    limitations:
      "Data kualitas udara di SYCLE berasal dari stasiun atau model untuk wilayah, bukan udara yang kamu hirup secara pribadi. Informasi ini tidak dapat menjelaskan asal keluhan yang kamu rasakan.",
    evidenceIds: ["E36", "E37", "E42", "E18"],
    moreEvidenceIds: ["E33", "E43"],
    status: "draft",
    author: DEMO_AUTHOR,
    approvedBy: null,
    approvedAt: null,
    updatedAt: "2026-10-15",
  },
  {
    slug: "indeks-uv-dan-perlindungan-matahari",
    category: "uv",
    title: "Indeks UV dan perlindungan dari sinar matahari",
    summary: "Arti angka Indeks UV menurut WHO dan langkah perlindungan umum dari sinar ultraviolet.",
    sections: [
      {
        heading: "Apa itu Indeks UV",
        paragraphs: [
          "Indeks UV adalah ukuran tingkat radiasi ultraviolet (UV) dari matahari. Angkanya mulai dari 0; makin tinggi angkanya, makin besar potensi kerusakan pada kulit dan mata, dan makin cepat kerusakan itu bisa terjadi (WHO).",
          "Tingkat UV berubah sepanjang hari. Nilai yang biasa dilaporkan adalah nilai tertinggi harian, yang terjadi di sekitar tengah hari matahari.",
        ],
      },
      {
        heading: "Arti rentang angka",
        paragraphs: [
          "WHO mengelompokkan Indeks UV sebagai berikut. 0–2: risiko terbatas. 3–7: carilah tempat teduh saat tengah hari, serta pakai baju, tabir surya, dan topi. 8 ke atas: hindari berada di luar saat tengah hari, berteduh, dan baju, tabir surya, serta topi wajib dipakai.",
        ],
      },
      {
        heading: "Langkah perlindungan umum",
        paragraphs: [
          "Batasi paparan sinar matahari sekitar dua jam sebelum hingga dua jam sesudah tengah hari matahari. Menurut WHO, pakaian adalah perlindungan terbaik di luar ruangan; topi bertepi lebar melindungi mata, telinga, wajah, dan leher; kacamata hitam dengan perlindungan UV-A dan UV-B (berlabel UV400) melindungi mata.",
          "Pakai tabir surya spektrum luas minimal SPF 30 pada kulit yang tidak tertutup pakaian, lalu oleskan ulang setiap dua jam dan setelah berkeringat atau berenang. WHO mengingatkan tabir surya tidak boleh dipakai untuk memperpanjang waktu berjemur, dan tempat teduh seperti pohon atau payung tidak melindungi sepenuhnya.",
        ],
      },
    ],
    terms: ["indeks-uv", "data-model"],
    limitations:
      "Indeks UV di SYCLE berasal dari data model untuk wilayahmu, bukan pengukuran paparan pribadi. Kebutuhan perlindungan setiap orang dapat berbeda.",
    evidenceIds: ["E34", "E38"],
    status: "draft",
    author: DEMO_AUTHOR,
    approvedBy: null,
    approvedAt: null,
    updatedAt: "2026-10-15",
  },
  {
    slug: "menstruasi-suhu-tubuh-dan-cuaca-panas",
    category: "kesehatan-perempuan",
    title: "Menstruasi, suhu tubuh, dan cuaca panas",
    summary: "Mengenal kesehatan menstruasi, nyeri haid, dan apa yang diketahui penelitian tentang suhu tubuh selama siklus.",
    sections: [
      {
        heading: "Kesehatan menstruasi",
        paragraphs: [
          "WHO mendefinisikan kesehatan menstruasi sebagai kondisi ketika seseorang mendapat informasi dan dukungan untuk menjalani menstruasi dengan bermartabat, termasuk akses ke bahan menstruasi, air bersih, sanitasi, layanan kesehatan, dan bebas dari stigma.",
          "Menurut WHO, siklus menstruasi rata-rata berlangsung 21 sampai 35 hari, dan nyeri haid umum terjadi: lebih dari 2 dari 3 orang yang menstruasi mengalaminya.",
        ],
      },
      {
        heading: "Nyeri haid (dismenore)",
        paragraphs: [
          "Dismenore adalah istilah medis untuk nyeri haid. Kram terjadi karena rahim berkontraksi untuk meluruhkan lapisannya (Cleveland Clinic). Langkah kenyamanan yang disebut sumber ini antara lain kompres hangat di perut bawah atau punggung, istirahat tambahan, pijatan ringan, dan olahraga teratur.",
          "Sumber yang sama menyarankan menghubungi tenaga kesehatan bila nyeri terasa berat atau tidak biasa, berlangsung lebih dari tiga hari, atau membuatmu tidak bisa sekolah, bekerja, atau beraktivitas seperti biasa.",
        ],
      },
      {
        heading: "Suhu tubuh selama siklus",
        paragraphs: [
          "Sebuah tinjauan ilmiah menjelaskan bahwa suhu inti tubuh sekitar 0,3–0,7°C lebih tinggi pada fase luteal (setelah ovulasi) dibandingkan fase sebelum ovulasi. Tinjauan sistematis lain tentang olahraga di cuaca panas menemukan suhu awal tubuh yang lebih tinggi pada fase luteal, tetapi datanya masih terbatas karena sebagian besar penelitian panas dilakukan pada laki-laki.",
          "Temuan ini menggambarkan kelompok peserta penelitian. Temuan ini tidak dapat dipakai untuk menebak fase siklusmu atau memperkirakan bagaimana tubuhmu merespons panas.",
        ],
      },
    ],
    terms: ["dismenore", "fase-luteal", "tinjauan-sistematis"],
    limitations:
      "Penelitian tentang siklus menstruasi dan panas masih terbatas. Informasi ini tidak menjelaskan asal nyeri atau keluhan menstruasi yang kamu alami. Bila nyeri atau perdarahan terasa berat, bicarakan dengan tenaga kesehatan.",
    evidenceIds: ["E10", "E22", "E09", "E11"],
    moreEvidenceIds: ["E12", "E21", "E23"],
    status: "draft",
    author: DEMO_AUTHOR,
    approvedBy: null,
    approvedAt: null,
    updatedAt: "2026-10-15",
  },
  {
    slug: "kehamilan-dan-cuaca-panas",
    category: "kesehatan-perempuan",
    title: "Kehamilan dan cuaca panas",
    summary: "Mengapa cuaca panas perlu diperhatikan selama kehamilan dan langkah umum yang disarankan WHO dan CDC.",
    sections: [
      {
        heading: "Mengapa panas perlu diperhatikan",
        paragraphs: [
          "CDC menjelaskan bahwa selama hamil tubuh bekerja lebih keras untuk mendinginkan diri dan bayi yang sedang berkembang, dan kehamilan dapat meningkatkan risiko dehidrasi sehingga tubuh lebih sulit mendingin lewat keringat.",
          "WHO Eropa menyebut dehidrasi sebagai risiko mendasar paparan panas, dan panas dapat menambah rasa lelah. Bayi dalam kandungan tidak merasakan panas secara langsung, tetapi merespons perubahan pada tubuh ibu.",
        ],
      },
      {
        heading: "Langkah umum yang disarankan",
        paragraphs: [
          "Minum air 2–3 liter per hari dan lebih banyak saat cuaca panas (WHO Eropa). Hindari aktivitas yang sangat berat dan cukup istirahat (CDC).",
          "Habiskan waktu di tempat yang sejuk, bawa kain yang bisa dibasahi untuk mendinginkan diri, dan pilih waktu berjalan kaki di pagi atau sore hari. Gunakan topi, tabir surya, atau berteduh untuk mengurangi kulit terbakar (WHO Eropa).",
          "CDC menyarankan membuat rencana menghadapi cuaca panas bersama dokter atau bidan, serta memantau informasi cuaca dan kualitas udara setempat.",
        ],
      },
      {
        heading: "Kapan menghubungi tenaga kesehatan",
        paragraphs: [
          "WHO Eropa menyarankan menghubungi bidan atau tenaga kesehatan kehamilan kapan pun gerakan bayi terasa berkurang dari biasanya, termasuk saat gelombang panas. CDC menyarankan segera mencari pertolongan medis bila muncul gejala penyakit akibat panas.",
        ],
      },
      {
        heading: "Tentang penelitian populasi",
        paragraphs: [
          "Beberapa tinjauan sistematis menemukan hubungan antara suhu tinggi selama kehamilan dan hasil kehamilan pada tingkat populasi. Temuan ini menggambarkan kelompok besar orang, bukan perhitungan risiko pribadi.",
        ],
      },
    ],
    terms: ["dehidrasi", "studi-populasi", "tinjauan-sistematis", "meta-analisis"],
    limitations:
      "Informasi ini umum dan tidak menggantikan pemeriksaan kehamilan. Data lingkungan di SYCLE tidak dapat menilai kondisi kehamilanmu.",
    evidenceIds: ["E01", "E02", "E04", "E05", "E46"],
    moreEvidenceIds: ["E06", "E07", "E03", "E40"],
    status: "draft",
    author: DEMO_AUTHOR,
    approvedBy: null,
    approvedAt: null,
    updatedAt: "2026-10-15",
  },
  {
    slug: "menyusui-saat-cuaca-panas",
    category: "kesehatan-perempuan",
    title: "Menyusui saat cuaca panas",
    summary: "Apa kata WHO dan NHS tentang kebutuhan cairan bayi yang mendapat ASI saat cuaca panas.",
    sections: [
      {
        heading: "ASI dan kebutuhan cairan bayi",
        paragraphs: [
          "WHO merekomendasikan ASI eksklusif selama enam bulan pertama. Menurut WHO, ASI mengandung lebih dari 80% air, sehingga bayi di bawah enam bulan yang mendapat ASI eksklusif tidak perlu diberi air tambahan, bahkan saat cuaca panas.",
          "WHO menjelaskan bahwa memberi air pada bayi di bawah enam bulan dapat mengurangi asupan ASI.",
        ],
      },
      {
        heading: "Saat cuaca panas",
        paragraphs: [
          "Panduan NHS menyebut bayi mungkin ingin menyusu lebih sering saat cuaca panas karena haus. Perhatikan jumlah dan warna air seni bayi: warna yang diharapkan kuning muda atau jernih. Bila air seni lebih sedikit dari biasanya atau warnanya lebih gelap, tawarkan ASI lebih sering.",
          "Untuk bayi di atas enam bulan yang sudah makan makanan padat, sedikit air putih dapat ditawarkan saat makan dan di antaranya (NHS).",
        ],
      },
      {
        heading: "Untuk ibu yang menyusui",
        paragraphs: [
          "Langkah umum saat cuaca panas dari WHO dan CDC, seperti minum air secara teratur dan beristirahat di tempat yang sejuk, juga berlaku untukmu. Lihat juga topik Panas dan tubuh.",
        ],
      },
    ],
    terms: ["dehidrasi"],
    limitations:
      "Informasi ini umum. Untuk pertanyaan tentang kondisi bayi atau menyusui secara pribadi, bicarakan dengan bidan, konselor laktasi, atau tenaga kesehatan.",
    evidenceIds: ["E26", "E39", "E27", "E16", "E17"],
    status: "draft",
    author: DEMO_AUTHOR,
    approvedBy: null,
    approvedAt: null,
    updatedAt: "2026-10-15",
  },
  {
    slug: "perubahan-iklim-dan-kesehatan-perempuan",
    category: "kesehatan-perempuan",
    title: "Perubahan iklim dan kesehatan perempuan",
    summary: "Gambaran umum dari WHO tentang mengapa perubahan iklim menjadi perhatian bagi kesehatan ibu, bayi baru lahir, dan anak.",
    sections: [
      {
        heading: "Mengapa iklim menjadi perhatian",
        paragraphs: [
          "Publikasi WHO menyebut bahaya iklim, termasuk panas ekstrem, berkaitan dengan meningkatnya komplikasi kehamilan pada tingkat populasi. Publikasi ini juga menyebut gizi, air, kebersihan, dan sanitasi yang buruk sebagai risiko kesehatan, serta dampak iklim pada kesehatan mental seperti stres dan kecemasan.",
          "Menurut WHO, dampak ini dapat berlangsung jangka panjang bagi perempuan, bayi baru lahir, dan anak, sehingga memerlukan tindakan bersama.",
        ],
      },
      {
        heading: "Konteks Indonesia",
        paragraphs: [
          "Kementerian Kesehatan RI telah menetapkan Rencana Aksi Nasional Mitigasi dan Adaptasi Perubahan Iklim Sektor Kesehatan Tahun 2025–2030.",
        ],
      },
      {
        heading: "Apa artinya bagi kamu",
        paragraphs: [
          "Informasi lingkungan di SYCLE membantumu mengenali kondisi sekitar. Langkah perlindungan umum tersedia di topik Panas, Kualitas udara, dan UV.",
        ],
      },
    ],
    terms: ["studi-populasi"],
    limitations: "Topik ini memberi konteks kebijakan dan populasi, bukan panduan klinis atau penilaian kondisi pribadi.",
    evidenceIds: ["E08", "E20"],
    moreEvidenceIds: ["E03"],
    status: "draft",
    author: DEMO_AUTHOR,
    approvedBy: null,
    approvedAt: null,
    updatedAt: "2026-10-15",
  },
];
