// Katalog sumber evidence — dibuat dari SYCLE_V2_Master_Evidence_46_Pemetaan_Fitur.csv (15 Oktober 2026).
// Ini katalog KANDIDAT: status rilis semua sumber masih "not_granted". Kode `id` (E-xx) dipakai di berkas
// konten untuk menunjuk referensi, tetapi TIDAK ditampilkan di antarmuka (Master Draft 5.7).
// Jangan menyunting manual; perbarui dari CSV master bila tim mengubah statusnya.
// Kolom tambahan (Info & Edukasi): forQuestions, populationStudy, sourceType, topics, usageNote — dari CSV yang sama.
export const EVIDENCE_SOURCES = [
  {
    "id": "E01",
    "title": "How does hot weather affect pregnancy?",
    "publisher": "WHO",
    "url": "https://www.who.int/europe/news-room/questions-and-answers/item/how-does-hot-weather-affect-pregnancy",
    "group": "KONDISI_DAN_PANDUAN",
    "forGuidance": true,
    "forEducation": true,
    "forQuestions": true,
    "safetyDraft": false,
    "internal": false,
    "populationStudy": false,
    "sourceType": "Halaman informasi resmi",
    "topics": [
      "kehamilan",
      "panas"
    ],
    "usageNote": "WHO; gunakan hanya klaim yang nanti disetujui",
    "releaseStatus": "not_granted"
  },
  {
    "id": "E02",
    "title": "Heat and Pregnancy",
    "publisher": "CDC",
    "url": "https://www.cdc.gov/heat-health/risk-factors/heat-and-pregnancy.html",
    "group": "KONDISI_DAN_PANDUAN",
    "forGuidance": true,
    "forEducation": true,
    "forQuestions": true,
    "safetyDraft": false,
    "internal": false,
    "populationStudy": false,
    "sourceType": "Halaman informasi resmi",
    "topics": [
      "kehamilan",
      "panas"
    ],
    "usageNote": "CDC; jangan menyimpulkan risiko individu",
    "releaseStatus": "not_granted"
  },
  {
    "id": "E03",
    "title": "The Effects of Climate Change on Obstetric and Gynecologic Health",
    "publisher": "ACOG",
    "url": "https://www.acog.org/clinical/clinical-guidance/committee-statement/articles/2026/07/the-effects-of-climate-change-on-obstetric-and-gynecologic-health",
    "group": "INFO_DAN_EDUKASI",
    "forGuidance": false,
    "forEducation": true,
    "forQuestions": true,
    "safetyDraft": false,
    "internal": false,
    "populationStudy": false,
    "sourceType": "Ringkasan institusi",
    "topics": [
      "kehamilan",
      "kesehatan_reproduksi",
      "iklim"
    ],
    "usageNote": "Ringkasan institusi; batas akses sumber",
    "releaseStatus": "not_granted"
  },
  {
    "id": "E04",
    "title": "A systematic review and meta-analysis of heat exposure impacts on maternal, fetal and neonatal health",
    "publisher": "Nature Medicine",
    "url": "https://www.nature.com/articles/s41591-024-03395-8",
    "group": "KONDISI_DAN_PANDUAN",
    "forGuidance": true,
    "forEducation": true,
    "forQuestions": true,
    "safetyDraft": false,
    "internal": false,
    "populationStudy": true,
    "sourceType": "Artikel ilmiah (teks lengkap)",
    "topics": [
      "kehamilan",
      "panas",
      "hasil_kehamilan"
    ],
    "usageNote": "Bukan kalkulator risiko personal",
    "releaseStatus": "not_granted"
  },
  {
    "id": "E05",
    "title": "Associations between high temperatures in pregnancy and risk of preterm birth, low birth weight, and stillbirths: systematic review and meta-analysis",
    "publisher": "PubMed",
    "url": "https://pubmed.ncbi.nlm.nih.gov/33148618/",
    "group": "INFO_DAN_EDUKASI",
    "forGuidance": false,
    "forEducation": true,
    "forQuestions": true,
    "safetyDraft": false,
    "internal": false,
    "populationStudy": true,
    "sourceType": "Artikel ilmiah (abstrak)",
    "topics": [
      "kehamilan",
      "panas",
      "hasil_kehamilan"
    ],
    "usageNote": "Abstrak terindeks; cek full text",
    "releaseStatus": "not_granted"
  },
  {
    "id": "E06",
    "title": "Prenatal PM2.5 exposure and hypertensive disorders of pregnancy: a systematic review and meta-analysis",
    "publisher": "Frontiers in Public Health",
    "url": "https://www.frontiersin.org/journals/public-health/articles/10.3389/fpubh.2025.1650913/full",
    "group": "KONDISI_DAN_PANDUAN",
    "forGuidance": true,
    "forEducation": true,
    "forQuestions": true,
    "safetyDraft": false,
    "internal": false,
    "populationStudy": true,
    "sourceType": "Artikel ilmiah (teks lengkap)",
    "topics": [
      "kehamilan",
      "PM2.5",
      "hipertensi"
    ],
    "usageNote": "Tidak mengaitkan PM2.5 dengan gejala individu",
    "releaseStatus": "not_granted"
  },
  {
    "id": "E07",
    "title": "Ambient Air Pollution and Hypertensive Disorders of Pregnancy: A Systematic Review and Meta-analysis",
    "publisher": "PubMed Central",
    "url": "https://pmc.ncbi.nlm.nih.gov/articles/PMC4166571/",
    "group": "INFO_DAN_EDUKASI",
    "forGuidance": false,
    "forEducation": true,
    "forQuestions": true,
    "safetyDraft": false,
    "internal": false,
    "populationStudy": true,
    "sourceType": "Artikel ilmiah (abstrak)",
    "topics": [
      "kehamilan",
      "polusi_udara",
      "hipertensi"
    ],
    "usageNote": "Tidak untuk keputusan medis individual",
    "releaseStatus": "not_granted"
  },
  {
    "id": "E08",
    "title": "Protecting maternal, newborn and child health from the impacts of climate change: A call for action",
    "publisher": "WHO",
    "url": "https://www.who.int/southeastasia/publications/i/item/9789240085350",
    "group": "INFO_DAN_EDUKASI",
    "forGuidance": false,
    "forEducation": true,
    "forQuestions": true,
    "safetyDraft": false,
    "internal": false,
    "populationStudy": false,
    "sourceType": "Publikasi/pedoman",
    "topics": [
      "iklim",
      "ibu",
      "anak",
      "kebijakan"
    ],
    "usageNote": "Bukan panduan klinis langsung",
    "releaseStatus": "not_granted"
  },
  {
    "id": "E09",
    "title": "Temperature regulation in women: Effects of the menstrual cycle",
    "publisher": "PubMed Central",
    "url": "https://pmc.ncbi.nlm.nih.gov/articles/PMC7575238/",
    "group": "INFO_DAN_EDUKASI",
    "forGuidance": false,
    "forEducation": true,
    "forQuestions": true,
    "safetyDraft": false,
    "internal": false,
    "populationStudy": false,
    "sourceType": "Artikel ilmiah (abstrak)",
    "topics": [
      "menstruasi",
      "termoregulasi"
    ],
    "usageNote": "Jangan memprediksi respons panas per individu",
    "releaseStatus": "not_granted"
  },
  {
    "id": "E10",
    "title": "Menstrual health",
    "publisher": "WHO",
    "url": "https://www.who.int/news-room/fact-sheets/detail/menstrual-health",
    "group": "KONDISI_DAN_PANDUAN",
    "forGuidance": true,
    "forEducation": true,
    "forQuestions": true,
    "safetyDraft": false,
    "internal": false,
    "populationStudy": false,
    "sourceType": "Halaman informasi resmi",
    "topics": [
      "menstruasi",
      "kesehatan_menstruasi"
    ],
    "usageNote": "Tidak mendiagnosis gejala menstruasi",
    "releaseStatus": "not_granted"
  },
  {
    "id": "E11",
    "title": "Menstrual cycle and thermoregulation during exercise in the heat: A systematic review and meta-analysis",
    "publisher": "PubMed",
    "url": "https://pubmed.ncbi.nlm.nih.gov/32499153/",
    "group": "INFO_DAN_EDUKASI",
    "forGuidance": false,
    "forEducation": true,
    "forQuestions": true,
    "safetyDraft": false,
    "internal": false,
    "populationStudy": true,
    "sourceType": "Artikel ilmiah (abstrak)",
    "topics": [
      "menstruasi",
      "panas",
      "olahraga"
    ],
    "usageNote": "Jangan menyimpulkan fase siklus dari suhu",
    "releaseStatus": "not_granted"
  },
  {
    "id": "E12",
    "title": "The effect of air pollution exposure on menstrual cycle health using self-reported data from a mobile health app: a prospective, observational study",
    "publisher": "ScienceDirect",
    "url": "https://www.sciencedirect.com/science/article/pii/S2542519625000804",
    "group": "INFO_DAN_EDUKASI",
    "forGuidance": false,
    "forEducation": true,
    "forQuestions": true,
    "safetyDraft": false,
    "internal": false,
    "populationStudy": true,
    "sourceType": "Artikel ilmiah (abstrak)",
    "topics": [
      "menstruasi",
      "polusi_udara"
    ],
    "usageNote": "Studi observasional; tidak membuktikan kausalitas",
    "releaseStatus": "not_granted"
  },
  {
    "id": "E13",
    "title": "The impacts of environmental heat on menopausal symptoms: A global scoping review",
    "publisher": "PubMed",
    "url": "https://pubmed.ncbi.nlm.nih.gov/42772086/",
    "group": "INFO_DAN_EDUKASI",
    "forGuidance": false,
    "forEducation": true,
    "forQuestions": true,
    "safetyDraft": false,
    "internal": false,
    "populationStudy": true,
    "sourceType": "Artikel ilmiah (abstrak)",
    "topics": [
      "menopause",
      "panas"
    ],
    "usageNote": "Jangan mengaitkan gejala pribadi dengan suhu",
    "releaseStatus": "not_granted"
  },
  {
    "id": "E14",
    "title": "Menopause",
    "publisher": "WHO",
    "url": "https://www.who.int/news-room/fact-sheets/detail/menopause",
    "group": "INFO_DAN_EDUKASI",
    "forGuidance": false,
    "forEducation": true,
    "forQuestions": true,
    "safetyDraft": false,
    "internal": false,
    "populationStudy": false,
    "sourceType": "Halaman informasi resmi",
    "topics": [
      "menopause"
    ],
    "usageNote": "Topik edukasi; bukan cabang personalisasi MVP",
    "releaseStatus": "not_granted"
  },
  {
    "id": "E15",
    "title": "Menopause: identification and management (NG23)",
    "publisher": "NICE",
    "url": "https://www.nice.org.uk/guidance/ng23/chapter/Recommendations",
    "group": "INFO_DAN_EDUKASI",
    "forGuidance": false,
    "forEducation": true,
    "forQuestions": true,
    "safetyDraft": false,
    "internal": false,
    "populationStudy": false,
    "sourceType": "Pedoman resmi",
    "topics": [
      "menopause",
      "pedoman"
    ],
    "usageNote": "Jangan menghasilkan terapi atau diagnosis",
    "releaseStatus": "not_granted"
  },
  {
    "id": "E16",
    "title": "Heat and health",
    "publisher": "WHO",
    "url": "https://www.who.int/news-room/fact-sheets/detail/climate-change-heat-and-health",
    "group": "KONDISI_DAN_PANDUAN",
    "forGuidance": true,
    "forEducation": true,
    "forQuestions": true,
    "safetyDraft": false,
    "internal": false,
    "populationStudy": false,
    "sourceType": "Halaman informasi resmi",
    "topics": [
      "panas",
      "indeks_panas",
      "perlindungan"
    ],
    "usageNote": "Bukan pengganti perhitungan Heat Index",
    "releaseStatus": "not_granted"
  },
  {
    "id": "E17",
    "title": "About Heat and Your Health",
    "publisher": "CDC",
    "url": "https://www.cdc.gov/heat-health/about/index.html",
    "group": "KONDISI_DAN_PANDUAN",
    "forGuidance": true,
    "forEducation": true,
    "forQuestions": true,
    "safetyDraft": false,
    "internal": false,
    "populationStudy": false,
    "sourceType": "Halaman informasi resmi",
    "topics": [
      "panas",
      "perlindungan"
    ],
    "usageNote": "Tidak untuk penilaian risiko klinis personal",
    "releaseStatus": "not_granted"
  },
  {
    "id": "E18",
    "title": "Konsentrasi Partikulat (PM2.5)",
    "publisher": "BMKG",
    "url": "https://www.bmkg.go.id/kualitas-udara/pm25",
    "group": "KONDISI_DAN_PANDUAN",
    "forGuidance": true,
    "forEducation": true,
    "forQuestions": true,
    "safetyDraft": false,
    "internal": false,
    "populationStudy": false,
    "sourceType": "Halaman data",
    "topics": [
      "PM2.5",
      "kualitas_udara",
      "data"
    ],
    "usageNote": "Halaman data; bukan evidence klinis",
    "releaseStatus": "not_granted"
  },
  {
    "id": "E19",
    "title": "Pedoman Media, Komunikasi, Informasi dan Edukasi (KIE) Penyehatan Udara dan Dampak Terhadap Kesehatan Masyarakat",
    "publisher": "Kementerian Kesehatan RI",
    "url": "https://www.kemkes.go.id/id/pedoman-media-kie-penyehatan-udara-kesehatan-masyarakat",
    "group": "INTERNAL",
    "forGuidance": false,
    "forEducation": false,
    "forQuestions": false,
    "safetyDraft": false,
    "internal": true,
    "populationStudy": false,
    "sourceType": "Publikasi/pedoman",
    "topics": [
      "kualitas_udara",
      "komunikasi"
    ],
    "usageNote": "HOLD: rincian dokumen belum diverifikasi",
    "releaseStatus": "not_granted"
  },
  {
    "id": "E20",
    "title": "Rencana Aksi Nasional Mitigasi dan Adaptasi Perubahan Iklim Sektor Kesehatan Tahun 2025-2030",
    "publisher": "Kementerian Kesehatan RI",
    "url": "https://jdih.kemkes.go.id/documents/keputusan-menteri-kesehatan-nomor-hk0107menkes7772025",
    "group": "INFO_DAN_EDUKASI",
    "forGuidance": false,
    "forEducation": true,
    "forQuestions": true,
    "safetyDraft": false,
    "internal": false,
    "populationStudy": false,
    "sourceType": "Dokumen kebijakan",
    "topics": [
      "iklim",
      "kebijakan_kesehatan",
      "Indonesia"
    ],
    "usageNote": "Hanya konteks kebijakan, bukan saran personal",
    "releaseStatus": "not_granted"
  },
  {
    "id": "E21",
    "title": "Period pain",
    "publisher": "NHS",
    "url": "https://www.nhs.uk/symptoms/period-pain/",
    "group": "INFO_DAN_EDUKASI",
    "forGuidance": false,
    "forEducation": true,
    "forQuestions": true,
    "safetyDraft": true,
    "internal": false,
    "populationStudy": false,
    "sourceType": "Halaman informasi resmi",
    "topics": [
      "menstruasi",
      "nyeri",
      "keselamatan"
    ],
    "usageNote": "Pesan keselamatan perlu review klinis",
    "releaseStatus": "not_granted"
  },
  {
    "id": "E22",
    "title": "Dysmenorrhea (Menstrual Cramps)",
    "publisher": "Cleveland Clinic",
    "url": "https://my.clevelandclinic.org/health/diseases/4148-dysmenorrhea",
    "group": "INFO_DAN_EDUKASI",
    "forGuidance": false,
    "forEducation": true,
    "forQuestions": true,
    "safetyDraft": false,
    "internal": false,
    "populationStudy": false,
    "sourceType": "Halaman informasi resmi",
    "topics": [
      "menstruasi",
      "nyeri"
    ],
    "usageNote": "Bukan diagnosis penyebab nyeri",
    "releaseStatus": "not_granted"
  },
  {
    "id": "E23",
    "title": "Heavy periods",
    "publisher": "NHS",
    "url": "https://www.nhs.uk/conditions/heavy-periods/",
    "group": "INFO_DAN_EDUKASI",
    "forGuidance": false,
    "forEducation": true,
    "forQuestions": true,
    "safetyDraft": true,
    "internal": false,
    "populationStudy": false,
    "sourceType": "Halaman informasi resmi",
    "topics": [
      "menstruasi",
      "perdarahan",
      "keselamatan"
    ],
    "usageNote": "Pesan keselamatan perlu review klinis",
    "releaseStatus": "not_granted"
  },
  {
    "id": "E24",
    "title": "Postpartum care: What to expect after a vaginal birth",
    "publisher": "Mayo Clinic",
    "url": "https://www.mayoclinic.org/healthy-lifestyle/labor-and-delivery/in-depth/postpartum-care/art-20047233",
    "group": "INFO_DAN_EDUKASI",
    "forGuidance": false,
    "forEducation": true,
    "forQuestions": true,
    "safetyDraft": true,
    "internal": false,
    "populationStudy": false,
    "sourceType": "Halaman informasi resmi",
    "topics": [
      "pascapersalinan",
      "keselamatan"
    ],
    "usageNote": "Pascapersalinan untuk edukasi, bukan cabang MVP",
    "releaseStatus": "not_granted"
  },
  {
    "id": "E25",
    "title": "Your body after the birth",
    "publisher": "NHS",
    "url": "https://www.nhs.uk/pregnancy/labour-and-birth/your-body/",
    "group": "INFO_DAN_EDUKASI",
    "forGuidance": false,
    "forEducation": true,
    "forQuestions": true,
    "safetyDraft": true,
    "internal": false,
    "populationStudy": false,
    "sourceType": "Halaman informasi resmi",
    "topics": [
      "pascapersalinan",
      "keselamatan"
    ],
    "usageNote": "Pesan keselamatan perlu review klinis",
    "releaseStatus": "not_granted"
  },
  {
    "id": "E26",
    "title": "Breastfeeding",
    "publisher": "WHO",
    "url": "https://www.who.int/health-topics/breastfeeding",
    "group": "INFO_DAN_EDUKASI",
    "forGuidance": false,
    "forEducation": true,
    "forQuestions": true,
    "safetyDraft": false,
    "internal": false,
    "populationStudy": false,
    "sourceType": "Halaman informasi resmi",
    "topics": [
      "menyusui"
    ],
    "usageNote": "Tidak membuat saran medis spesifik",
    "releaseStatus": "not_granted"
  },
  {
    "id": "E27",
    "title": "Breastfeeding Your Baby In Hot Weather",
    "publisher": "NHS",
    "url": "https://www.justonenorfolk.nhs.uk/healthy-lifestyles/infant-feeding/breastfeeding/breastfeeding-your-baby-in-hot-weather/",
    "group": "KONDISI_DAN_PANDUAN",
    "forGuidance": true,
    "forEducation": true,
    "forQuestions": true,
    "safetyDraft": false,
    "internal": false,
    "populationStudy": false,
    "sourceType": "Halaman informasi resmi",
    "topics": [
      "menyusui",
      "panas",
      "hidrasi"
    ],
    "usageNote": "Cek konteks ibu/bayi dan batas rekomendasi",
    "releaseStatus": "not_granted"
  },
  {
    "id": "E28",
    "title": "Perimenopause - Symptoms and causes",
    "publisher": "Mayo Clinic",
    "url": "https://www.mayoclinic.org/diseases-conditions/perimenopause/symptoms-causes/syc-20354666",
    "group": "INFO_DAN_EDUKASI",
    "forGuidance": false,
    "forEducation": true,
    "forQuestions": true,
    "safetyDraft": false,
    "internal": false,
    "populationStudy": false,
    "sourceType": "Halaman informasi resmi",
    "topics": [
      "perimenopause"
    ],
    "usageNote": "Bukan cabang personalisasi MVP",
    "releaseStatus": "not_granted"
  },
  {
    "id": "E29",
    "title": "Symptoms of menopause and perimenopause",
    "publisher": "NHS",
    "url": "https://www.nhs.uk/conditions/menopause-and-perimenopause/symptoms/",
    "group": "INFO_DAN_EDUKASI",
    "forGuidance": false,
    "forEducation": true,
    "forQuestions": true,
    "safetyDraft": false,
    "internal": false,
    "populationStudy": false,
    "sourceType": "Halaman informasi resmi",
    "topics": [
      "perimenopause",
      "menopause"
    ],
    "usageNote": "Tidak mendiagnosis menopause",
    "releaseStatus": "not_granted"
  },
  {
    "id": "E30",
    "title": "Night Sweats",
    "publisher": "Cleveland Clinic",
    "url": "https://my.clevelandclinic.org/health/diseases/16562-night-sweats",
    "group": "INFO_DAN_EDUKASI",
    "forGuidance": false,
    "forEducation": true,
    "forQuestions": true,
    "safetyDraft": false,
    "internal": false,
    "populationStudy": false,
    "sourceType": "Halaman informasi resmi",
    "topics": [
      "keringat_malam",
      "menopause"
    ],
    "usageNote": "Tidak menentukan penyebab keluhan",
    "releaseStatus": "not_granted"
  },
  {
    "id": "E31",
    "title": "A participatory qualitative study exploring prioritization of climate change and health research among women in Indonesia and Malaysia",
    "publisher": "Frontiers in Public Health",
    "url": "https://www.frontiersin.org/journals/public-health/articles/10.3389/fpubh.2026.1789137/full",
    "group": "INTERNAL",
    "forGuidance": false,
    "forEducation": false,
    "forQuestions": false,
    "safetyDraft": false,
    "internal": true,
    "populationStudy": false,
    "sourceType": "Artikel ilmiah (teks lengkap)",
    "topics": [
      "Indonesia",
      "Malaysia",
      "riset_partisipatif"
    ],
    "usageNote": "Hanya konteks desain/riset produk",
    "releaseStatus": "not_granted"
  },
  {
    "id": "E32",
    "title": "Indonesian Women’s Climate and Health Information Needs",
    "publisher": "DOI",
    "url": "https://doi.org/10.3233/SHTI251091",
    "group": "INTERNAL",
    "forGuidance": false,
    "forEducation": false,
    "forQuestions": false,
    "safetyDraft": false,
    "internal": true,
    "populationStudy": false,
    "sourceType": "Artikel ilmiah (abstrak)",
    "topics": [
      "Indonesia",
      "kebutuhan_informasi"
    ],
    "usageNote": "Hanya konteks desain/riset produk",
    "releaseStatus": "not_granted"
  },
  {
    "id": "E33",
    "title": "WHO global air quality guidelines",
    "publisher": "WHO",
    "url": "https://www.who.int/publications/i/item/9789240034228",
    "group": "KONDISI_DAN_PANDUAN",
    "forGuidance": true,
    "forEducation": true,
    "forQuestions": true,
    "safetyDraft": false,
    "internal": false,
    "populationStudy": false,
    "sourceType": "Publikasi/pedoman",
    "topics": [
      "PM2.5",
      "polusi_udara",
      "pedoman"
    ],
    "usageNote": "Pedoman bukan nilai AQI real-time",
    "releaseStatus": "not_granted"
  },
  {
    "id": "E34",
    "title": "Radiation: The ultraviolet (UV) index",
    "publisher": "WHO",
    "url": "https://www.who.int/news-room/questions-and-answers/item/radiation-the-ultraviolet-(uv)-index",
    "group": "KONDISI_DAN_PANDUAN",
    "forGuidance": true,
    "forEducation": true,
    "forQuestions": true,
    "safetyDraft": false,
    "internal": false,
    "populationStudy": false,
    "sourceType": "Halaman informasi resmi",
    "topics": [
      "UV",
      "radiasi_matahari"
    ],
    "usageNote": "Nilai UV aktual tetap dari API tervalidasi",
    "releaseStatus": "not_granted"
  },
  {
    "id": "E35",
    "title": "The PRO-CTCAE Measurement System",
    "publisher": "National Cancer Institute",
    "url": "https://healthcaredelivery.cancer.gov/pro-ctcae/measurement.html",
    "group": "INTERNAL",
    "forGuidance": false,
    "forEducation": false,
    "forQuestions": false,
    "safetyDraft": false,
    "internal": true,
    "populationStudy": false,
    "sourceType": "Halaman informasi resmi",
    "topics": [
      "pengukuran_gejala",
      "metodologi"
    ],
    "usageNote": "Bukan sumber edukasi atau panduan publik",
    "releaseStatus": "not_granted"
  },
  {
    "id": "E36",
    "title": "Ambient (outdoor) air pollution",
    "publisher": "WHO",
    "url": "https://www.who.int/news-room/fact-sheets/detail/ambient-(outdoor)-air-quality-and-health",
    "group": "KONDISI_DAN_PANDUAN",
    "forGuidance": true,
    "forEducation": true,
    "forQuestions": true,
    "safetyDraft": false,
    "internal": false,
    "populationStudy": false,
    "sourceType": "Halaman informasi resmi",
    "topics": [
      "polusi_udara",
      "kesehatan"
    ],
    "usageNote": "Tidak menentukan penyebab gejala pengguna",
    "releaseStatus": "not_granted"
  },
  {
    "id": "E37",
    "title": "Air pollution: Personal interventions and risk communication",
    "publisher": "WHO",
    "url": "https://www.who.int/news-room/questions-and-answers/item/air-pollution-personal-interventions-and-risk-communication",
    "group": "KONDISI_DAN_PANDUAN",
    "forGuidance": true,
    "forEducation": true,
    "forQuestions": true,
    "safetyDraft": false,
    "internal": false,
    "populationStudy": false,
    "sourceType": "Halaman informasi resmi",
    "topics": [
      "polusi_udara",
      "perlindungan"
    ],
    "usageNote": "Tindakan hanya setelah klaim disetujui",
    "releaseStatus": "not_granted"
  },
  {
    "id": "E38",
    "title": "Radiation: Protecting against skin cancer",
    "publisher": "WHO",
    "url": "https://www.who.int/news-room/questions-and-answers/item/radiation-protecting-against-skin-cancer",
    "group": "KONDISI_DAN_PANDUAN",
    "forGuidance": true,
    "forEducation": true,
    "forQuestions": true,
    "safetyDraft": false,
    "internal": false,
    "populationStudy": false,
    "sourceType": "Halaman informasi resmi",
    "topics": [
      "UV",
      "perlindungan_matahari"
    ],
    "usageNote": "Tidak menyimpulkan risiko individu",
    "releaseStatus": "not_granted"
  },
  {
    "id": "E39",
    "title": "Breastfeeding: questions and answers",
    "publisher": "WHO",
    "url": "https://www.who.int/news-room/questions-and-answers/item/breastfeeding",
    "group": "INFO_DAN_EDUKASI",
    "forGuidance": false,
    "forEducation": true,
    "forQuestions": true,
    "safetyDraft": false,
    "internal": false,
    "populationStudy": false,
    "sourceType": "Halaman informasi resmi",
    "topics": [
      "menyusui",
      "pertanyaan_umum"
    ],
    "usageNote": "Jangan menambahkan nasihat klinis",
    "releaseStatus": "not_granted"
  },
  {
    "id": "E40",
    "title": "Urgent Maternal Warning Signs and Symptoms",
    "publisher": "CDC",
    "url": "https://www.cdc.gov/hearher/maternal-warning-signs/index.html",
    "group": "SAFETY_INTERNAL",
    "forGuidance": false,
    "forEducation": true,
    "forQuestions": true,
    "safetyDraft": true,
    "internal": false,
    "populationStudy": false,
    "sourceType": "Halaman informasi resmi",
    "topics": [
      "kehamilan",
      "pascapersalinan",
      "tanda_bahaya"
    ],
    "usageNote": "Perlu review klinis sebelum aturan keselamatan aktif",
    "releaseStatus": "not_granted"
  },
  {
    "id": "E41",
    "title": "Heat-related Illnesses",
    "publisher": "CDC",
    "url": "https://www.cdc.gov/niosh/heat-stress/about/illnesses.html",
    "group": "SAFETY_INTERNAL",
    "forGuidance": true,
    "forEducation": true,
    "forQuestions": true,
    "safetyDraft": true,
    "internal": false,
    "populationStudy": false,
    "sourceType": "Halaman informasi resmi",
    "topics": [
      "panas",
      "penyakit_terkait_panas",
      "tanda_bahaya"
    ],
    "usageNote": "Perlu review klinis sebelum aturan keselamatan aktif",
    "releaseStatus": "not_granted"
  },
  {
    "id": "E42",
    "title": "Community Respirators and Masks",
    "publisher": "CDC",
    "url": "https://www.cdc.gov/niosh/ppe/php/community-respirators-masks/index.html",
    "group": "KONDISI_DAN_PANDUAN",
    "forGuidance": true,
    "forEducation": true,
    "forQuestions": true,
    "safetyDraft": false,
    "internal": false,
    "populationStudy": false,
    "sourceType": "Halaman informasi resmi",
    "topics": [
      "masker",
      "polusi_udara",
      "perlindungan"
    ],
    "usageNote": "Periksa jenis masker dan konteks pengguna",
    "releaseStatus": "not_granted"
  },
  {
    "id": "E43",
    "title": "Safety Guidelines: Wildfires and Wildfire Smoke",
    "publisher": "CDC",
    "url": "https://www.cdc.gov/wildfires/safety/how-to-safely-stay-safe-during-a-wildfire.html",
    "group": "KONDISI_DAN_PANDUAN",
    "forGuidance": true,
    "forEducation": true,
    "forQuestions": true,
    "safetyDraft": false,
    "internal": false,
    "populationStudy": false,
    "sourceType": "Halaman informasi resmi",
    "topics": [
      "asap_kebakaran",
      "polusi_udara"
    ],
    "usageNote": "Tidak otomatis relevan dengan kondisi lokal",
    "releaseStatus": "not_granted"
  },
  {
    "id": "E44",
    "title": "Air pollutants and ovarian reserve: a systematic review of the evidence",
    "publisher": "Frontiers in Public Health",
    "url": "https://www.frontiersin.org/journals/public-health/articles/10.3389/fpubh.2024.1425876/full",
    "group": "INFO_DAN_EDUKASI",
    "forGuidance": false,
    "forEducation": true,
    "forQuestions": true,
    "safetyDraft": false,
    "internal": false,
    "populationStudy": true,
    "sourceType": "Halaman informasi resmi",
    "topics": [
      "polusi_udara",
      "cadangan_ovarium"
    ],
    "usageNote": "Tidak menilai kesuburan individu",
    "releaseStatus": "not_granted"
  },
  {
    "id": "E45",
    "title": "Ambient Air Pollution Exposure Assessments in Fertility Studies: a Systematic Review and Guide for Reproductive Epidemiologists",
    "publisher": "Springer",
    "url": "https://link.springer.com/article/10.1007/s40471-022-00290-z",
    "group": "INTERNAL",
    "forGuidance": false,
    "forEducation": false,
    "forQuestions": false,
    "safetyDraft": false,
    "internal": true,
    "populationStudy": false,
    "sourceType": "Halaman informasi resmi",
    "topics": [
      "polusi_udara",
      "kesuburan",
      "metodologi"
    ],
    "usageNote": "Metode studi saja, bukan panduan pengguna",
    "releaseStatus": "not_granted"
  },
  {
    "id": "E46",
    "title": "Extreme Heat and Pregnancy Outcomes: A Scoping Review of the Epidemiological Evidence",
    "publisher": "MDPI",
    "url": "https://www.mdpi.com/1660-4601/19/4/2412",
    "group": "INFO_DAN_EDUKASI",
    "forGuidance": false,
    "forEducation": true,
    "forQuestions": true,
    "safetyDraft": false,
    "internal": false,
    "populationStudy": true,
    "sourceType": "Artikel ilmiah (ringkasan)",
    "topics": [
      "kehamilan",
      "panas",
      "hasil_kehamilan"
    ],
    "usageNote": "Bukti lingkup; bukan risiko individual",
    "releaseStatus": "not_granted"
  }
];
