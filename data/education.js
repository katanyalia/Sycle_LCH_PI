import { EVIDENCE_SOURCES } from "@/data/education/references";
import { GLOSSARY } from "@/data/education/glossary";

// Artikel Info & Edukasi.
// - `terms`: id istilah di data/education/glossary.js yang dipakai di artikel.
// - `healthcareLink`: tampilkan tautan ke Healthcare untuk artikel berisi tanda bahaya (Master V2.1 K-09).
// - `askQuestion`: pertanyaan yang otomatis terisi saat pengguna menekan tombol Tanya Sycle di artikel.
// - `references`: kode E-xx yang menunjuk ke data/education/references.js (tidak ditampilkan di antarmuka).
// - Setiap bagian (`sections`) boleh berisi `paragraphs` (teks) dan/atau `items` (daftar poin).
// - Isi disusun hanya dari sumber di `references`. Isi `status: "draft"` bila artikel perlu ditandai belum final.
export const educationArticles = [
  {
    slug: "panas-dan-tubuh",
    category: "Panas",
    title: "Panas dan tubuh: mengapa cuaca panas perlu diperhatikan",
    summary:
      "Cara tubuh mendinginkan diri, siapa yang lebih rentan saat cuaca panas, dan langkah sederhana untuk tetap aman.",
    status: "published",
    references: ["E16", "E17"],
    terms: ["heat-index", "kelembapan-relatif", "dehidrasi", "gelombang-panas"],
    askQuestion: "Bagaimana cara menjaga tubuh tetap aman saat cuaca panas?",
    // Kartu edukasi 5 bagian (Master V2.1 5.7): judul, ringkasan, yang bisa kamu lakukan, yang perlu diketahui (= limitations), sumber (= references).
    card: {
      summary:
        "Tubuh mendinginkan diri dengan berkeringat dan mengalirkan lebih banyak darah ke kulit. Saat udara panas dan lembap, keringat sulit menguap sehingga tubuh lebih sulit mendingin. Karena itu Sycle menampilkan Heat Index, yaitu suhu yang terasa, bukan hanya suhu udara. Ibu hamil, bayi, lansia, pekerja luar ruangan, dan orang dengan penyakit kronis lebih rentan terhadap panas.",
      actions: [
        "Minum air secara teratur, jangan menunggu sampai haus.",
        "Kurangi aktivitas berat di luar saat siang terik; pilih pagi atau sore hari.",
        "Cari tempat teduh atau ruangan yang sejuk dan berventilasi baik.",
        "Pakai pakaian longgar, ringan, berwarna terang, dan topi saat di luar.",
      ],
    },
    sections: [
      {
        heading: "Bagaimana tubuh mengatasi panas",
        paragraphs: [
          "Tubuh menjaga suhunya tetap stabil dengan berkeringat dan mengalirkan lebih banyak darah ke kulit. Keringat yang menguap membawa panas keluar dari tubuh.",
          "Saat udara panas dan lembap, keringat lebih sulit menguap sehingga tubuh lebih sulit mendingin. Karena itu Sycle menampilkan Heat Index (suhu yang terasa), bukan hanya suhu udara."
        ]
      },
      {
        heading: "Siapa yang lebih rentan",
        paragraphs: [
          "Panas bisa dirasakan siapa saja, tetapi beberapa kelompok lebih rentan, antara lain:"
        ],
        items: [
          "Ibu hamil",
          "Bayi dan anak kecil",
          "Lansia",
          "Orang yang bekerja atau beraktivitas lama di luar ruangan",
          "Orang dengan penyakit kronis, misalnya penyakit jantung, paru, atau ginjal"
        ]
      },
      {
        heading: "Yang bisa dilakukan",
        items: [
          "Minum air secara teratur, jangan menunggu sampai haus.",
          "Kurangi aktivitas berat di luar ruangan saat siang terik. Pilih pagi atau sore hari.",
          "Cari tempat yang teduh atau ruangan yang sejuk dan berventilasi baik.",
          "Pakai pakaian yang longgar, ringan, dan berwarna terang, serta topi saat di luar.",
          "Cek kondisi lingkungan di Beranda Sycle sebelum merencanakan aktivitas."
        ]
      },
      {
        heading: "Kapan perlu waspada",
        paragraphs: [
          "Pusing, mual, lemas, atau sakit kepala saat cuaca panas bisa menjadi tanda tubuh kepanasan. Baca artikel “Tanda bahaya penyakit akibat panas” untuk mengenali kapan perlu pertolongan."
        ]
      }
    ],
    limitations:
      "Data lingkungan di Sycle menggambarkan kondisi wilayah, bukan suhu tubuhmu. Respons tubuh terhadap panas berbeda pada setiap orang."
  },
  {
    slug: "tanda-bahaya-penyakit-akibat-panas",
    category: "Panas",
    title: "Tanda bahaya penyakit akibat panas",
    summary:
      "Kenali gejala sengatan panas (heat stroke), kelelahan panas, dan keluhan lain, serta pertolongan pertamanya.",
    status: "published",
    references: ["E41", "E17", "E16"],
    terms: ["heat-stroke", "kelelahan-panas", "dehidrasi"],
    askQuestion: "Apa bedanya kelelahan panas dan sengatan panas?",
    healthcareLink: true,
    card: {
      summary:
        "Penyakit akibat panas terjadi ketika tubuh tidak mampu lagi mendinginkan dirinya. Sengatan panas (heat stroke) adalah keadaan darurat yang ditandai bingung, bicara tidak jelas, pingsan, kejang, dan suhu tubuh sangat tinggi. Kelelahan panas ditandai sakit kepala, mual, pusing, lemas, haus, dan berkeringat banyak. Keluhan lain akibat panas antara lain pingsan, kram panas, dan biang keringat.",
      actions: [
        "Bila muncul tanda sengatan panas, segera bawa ke IGD atau fasilitas kesehatan terdekat.",
        "Pindahkan orang yang kepanasan ke tempat teduh atau sejuk.",
        "Dinginkan tubuh dengan air dingin, kain basah, atau kompres dingin.",
        "Minum air sedikit-sedikit tetapi sering bila masih sadar penuh.",
      ],
    },
    sections: [
      {
        heading: "Saat tubuh tidak bisa mendingin",
        paragraphs: [
          "Penyakit akibat panas terjadi ketika tubuh tidak mampu lagi mendinginkan dirinya. Ada yang ringan, ada juga yang darurat dan perlu pertolongan segera."
        ]
      },
      {
        heading: "Sengatan panas (heat stroke) — darurat",
        paragraphs: [
          "Gejala: bingung, bicara tidak jelas, pingsan, kulit panas dan kering atau berkeringat sangat banyak, kejang, dan suhu tubuh sangat tinggi.",
          "Yang dilakukan:"
        ],
        items: [
          "Segera bawa ke IGD atau fasilitas kesehatan terdekat. Jangan tinggalkan orang tersebut sendirian.",
          "Pindahkan ke tempat teduh atau sejuk dan lepaskan pakaian luarnya.",
          "Dinginkan tubuhnya dengan air dingin, kain basah, atau kompres dingin di kepala, leher, ketiak, dan lipatan paha.",
          "Kipasi udara di sekitarnya."
        ]
      },
      {
        heading: "Kelelahan panas (heat exhaustion)",
        paragraphs: [
          "Gejala: sakit kepala, mual, pusing, lemas, mudah marah, haus, berkeringat banyak, suhu tubuh naik, dan jarang buang air kecil.",
          "Yang dilakukan:"
        ],
        items: [
          "Pindah ke tempat yang lebih sejuk.",
          "Minum air dingin sedikit-sedikit tetapi sering.",
          "Lepaskan pakaian yang berlebih, termasuk sepatu dan kaus kaki.",
          "Kompres dingin atau basuh kepala, wajah, dan leher dengan air dingin.",
          "Periksakan diri ke fasilitas kesehatan."
        ]
      },
      {
        heading: "Keluhan lain akibat panas",
        items: [
          "Pingsan atau pusing karena panas: duduk atau berbaring di tempat sejuk, lalu minum perlahan.",
          "Kram panas (kram di perut, lengan, atau kaki): minum air dan konsumsi camilan atau minuman yang mengganti elektrolit. Cari bantuan medis bila kram berlangsung lebih dari 1 jam.",
          "Biang keringat (bintik merah kecil di leher, dada, lipatan payudara, atau lipatan siku): pindah ke tempat yang lebih sejuk, jaga kulit tetap kering, dan hindari salep atau krim.",
          "Nyeri atau kram otot disertai urine berwarna gelap seperti teh: hentikan aktivitas, minum air, dan segera periksakan diri."
        ]
      }
    ],
    limitations:
      "Daftar ini membantu mengenali tanda bahaya, bukan untuk mendiagnosis. Jika ragu, segera cari pertolongan medis."
  },
  {
    slug: "kualitas-udara-dan-pm25",
    category: "Kualitas Udara",
    title: "Kualitas udara dan PM2.5",
    summary:
      "Apa itu PM2.5, dampaknya bagi kesehatan, pedoman WHO, dan cara membaca kategori kualitas udara di Sycle.",
    status: "published",
    references: ["E36", "E33", "E18"],
    terms: ["pm25", "ispu", "us-aqi", "pengamatan"],
    askQuestion: "Apa itu PM2.5 dan apa dampaknya bagi kesehatan?",
    card: {
      summary:
        "PM2.5 adalah partikel sangat halus di udara yang bisa terhirup jauh ke dalam paru-paru. Menurut WHO, paparannya dikaitkan dengan penyakit jantung, penyakit pernapasan, dan kanker. Pedoman WHO (2021) untuk PM2.5 adalah rata-rata 5 µg/m³ per tahun dan 15 µg/m³ per 24 jam. Sycle menampilkan ISPU dengan kategori Baik sampai Berbahaya, yang lebih mudah dipakai sehari-hari daripada angka konsentrasi.",
      actions: [
        "Cek kategori kualitas udara di Beranda Sycle sebelum beraktivitas di luar.",
        "Saat kategori Tidak Sehat atau lebih buruk, kurangi aktivitas berat di luar ruangan.",
        "Baca panduan masker dan cara mengurangi paparan polusi.",
      ],
    },
    sections: [
      {
        heading: "Apa itu PM2.5?",
        paragraphs: [
          "PM2.5 adalah partikel sangat halus di udara dengan ukuran 2,5 mikrometer atau lebih kecil. Karena sangat kecil, partikel ini bisa terhirup jauh ke dalam paru-paru.",
          "Sumbernya antara lain asap kendaraan, industri, pembakaran sampah, dan kebakaran hutan."
        ]
      },
      {
        heading: "Mengapa penting",
        paragraphs: [
          "Menurut WHO, PM2.5 adalah polutan utama di balik dampak kesehatan polusi udara luar ruangan. Paparannya dikaitkan dengan penyakit jantung, penyakit pernapasan, dan kanker.",
          "Pada 2019, polusi udara luar ruangan diperkirakan menyebabkan sekitar 4,2 juta kematian dini di dunia, dan 99% penduduk dunia tinggal di wilayah yang melebihi pedoman kualitas udara WHO."
        ]
      },
      {
        heading: "Pedoman WHO",
        paragraphs: [
          "Pedoman kualitas udara WHO (2021) untuk PM2.5 adalah rata-rata 5 µg/m³ per tahun dan 15 µg/m³ per 24 jam.",
          "Angka ini adalah acuan jangka panjang untuk kebijakan, bukan batas “aman” atau “tidak aman” untuk satu hari tertentu."
        ]
      },
      {
        heading: "Konsentrasi dan indeks itu berbeda",
        paragraphs: [
          "BMKG menampilkan konsentrasi PM2.5 dalam satuan µg/m³. Sycle menampilkan ISPU, yaitu indeks dengan kategori Baik, Sedang, Tidak Sehat, Sangat Tidak Sehat, dan Berbahaya.",
          "Angka konsentrasi dan angka indeks tidak bisa dipertukarkan begitu saja. Yang lebih mudah dipakai sehari-hari adalah kategorinya."
        ]
      },
      {
        heading: "Yang bisa dilakukan",
        items: [
          "Cek kategori kualitas udara di Beranda Sycle sebelum beraktivitas di luar.",
          "Saat kategori Tidak Sehat atau lebih buruk, kurangi aktivitas berat di luar ruangan.",
          "Baca artikel “Masker, asap, dan cara mengurangi paparan polusi” untuk langkah lebih lanjut."
        ]
      }
    ],
    limitations:
      "Kualitas udara di Sycle berasal dari stasiun atau data model terdekat dan bisa berbeda dengan kondisi tepat di lokasimu. Informasi ini tidak menentukan penyebab keluhan yang kamu rasakan."
  },
  {
    slug: "masker-asap-dan-paparan-polusi",
    category: "Kualitas Udara",
    title: "Masker, asap, dan cara mengurangi paparan polusi",
    summary:
      "Langkah mengurangi paparan saat udara buruk atau ada asap kebakaran hutan, termasuk cara memilih dan memakai masker.",
    status: "published",
    references: ["E37", "E42", "E43"],
    terms: ["respirator", "pm25", "ispu"],
    askQuestion: "Masker apa yang bisa melindungi dari asap dan polusi?",
    healthcareLink: true,
    card: {
      summary:
        "Cara terbaik melindungi kesehatan dari polusi adalah mengurangi sumbernya lewat kebijakan, tetapi tindakan pribadi tetap bisa membantu. Saat udara buruk atau ada asap, tetap di ruangan yang udaranya lebih bersih dan hindari pembakaran di dalam rumah. Respirator seperti N95 menyaring partikel lebih baik daripada masker longgar, tetapi tidak menyaring gas. Ibu hamil, anak, dan orang dengan penyakit paru atau jantung perlu lebih berhati-hati.",
      actions: [
        "Tutup jendela saat ada asap dan jangan membakar apa pun di dalam rumah.",
        "Atur waktu dan rute aktivitas di luar saat polusi tinggi.",
        "Bila harus keluar saat ada asap, pakai respirator yang menempel rapat.",
        "Bila punya penyakit jantung atau paru, tanyakan dulu ke tenaga kesehatan sebelum memakai respirator.",
      ],
    },
    sections: [
      {
        heading: "Udara bersih adalah tanggung jawab bersama",
        paragraphs: [
          "WHO menekankan bahwa cara terbaik melindungi kesehatan dari polusi adalah mengurangi sumber polusinya lewat kebijakan. Tindakan pribadi tetap bisa membantu, tetapi kemampuan setiap orang untuk melakukannya tidak sama."
        ]
      },
      {
        heading: "Saat udara buruk atau ada asap",
        items: [
          "Tetap di dalam ruangan bila udara di dalam lebih bersih, dan tutup jendela.",
          "Jangan membakar apa pun di dalam rumah, misalnya lilin, dupa, kayu, atau rokok.",
          "Bila ada pembersih udara (air purifier), nyalakan di satu ruangan yang bisa ditutup.",
          "Atur waktu dan rute aktivitas di luar. Polusi berbeda menurut tempat dan jam.",
          "Tetap aktif bergerak. Manfaat aktivitas fisik umumnya lebih besar daripada risikonya, tetapi kurangi olahraga berat di luar saat polusi tinggi."
        ]
      },
      {
        heading: "Masker dan respirator",
        paragraphs: [
          "Respirator seperti N95 menempel rapat di wajah dan menyaring partikel lebih baik daripada masker longgar. Respirator bersertifikat menyaring setidaknya 95% partikel, KN95 setidaknya 80%, sedangkan kemampuan masker kain dan masker sekali pakai sangat beragam.",
          "Hal yang perlu diingat:"
        ],
        items: [
          "Masker hanya menyaring partikel, tidak menyaring gas seperti karbon monoksida dari asap.",
          "Celah di hidung dan pipi mengurangi perlindungan. Pastikan masker menempel rapat.",
          "Respirator membuat napas lebih berat. Bila kamu punya penyakit jantung atau paru, tanyakan dulu ke tenaga kesehatan.",
          "Bila merasa pusing atau sesak, pindah ke tempat dengan udara lebih bersih.",
          "Saat cuaca panas, istirahat dan minum air karena memakai respirator sambil beraktivitas menambah risiko kepanasan.",
          "WHO tidak menyarankan respirator untuk pemakaian sehari-hari oleh masyarakat umum, tetapi boleh dipakai sementara saat ada kejadian seperti asap kebakaran hutan."
        ]
      },
      {
        heading: "Siapa yang perlu lebih berhati-hati",
        paragraphs: [
          "Menurut CDC, kelompok yang lebih rentan terhadap asap antara lain ibu hamil, anak-anak, serta orang dengan asma, penyakit paru, penyakit jantung, diabetes, atau penyakit ginjal kronis. Cari bantuan medis bila muncul keluhan baru atau keluhan memburuk."
        ]
      }
    ],
    limitations:
      "Panduan asap kebakaran hutan dari CDC disusun untuk konteks Amerika Serikat. Ikuti juga arahan pemerintah daerah setempat."
  },
  {
    slug: "indeks-uv-dan-perlindungan-matahari",
    category: "UV",
    title: "Indeks UV dan perlindungan dari sinar matahari",
    summary:
      "Arti angka indeks UV, kapan sinar UV paling kuat, dan perlindungan yang disarankan WHO di setiap tingkat.",
    status: "published",
    references: ["E34", "E38", "E01"],
    terms: ["indeks-uv", "melasma", "data-model"],
    askQuestion: "Bagaimana melindungi diri saat indeks UV tinggi?",
    card: {
      summary:
        "Indeks UV mengukur kekuatan radiasi ultraviolet dari matahari; makin tinggi angkanya, makin besar risiko kerusakan kulit dan mata. Sinar UV paling kuat sekitar pukul 10.00–14.00. Indeks 0–2 umumnya aman, mulai 3 perlu perlindungan, dan 8 ke atas sebaiknya hindari berada di luar saat tengah hari.",
      actions: [
        "Cari tempat teduh saat tengah hari.",
        "Pakai pakaian yang menutupi kulit, topi bertepi lebar, dan kacamata pelindung UV.",
        "Oleskan tabir surya spektrum luas dan oleskan ulang setelah berkeringat.",
      ],
    },
    sections: [
      {
        heading: "Apa itu indeks UV?",
        paragraphs: [
          "Indeks UV mengukur kekuatan radiasi ultraviolet dari matahari. Makin tinggi angkanya, makin besar risiko kerusakan kulit dan mata, dan makin cepat kerusakan itu bisa terjadi.",
          "Sinar UV paling kuat sekitar empat jam di sekitar tengah hari, kira-kira pukul 10.00–14.00."
        ]
      },
      {
        heading: "Arti angka dan perlindungannya",
        items: [
          "0–2 (rendah): aman beraktivitas di luar, umumnya tidak perlu perlindungan khusus.",
          "3–7 (sedang sampai tinggi): cari tempat teduh saat tengah hari, pakai baju yang menutupi kulit, tabir surya, dan topi.",
          "8 ke atas (sangat tinggi sampai ekstrem): hindari berada di luar saat tengah hari. Bila harus keluar, pastikan berteduh, memakai baju tertutup, tabir surya, dan topi."
        ]
      },
      {
        heading: "Cara melindungi diri",
        items: [
          "Batasi waktu di bawah matahari pada tengah hari.",
          "Manfaatkan tempat teduh.",
          "Pakai pakaian yang menutupi kulit dan topi bertepi lebar.",
          "Pakai kacamata hitam yang melindungi dari sinar UV.",
          "Oleskan tabir surya spektrum luas, lalu oleskan ulang secara berkala, terutama setelah berkeringat atau berenang.",
          "Hindari tanning bed (alat penggelap kulit)."
        ]
      },
      {
        heading: "Untuk ibu hamil",
        paragraphs: [
          "WHO Eropa menyebut tabir surya dan topi, atau berteduh, membantu mencegah kulit terbakar dan melasma (flek gelap di wajah) yang bisa dialami hingga separuh ibu hamil."
        ]
      }
    ],
    limitations:
      "Nilai indeks UV di Sycle berasal dari data prakiraan dan bisa berbeda dengan kondisi tepat di lokasimu. Kebutuhan perlindungan juga dipengaruhi jenis kulit dan lama paparan."
  },
  {
    slug: "menstruasi-suhu-tubuh-dan-cuaca-panas",
    category: "Kesehatan Perempuan",
    title: "Menstruasi, suhu tubuh, dan cuaca panas",
    summary:
      "Suhu tubuh berubah mengikuti siklus menstruasi. Ketahui apa kata penelitian dan apa artinya saat cuaca panas.",
    status: "published",
    references: ["E09", "E11", "E10", "E17"],
    terms: ["fase-luteal", "fase-folikular", "dismenore", "studi-populasi"],
    askQuestion: "Apakah siklus menstruasi memengaruhi rasa panas di tubuh?",
    card: {
      summary:
        "Setelah ovulasi (fase luteal), suhu inti tubuh sekitar 0,3–0,7°C lebih tinggi daripada sebelum ovulasi. Sebagian orang mungkin merasa lebih gerah di paruh kedua siklus. Namun penelitian tentang olahraga di cuaca panas menemukan jumlah keringat dan detak jantung tidak berbeda antarfase, dan datanya masih terbatas.",
      actions: [
        "Minum air secara teratur saat cuaca panas.",
        "Pilih pakaian yang longgar dan nyaman.",
        "Istirahat di tempat sejuk dan kurangi aktivitas berat saat siang terik.",
      ],
    },
    sections: [
      {
        heading: "Suhu tubuh mengikuti siklus",
        paragraphs: [
          "Setelah ovulasi (fase luteal), suhu inti tubuh sekitar 0,3–0,7°C lebih tinggi daripada sebelum ovulasi (fase folikular). Perubahan ini terutama dipengaruhi hormon progesteron.",
          "Pada fase luteal, titik saat tubuh mulai berkeringat dan mengalirkan darah ke kulit juga ikut bergeser naik."
        ]
      },
      {
        heading: "Saat berolahraga di cuaca panas",
        paragraphs: [
          "Tinjauan 9 penelitian (83 peserta) menemukan suhu inti tubuh lebih tinggi pada fase luteal, baik sebelum maupun sesudah olahraga di suhu panas. Namun jumlah keringat, suhu kulit, dan detak jantung tidak berbeda antarfase. Penelitinya mencatat datanya masih terbatas.",
          "Artinya, sebagian orang mungkin merasa lebih gerah di paruh kedua siklus. Tetapi suhu cuaca atau suhu tubuh tidak bisa dipakai untuk menebak fase siklusmu."
        ]
      },
      {
        heading: "Kesehatan menstruasi",
        paragraphs: [
          "WHO mendefinisikan kesehatan menstruasi sebagai kondisi ketika setiap orang yang menstruasi mendapat informasi dan dukungan untuk menjalaninya dengan bermartabat, termasuk akses produk menstruasi, air bersih, sanitasi, dan layanan kesehatan.",
          "Lebih dari dua dari tiga orang yang menstruasi mengalami nyeri haid, dan perdarahan yang banyak cukup umum serta bisa menyebabkan anemia kekurangan zat besi."
        ]
      },
      {
        heading: "Saat cuaca panas",
        items: [
          "Minum air secara teratur.",
          "Pilih pakaian yang longgar dan nyaman.",
          "Istirahat di tempat sejuk dan kurangi aktivitas berat saat siang terik.",
          "Baca juga “Nyeri haid dan haid yang banyak: kapan perlu diperiksa”."
        ]
      }
    ],
    limitations:
      "Bukti pengaruh fase siklus terhadap panas masih terbatas dan tidak konsisten. Temuan penelitian ini berlaku untuk kelompok, bukan untuk memprediksi respons tubuh setiap orang. Sycle tidak mendiagnosis gejala menstruasi."
  },
  {
    slug: "nyeri-haid-dan-haid-yang-banyak",
    category: "Kesehatan Perempuan",
    title: "Nyeri haid dan haid yang banyak: kapan perlu diperiksa",
    summary:
      "Penyebab nyeri haid, cara meredakannya di rumah, tanda haid terlalu banyak, dan kapan perlu ke tenaga kesehatan.",
    status: "published",
    references: ["E21", "E22", "E23"],
    terms: ["dismenore"],
    askQuestion: "Kapan nyeri haid perlu diperiksakan ke tenaga kesehatan?",
    healthcareLink: true,
    card: {
      summary:
        "Nyeri haid terjadi karena otot rahim berkontraksi dan sering kali normal. Kadang nyeri disebabkan kondisi lain seperti endometriosis atau mioma. Haid dianggap terlalu banyak bila, misalnya, perlu mengganti pembalut setiap 1–2 jam atau haid berlangsung lebih dari 7 hari.",
      actions: [
        "Coba kompres hangat di perut, pijat lembut, atau olahraga ringan.",
        "Tanyakan pilihan obat pereda nyeri ke apoteker atau tenaga kesehatan.",
        "Segera cari pertolongan bila nyeri sangat hebat dan obat pereda nyeri tidak membantu.",
        "Periksakan diri bila haid makin nyeri, makin banyak, atau tidak teratur.",
      ],
    },
    sections: [
      {
        heading: "Mengapa haid terasa nyeri",
        paragraphs: [
          "Nyeri haid terjadi karena otot rahim berkontraksi, dan sering kali normal. Ini disebut dismenore primer.",
          "Kadang nyeri disebabkan kondisi lain (dismenore sekunder), misalnya endometriosis, adenomiosis, mioma, atau radang panggul. Pemakaian IUD (spiral) juga bisa menyebabkan nyeri, terutama di 3–6 bulan pertama."
        ]
      },
      {
        heading: "Cara meredakan di rumah",
        items: [
          "Mandi atau berendam air hangat.",
          "Tempelkan kompres hangat (dibungkus kain) di perut.",
          "Pijat lembut perut dan punggung.",
          "Lakukan olahraga ringan seperti yoga, berenang, jalan kaki, atau bersepeda.",
          "Kurangi alkohol dan tidak merokok.",
          "Untuk obat pereda nyeri, tanyakan pilihan yang sesuai ke apoteker atau tenaga kesehatan."
        ]
      },
      {
        heading: "Tanda haid terlalu banyak",
        items: [
          "Perlu mengganti pembalut atau tampon setiap 1–2 jam.",
          "Perlu memakai dua produk sekaligus, misalnya pembalut dan tampon.",
          "Haid berlangsung lebih dari 7 hari.",
          "Keluar gumpalan darah lebih besar dari sekitar 2,5 cm.",
          "Darah tembus ke pakaian atau kasur.",
          "Sampai menghindari kegiatan sehari-hari atau izin kerja/sekolah.",
          "Sering merasa lelah atau sesak napas."
        ]
      },
      {
        heading: "Kapan perlu ke tenaga kesehatan",
        paragraphs: [
          "Segera cari pertolongan bila nyeri terasa sangat hebat atau lebih parah dari biasanya dan obat pereda nyeri tidak membantu.",
          "Periksakan diri juga bila:"
        ],
        items: [
          "Haid menjadi lebih nyeri, lebih banyak, atau tidak teratur.",
          "Nyeri haid mengganggu kegiatan sehari-hari.",
          "Ada nyeri saat berhubungan seksual, buang air kecil, atau buang air besar.",
          "Ada perdarahan di luar jadwal haid atau setelah berhubungan seksual.",
          "Perut membengkak, nafsu makan hilang, atau berat badan turun tanpa sebab."
        ]
      }
    ],
    limitations:
      "Artikel ini tidak dapat menentukan penyebab nyeri haid. Hanya tenaga kesehatan yang dapat memeriksa dan menentukan penyebabnya."
  },
  {
    slug: "kehamilan-dan-cuaca-panas",
    category: "Kesehatan Perempuan",
    title: "Kehamilan dan cuaca panas",
    summary:
      "Mengapa ibu hamil lebih rentan terhadap panas, langkah perlindungan yang disarankan WHO dan CDC, serta tanda yang perlu diwaspadai.",
    status: "published",
    references: ["E01", "E02", "E40"],
    terms: ["dehidrasi", "melasma", "gelombang-panas", "kelelahan-panas"],
    askQuestion: "Apa hubungan cuaca panas dengan kehamilan?",
    healthcareLink: true,
    card: {
      summary:
        "Selama hamil, jantung dan pembuluh darah sudah bekerja lebih keras, dan cuaca panas menambah beban itu. Menurut WHO, risiko utama panas pada kehamilan adalah dehidrasi. Hari panas juga sering disertai kualitas udara yang lebih buruk.",
      actions: [
        "Minum sekitar 2–3 liter air per hari, dan lebih banyak saat cuaca panas.",
        "Habiskan waktu di ruangan sejuk dan beraktivitas di pagi atau sore hari.",
        "Hubungi bidan atau dokter bila gerakan bayi berkurang atau muncul kontraksi sebelum waktunya.",
        "Tanyakan ke tenaga kesehatan apakah obat rutinmu memengaruhi ketahanan terhadap panas.",
      ],
    },
    sections: [
      {
        heading: "Mengapa ibu hamil lebih rentan",
        paragraphs: [
          "Selama hamil, jantung dan pembuluh darah sudah bekerja lebih keras karena volume darah dan detak jantung meningkat. Cuaca panas menambah beban itu.",
          "Menurut WHO, risiko utama paparan panas pada kehamilan adalah dehidrasi, yang juga bisa membuat ibu makin lelah. Bayi dalam kandungan tidak merasakan panas secara langsung, tetapi ikut merespons perubahan pada tubuh ibu.",
          "Hari yang panas sering disertai kualitas udara yang lebih buruk, dan gabungan keduanya lebih berisiko daripada salah satunya saja."
        ]
      },
      {
        heading: "Yang bisa dilakukan",
        items: [
          "Minum sekitar 2–3 liter air per hari, dan lebih banyak saat cuaca panas.",
          "Bila memungkinkan, habiskan waktu di ruangan yang sejuk atau ber-AC.",
          "Kipas angin membantu bila suhu ruangan belum terlalu panas (di bawah sekitar 32°C).",
          "Bawa kain yang bisa dibasahi untuk mendinginkan tubuh.",
          "Jalan kaki atau beraktivitas di pagi atau sore hari saat udara lebih sejuk.",
          "Pakai pakaian longgar dan ringan, topi, kacamata hitam, dan tabir surya.",
          "Saat panas ekstrem, kurangi jam kerja dan waktu perjalanan bila memungkinkan.",
          "Tanyakan ke tenaga kesehatan apakah obat rutinmu memengaruhi ketahanan terhadap panas, dan jangan tinggalkan obat di kendaraan yang panas.",
          "Lakukan aktivitas yang terasa nyaman untukmu."
        ]
      },
      {
        heading: "Tanda yang perlu diwaspadai",
        paragraphs: [
          "Hubungi bidan atau dokter bila muncul:"
        ],
        items: [
          "Tanda kepanasan: keringat sangat banyak, kram otot, lemas, pusing, sakit kepala, mual, atau muntah.",
          "Tanda dehidrasi: pusing, jantung berdebar, sangat lelah, haus, urine berwarna gelap, jarang buang air kecil, bengkak di tangan atau kaki, atau kram perut.",
          "Kontraksi sebelum waktunya.",
          "Gerakan bayi berkurang dari biasanya, termasuk saat gelombang panas."
        ]
      },
      {
        heading: "Tanda bahaya lain",
        paragraphs: [
          "Daftar lengkap tanda bahaya selama kehamilan dan setelah melahirkan ada di artikel “Setelah melahirkan: pemulihan dan tanda bahaya”."
        ]
      }
    ],
    limitations:
      "Informasi ini bersifat umum dan tidak menilai risiko kehamilanmu secara pribadi. Ikuti arahan bidan atau dokter yang memeriksamu."
  },
  {
    slug: "polusi-udara-dan-kehamilan",
    category: "Kesehatan Perempuan",
    title: "Polusi udara dan kehamilan",
    summary:
      "Apa yang diketahui penelitian tentang polusi udara dan tekanan darah tinggi selama kehamilan, dan langkah untuk mengurangi paparan.",
    status: "published",
    references: ["E07", "E06", "E36", "E43"],
    terms: ["preeklamsia", "hipertensi-kehamilan", "no2", "pm25", "meta-analisis"],
    askQuestion: "Bagaimana ibu hamil bisa mengurangi paparan polusi udara?",
    healthcareLink: true,
    card: {
      summary:
        "Ibu hamil termasuk kelompok yang lebih rentan terhadap asap dan udara buruk. Meta-analisis 10 penelitian menemukan paparan polusi udara selama kehamilan berkaitan dengan risiko sedikit lebih tinggi untuk hipertensi kehamilan dan preeklamsia. Peneliti menyebut efeknya kecil dan hasilnya belum meyakinkan.",
      actions: [
        "Cek kategori kualitas udara sebelum beraktivitas di luar.",
        "Saat udara buruk atau ada asap, kurangi aktivitas berat di luar ruangan.",
        "Hindari asap rokok dan pembakaran di dalam rumah.",
        "Tetap rutin kontrol kehamilan, termasuk pemeriksaan tekanan darah.",
      ],
    },
    sections: [
      {
        heading: "Mengapa dibahas",
        paragraphs: [
          "CDC memasukkan ibu hamil ke dalam kelompok yang lebih rentan terhadap asap dan udara buruk. WHO juga mencatat bahwa hampir semua penduduk dunia tinggal di wilayah dengan kualitas udara yang melebihi pedomannya."
        ]
      },
      {
        heading: "Apa kata penelitian",
        paragraphs: [
          "Sebuah meta-analisis dari 10 penelitian menemukan paparan polusi udara selama kehamilan, terutama gas NO₂ dari kendaraan, berkaitan dengan risiko sedikit lebih tinggi untuk hipertensi kehamilan dan preeklamsia. Peneliti menyebut efeknya kecil dan hasilnya belum meyakinkan karena jumlah penelitian masih sedikit.",
          "Tinjauan sistematis yang lebih baru (2025) juga mengkaji hubungan paparan PM2.5 selama kehamilan dengan gangguan tekanan darah tinggi pada kehamilan.",
          "Temuan seperti ini menunjukkan hubungan pada kelompok besar, bukan memastikan sebab-akibat pada satu orang."
        ]
      },
      {
        heading: "Yang bisa dilakukan",
        items: [
          "Cek kategori kualitas udara di Sycle sebelum beraktivitas di luar.",
          "Saat kategori Tidak Sehat atau ada asap, kurangi aktivitas berat di luar dan tetap di ruangan yang udaranya lebih bersih.",
          "Hindari asap rokok dan pembakaran di dalam rumah.",
          "Tetap rutin kontrol kehamilan, termasuk pemeriksaan tekanan darah."
        ]
      },
      {
        heading: "Tanda yang perlu segera diperiksa",
        paragraphs: [
          "Segera cari pertolongan medis bila mengalami sakit kepala yang tidak hilang atau makin berat, gangguan penglihatan, atau bengkak berlebihan di tangan atau wajah."
        ]
      }
    ],
    limitations:
      "Hubungan yang ditemukan bersifat populasi, bukan sebab-akibat pada satu orang. Penelitian ini tidak dapat dipakai untuk menilai risiko kehamilanmu secara pribadi. Diskusikan kekhawatiranmu dengan bidan atau dokter."
  },
  {
    slug: "setelah-melahirkan-pemulihan-dan-tanda-bahaya",
    category: "Kesehatan Perempuan",
    title: "Setelah melahirkan: pemulihan dan tanda bahaya",
    summary:
      "Perubahan tubuh yang umum setelah melahirkan, cara merawat diri, dan tanda bahaya yang perlu segera mendapat pertolongan.",
    status: "published",
    references: ["E24", "E25", "E40"],
    terms: ["lokia", "baby-blues", "preeklamsia"],
    askQuestion: "Apa saja tanda bahaya setelah melahirkan?",
    healthcareLink: true,
    card: {
      summary:
        "Setelah melahirkan, tubuh mengalami banyak perubahan, misalnya darah nifas (lokia) yang berkurang dalam sekitar 4–6 minggu, kram perut, dan payudara yang terasa penuh. Baby blues cukup umum dan biasanya membaik dalam sekitar dua minggu. Beberapa tanda bahaya bisa muncul hingga satu tahun setelah melahirkan dan perlu pertolongan segera.",
      actions: [
        "Istirahat bila ada kesempatan dan minta bantuan pasangan atau keluarga.",
        "Datang ke jadwal kontrol nifas.",
        "Segera cari pertolongan medis bila mengalami tanda bahaya, misalnya demam 38°C atau lebih, perdarahan banyak, sesak napas, atau pikiran menyakiti diri atau bayi.",
      ],
    },
    sections: [
      {
        heading: "Perubahan yang umum terjadi",
        items: [
          "Nyeri di area jalan lahir, terutama bila ada robekan atau jahitan. Biasanya membaik dalam beberapa minggu.",
          "Keluarnya darah nifas (lokia): awalnya merah terang, lalu lebih gelap, kemudian kekuningan atau putih, dan berkurang dalam sekitar 4–6 minggu.",
          "Kram perut selama beberapa hari karena rahim mengecil, sering terasa lebih kuat saat menyusui.",
          "Payudara terasa penuh, keras, dan nyeri di hari-hari awal saat ASI mulai banyak.",
          "Baby blues (mudah menangis, cemas, suasana hati berubah) cukup umum dan biasanya membaik dalam sekitar dua minggu.",
          "Kadang urine merembes, dan rambut lebih banyak rontok."
        ]
      },
      {
        heading: "Merawat diri",
        items: [
          "Istirahat bila ada kesempatan, dan minta bantuan pasangan atau keluarga.",
          "Makan makanan berserat dan minum air yang cukup untuk memudahkan buang air besar.",
          "Untuk nyeri di jalan lahir, coba kompres dingin atau berendam air hangat sebentar.",
          "Untuk payudara bengkak, kompres hangat sebelum menyusui dan kompres dingin di antara waktu menyusui.",
          "Latihan otot dasar panggul (senam Kegel) membantu mengatasi urine yang merembes.",
          "Datang ke jadwal kontrol nifas."
        ]
      },
      {
        heading: "Tanda bahaya: segera cari pertolongan",
        paragraphs: [
          "Menurut CDC, tanda-tanda berikut bisa muncul selama kehamilan hingga satu tahun setelah melahirkan. Bila mengalaminya, segera cari pertolongan medis dan sampaikan bahwa kamu sedang hamil atau baru melahirkan dalam setahun terakhir."
        ],
        items: [
          "Sakit kepala yang tidak hilang atau makin berat.",
          "Pusing yang terus-menerus atau pingsan.",
          "Gangguan penglihatan, misalnya kilatan cahaya, pandangan kabur, atau berbayang.",
          "Demam 38°C atau lebih.",
          "Bengkak berlebihan di tangan atau wajah.",
          "Pikiran untuk menyakiti diri sendiri atau bayi.",
          "Sesak napas atau sulit bernapas.",
          "Nyeri dada atau jantung berdebar kencang.",
          "Mual dan muntah hebat sampai tidak bisa minum.",
          "Nyeri perut hebat yang tidak hilang.",
          "Saat hamil: gerakan bayi berkurang atau berhenti, atau keluar darah atau cairan dari vagina.",
          "Setelah melahirkan: perdarahan banyak (membasahi satu pembalut atau lebih dalam satu jam), gumpalan besar, atau cairan berbau tidak sedap.",
          "Bengkak, kemerahan, terasa hangat, atau nyeri di satu kaki atau lengan.",
          "Kelelahan luar biasa yang tidak hilang dengan tidur, atau rasa sedih yang membuatmu sulit merawat bayi."
        ]
      }
    ],
    limitations:
      "Daftar tanda bahaya ini tidak mencakup semua kemungkinan. Jika ada yang terasa tidak beres, jangan menunggu dan hubungi tenaga kesehatan."
  },
  {
    slug: "menyusui-saat-cuaca-panas",
    category: "Kesehatan Perempuan",
    title: "Menyusui saat cuaca panas",
    summary:
      "Apakah bayi perlu air putih saat cuaca panas? Rekomendasi WHO tentang ASI, tips menyusui saat panas, dan tanda bayi kurang cairan.",
    status: "published",
    references: ["E27", "E26", "E39", "E17"],
    terms: ["asi-eksklusif", "dehidrasi"],
    askQuestion: "Apakah bayi yang menyusu perlu air putih saat cuaca panas?",
    healthcareLink: true,
    card: {
      summary:
        "WHO dan UNICEF menyarankan ASI eksklusif selama 6 bulan pertama, tanpa tambahan minuman lain termasuk air putih. Saat cuaca panas, bayi mungkin lebih sering minta menyusu karena haus, dan ASI menyesuaikan diri tanpa kehilangan gizinya. Bayi di atas 6 bulan yang sudah makan boleh diberi air putih sedikit-sedikit.",
      actions: [
        "Susui bayi lebih sering bila ia meminta.",
        "Perhatikan bila bayi lebih jarang buang air kecil atau urinenya lebih gelap.",
        "Ibu menyusui tetap minum air secara teratur dan menyusui di tempat sejuk.",
      ],
    },
    sections: [
      {
        heading: "Rekomendasi WHO",
        paragraphs: [
          "WHO dan UNICEF menyarankan ASI eksklusif selama 6 bulan pertama, yaitu bayi hanya mendapat ASI tanpa tambahan makanan atau minuman lain, termasuk air putih.",
          "Mulai sekitar usia 6 bulan, bayi diberi makanan pendamping sambil tetap menyusu hingga usia 2 tahun atau lebih. Menyusui membantu melindungi bayi dari infeksi seperti diare dan radang paru, serta menurunkan risiko kanker payudara dan ovarium pada ibu."
        ]
      },
      {
        heading: "Saat cuaca panas",
        items: [
          "Bayi di bawah 6 bulan yang mendapat ASI eksklusif tidak perlu tambahan air putih, termasuk saat cuaca panas.",
          "Bayi mungkin lebih sering minta menyusu karena haus. Susui sesuai keinginannya. ASI menyesuaikan diri untuk menghilangkan haus tanpa kehilangan gizinya.",
          "Bayi di atas 6 bulan yang sudah makan boleh diberi air putih sedikit-sedikit dengan cangkir, saat makan dan di antara waktu makan.",
          "Hindari memberi jus atau teh herbal pada bayi."
        ]
      },
      {
        heading: "Tanda bayi mungkin kurang cairan",
        paragraphs: [
          "Perhatikan bila bayi lebih jarang buang air kecil atau warna urinenya lebih gelap. Urine yang normal berwarna kuning pucat atau jernih. Bila ini terjadi, susui lebih sering. Bila tanda ini berlanjut, hubungi tenaga kesehatan."
        ]
      },
      {
        heading: "Untuk ibu menyusui",
        items: [
          "Minum air secara teratur.",
          "Menyusui di tempat yang sejuk dan teduh.",
          "Pakai pakaian yang longgar dan ringan."
        ]
      }
    ],
    limitations:
      "Informasi ini bersifat umum. Kondisi ibu dan bayi berbeda-beda, jadi konsultasikan dengan bidan, dokter, atau konselor laktasi bila ada kekhawatiran."
  },
  {
    slug: "perimenopause-menopause-dan-cuaca-panas",
    category: "Kesehatan Perempuan",
    title: "Perimenopause, menopause, dan cuaca panas",
    summary:
      "Mengenal masa transisi menuju menopause, gejala umumnya seperti hot flashes dan keringat malam, serta cara tetap nyaman saat cuaca panas.",
    status: "published",
    references: ["E14", "E28", "E29", "E30", "E15", "E13"],
    terms: ["perimenopause", "menopause", "hot-flashes", "keringat-malam"],
    askQuestion: "Bagaimana tetap nyaman saat hot flashes di cuaca panas?",
    healthcareLink: true,
    card: {
      summary:
        "Perimenopause adalah masa transisi sebelum menopause, biasanya mulai di usia 40-an. Menopause ditandai saat seseorang sudah 12 bulan berturut-turut tidak haid, umumnya antara usia 45 dan 55 tahun. Gejala yang umum antara lain hot flashes, keringat malam, dan sulit tidur.",
      actions: [
        "Siapkan air dingin di dekat tempat tidur dan pakai baju tidur dari bahan ringan.",
        "Gunakan kipas angin atau AC dan selimut tipis berlapis.",
        "Periksakan diri bila gejala mengganggu atau ada perdarahan setelah 12 bulan tidak haid.",
      ],
    },
    sections: [
      {
        heading: "Apa bedanya perimenopause dan menopause",
        paragraphs: [
          "Perimenopause adalah masa transisi sebelum menopause, biasanya mulai di usia 40-an meski bisa lebih awal atau lebih lambat. Pada masa ini haid sering tidak teratur, bisa lebih sedikit atau lebih banyak.",
          "Menopause ditandai saat seseorang sudah 12 bulan berturut-turut tidak haid. Menurut WHO, kebanyakan perempuan mengalaminya antara usia 45 dan 55 tahun."
        ]
      },
      {
        heading: "Gejala yang umum",
        items: [
          "Hot flashes: rasa panas tiba-tiba di wajah, leher, dan dada, kadang disertai keringat atau jantung berdebar.",
          "Keringat malam yang bisa membasahi pakaian dan mengganggu tidur.",
          "Sulit tidur.",
          "Perubahan suasana hati, cemas, atau sulit berkonsentrasi.",
          "Haid tidak teratur.",
          "Vagina kering, nyeri sendi dan otot, atau sakit kepala."
        ]
      },
      {
        heading: "Hubungannya dengan cuaca panas",
        paragraphs: [
          "Penelitian menunjukkan suhu lingkungan dan musim mungkin memengaruhi hot flashes dan keringat malam. Namun buktinya masih terbatas, sehingga cuaca tidak bisa dipakai untuk menjelaskan gejala pribadimu."
        ]
      },
      {
        heading: "Tetap nyaman, terutama di malam hari",
        items: [
          "Siapkan segelas air dingin di dekat tempat tidur.",
          "Pakai baju tidur longgar dari bahan ringan seperti katun atau linen.",
          "Gunakan kipas angin, buka jendela, atau nyalakan AC.",
          "Pakai selimut tipis berlapis yang mudah dilepas.",
          "Batasi makanan pedas dan kafein."
        ]
      },
      {
        heading: "Kapan perlu ke tenaga kesehatan",
        items: [
          "Gejala mengganggu kegiatan, tidur, atau suasana hatimu.",
          "Jantung sering berdebar.",
          "Haid menjadi jauh lebih banyak, berlangsung lebih dari 7 hari, muncul di antara jadwal haid, atau jaraknya kurang dari 21 hari.",
          "Ada perdarahan apa pun setelah 12 bulan tidak haid, sekecil apa pun."
        ],
        paragraphs: [
          "Pilihan penanganan menopause perlu diputuskan bersama tenaga kesehatan sesuai kondisimu."
        ]
      }
    ],
    limitations:
      "Topik ini disediakan untuk edukasi. Personalisasi Sycle saat ini mencakup menstruasi, kehamilan, dan menyusui. Artikel ini tidak mendiagnosis menopause."
  },
  {
    slug: "apa-kata-penelitian-panas-polusi-dan-kesehatan-reproduksi",
    category: "Kesehatan Perempuan",
    title: "Apa kata penelitian: panas, polusi udara, dan kesehatan reproduksi",
    summary:
      "Ringkasan temuan studi populasi tentang panas, polusi udara, kehamilan, siklus menstruasi, dan cadangan ovarium, beserta cara membacanya.",
    status: "published",
    references: ["E05", "E04", "E46", "E07", "E06", "E12", "E44"],
    terms: ["studi-populasi", "tinjauan-sistematis", "meta-analisis", "persalinan-prematur", "cadangan-ovarium", "no2"],
    askQuestion: "Apa kata penelitian tentang panas dan kehamilan?",
    card: {
      summary:
        "Studi populasi mengamati kelompok besar orang untuk mencari hubungan antara paparan dan kondisi kesehatan. Meta-analisis menemukan peluang persalinan prematur sekitar 4–5% lebih tinggi untuk setiap kenaikan suhu 1°C. Penelitian lain mengaitkan polusi udara dengan hipertensi kehamilan, siklus menstruasi yang kurang teratur, dan cadangan ovarium yang lebih rendah.",
      actions: [
        "Pantau panas dan kualitas udara di Beranda Sycle.",
        "Kurangi paparan saat kondisi lingkungan buruk.",
        "Diskusikan kekhawatiranmu dengan tenaga kesehatan.",
      ],
    },
    sections: [
      {
        heading: "Cara membaca hasil penelitian",
        paragraphs: [
          "Penelitian di bagian ini adalah studi populasi: peneliti mengamati kelompok besar orang dan mencari hubungan antara paparan (panas atau polusi) dan kondisi kesehatan.",
          "Hubungan pada kelompok tidak sama dengan sebab-akibat, dan tidak bisa dipakai menghitung risiko satu orang. Angka di bawah ini menggambarkan perubahan peluang di tingkat populasi."
        ]
      },
      {
        heading: "Panas dan kehamilan",
        items: [
          "Meta-analisis 70 penelitian (BMJ, 2020): peluang persalinan prematur sekitar 5% lebih tinggi untuk setiap kenaikan suhu 1°C, dan sekitar 16% lebih tinggi saat gelombang panas. Hubungan paling kuat terlihat pada ibu dari kelompok sosial ekonomi rendah dan pada usia ibu yang sangat muda atau lebih tua.",
          "Tinjauan sistematis dan meta-analisis di Nature Medicine (2024) menemukan pola serupa: peluang persalinan prematur naik sekitar 4% per 1°C dan sekitar 17% saat gelombang panas.",
          "Tinjauan lingkup terhadap 84 penelitian (2022) mencatat sebagian besar penelitian dilakukan di negara berpendapatan tinggi, sedangkan penelitian di wilayah yang paling terdampak panas masih sedikit."
        ]
      },
      {
        heading: "Polusi udara dan kehamilan",
        items: [
          "Meta-analisis 10 penelitian (2014): paparan polusi udara selama kehamilan, terutama NO₂, berkaitan dengan risiko sedikit lebih tinggi untuk hipertensi kehamilan dan preeklamsia. Peneliti menilai hasilnya belum meyakinkan.",
          "Tinjauan sistematis 2025 mengkaji hubungan paparan PM2.5 selama kehamilan dengan gangguan tekanan darah tinggi pada kehamilan."
        ]
      },
      {
        heading: "Polusi udara, siklus menstruasi, dan cadangan ovarium",
        items: [
          "Studi dengan lebih dari 2,2 juta siklus menstruasi dari 92.550 pengguna aplikasi di 230 kota (Amerika Serikat, Meksiko, Brasil) menemukan paparan PM2.5 jangka panjang yang lebih tinggi berkaitan dengan siklus yang lebih tidak teratur, terutama siklus yang lebih panjang. Paparan diperkirakan per kota, bukan diukur per orang.",
          "Tinjauan sistematis 15 penelitian (2024) menemukan paparan PM2.5, PM10, dan NO₂ yang lebih tinggi berkaitan dengan cadangan ovarium yang lebih rendah, dengan tingkat bukti sedang. Penelitinya menegaskan sebab-akibat belum bisa disimpulkan."
        ]
      },
      {
        heading: "Apa artinya untukmu",
        paragraphs: [
          "Temuan ini menjadi alasan mengapa Sycle membantu memantau panas dan kualitas udara. Namun angka-angka ini bukan kalkulator risiko pribadi dan tidak menilai kesuburan atau kehamilanmu.",
          "Langkah perlindungan umum tetap sama: pantau kondisi lingkungan, kurangi paparan saat kondisi buruk, dan diskusikan kekhawatiranmu dengan tenaga kesehatan."
        ]
      }
    ],
    limitations:
      "Hubungan pada kelompok tidak sama dengan sebab-akibat dan tidak bisa dipakai menghitung risiko pribadi. Ringkasan ini menyederhanakan hasil penelitian. Detail metode dan keterbatasan setiap penelitian dapat dibaca di sumber aslinya."
  },
  {
    slug: "perubahan-iklim-dan-kesehatan-perempuan",
    category: "Kesehatan Perempuan",
    title: "Perubahan iklim dan kesehatan perempuan",
    summary:
      "Bagaimana perubahan iklim berkaitan dengan kesehatan ibu dan kesehatan reproduksi, serta langkah Indonesia dan Sycle dalam beradaptasi.",
    status: "published",
    references: ["E03", "E08", "E20", "E16"],
    terms: ["gelombang-panas", "heat-index", "ispu", "indeks-uv"],
    askQuestion: "Apa dampak perubahan iklim bagi kesehatan perempuan?",
    card: {
      summary:
        "Gelombang panas menjadi lebih sering dan lebih kuat, dan perubahan iklim juga berkaitan dengan kualitas udara yang memburuk. ACOG menyatakan perubahan iklim berdampak pada kesehatan kehamilan dan kesehatan reproduksi perempuan. Kementerian Kesehatan RI telah menetapkan Rencana Aksi Nasional Mitigasi dan Adaptasi Perubahan Iklim Sektor Kesehatan.",
      actions: [
        "Cek kondisi lingkungan di Beranda sebelum beraktivitas.",
        "Isi Personalisasi untuk mendapat panduan yang lebih sesuai.",
        "Kenali tanda bahaya lewat artikel lain di Info & Edukasi.",
      ],
    },
    sections: [
      {
        heading: "Iklim yang berubah",
        paragraphs: [
          "Gelombang panas menjadi lebih sering dan lebih kuat. Perubahan iklim juga berkaitan dengan kualitas udara yang memburuk, misalnya akibat kebakaran hutan, serta banjir dan kekeringan yang bisa mengganggu akses air bersih dan layanan kesehatan."
        ]
      },
      {
        heading: "Dampaknya bagi perempuan",
        paragraphs: [
          "Perhimpunan dokter kandungan Amerika Serikat (ACOG) menyatakan perubahan iklim berdampak pada kesehatan kehamilan dan kesehatan reproduksi perempuan.",
          "WHO juga menerbitkan panduan untuk melindungi kesehatan ibu, bayi baru lahir, dan anak dari dampak perubahan iklim. Ibu hamil, bayi, dan anak termasuk kelompok yang lebih rentan terhadap panas."
        ]
      },
      {
        heading: "Langkah di Indonesia",
        paragraphs: [
          "Kementerian Kesehatan RI telah menetapkan Rencana Aksi Nasional Mitigasi dan Adaptasi Perubahan Iklim Sektor Kesehatan sebagai arah kebijakan sektor kesehatan dalam menghadapi perubahan iklim."
        ]
      },
      {
        heading: "Peran Sycle",
        paragraphs: [
          "Sycle membantu menerjemahkan data lingkungan harian, seperti panas, kualitas udara, dan indeks UV, menjadi panduan perlindungan yang mudah dipahami sesuai kondisimu: menstruasi, kehamilan, atau menyusui."
        ],
        items: [
          "Cek kondisi lingkungan di Beranda sebelum beraktivitas.",
          "Isi Personalisasi untuk mendapat panduan yang lebih sesuai.",
          "Kenali tanda bahaya lewat artikel lain di Info & Edukasi."
        ]
      }
    ],
    limitations:
      "Artikel ini memberi konteks umum dan kebijakan. Dampak perubahan iklim pada setiap orang berbeda, dan kondisi lingkungan tidak dapat dipakai sebagai diagnosis pribadi."
  }
];

export function getEducationArticleBySlug(slug) {
  return educationArticles.find((article) => article.slug === slug) ?? null;
}

// Mengubah daftar kode E-xx milik artikel menjadi data sumber (penerbit, judul, link).
export function getArticleReferences(article) {
  return (article?.references ?? [])
    .map((id) => EVIDENCE_SOURCES.find((source) => source.id === id))
    .filter(Boolean);
}

// Mengubah daftar id istilah milik artikel menjadi data istilah dari glosarium.
export function getArticleTerms(article) {
  return (article?.terms ?? [])
    .map((id) => GLOSSARY.find((item) => item.id === id))
    .filter(Boolean);
}

// Artikel lain dari kategori yang sama, untuk bagian "Artikel terkait".
// Bila artikel sekategori kurang dari `limit`, sisanya diisi artikel dari kategori lain.
export function getRelatedArticles(article, limit = 3) {
  const others = educationArticles.filter((item) => item.slug !== article?.slug);
  const sameCategory = others.filter((item) => item.category === article?.category);
  const otherCategory = others.filter((item) => item.category !== article?.category);

  return [...sameCategory, ...otherCategory].slice(0, limit);
}

const QUESTION_STOPWORDS = new Set([
  "yang", "dan", "apa", "apakah", "bagaimana", "untuk", "saat", "dengan", "dari",
  "ini", "itu", "kenapa", "mengapa", "bisa", "perlu", "tidak", "atau", "pada",
  "saya", "aku", "kamu", "lebih", "agar", "harus", "jika", "kalau", "dalam",
  "juga", "ada", "bagi", "tentang", "cara", "hari", "sedang", "boleh", "sama",
]);

// Mencari artikel yang paling cocok dengan pertanyaan Tanya Sycle (pencocokan kata sederhana).
export function findArticlesForQuestion(question, limit = 2) {
  const words = String(question)
    .toLowerCase()
    .replace(/[^a-z0-9.\s]/g, " ")
    .split(/\s+/)
    .filter((word) => word.length >= 3 && !QUESTION_STOPWORDS.has(word));

  if (words.length === 0) return [];

  return educationArticles
    .map((article) => {
      const title = article.title.toLowerCase();
      const body = [
        article.summary,
        article.category,
        ...getArticleTerms(article).map((term) => term.term),
      ]
        .join(" ")
        .toLowerCase();

      const score = words.reduce(
        (total, word) =>
          total + (title.includes(word) ? 3 : 0) + (body.includes(word) ? 1 : 0),
        0
      );

      return { article, score };
    })
    .filter((item) => item.score >= 3)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map(({ article }) => ({ slug: article.slug, title: article.title }));
}
