// Tanya SYCLE tanpa AI (E-2): kata kunci Bahasa Indonesia (+ padanan umum) untuk mencocokkan pertanyaan dengan
// topik Info & Edukasi dan istilah glosarium. Jawaban hanya disusun dari konten yang sudah ada.
// Kata kunci ditulis huruf kecil tanpa tanda baca (lihat normalizeQuestion).

export const TOPIC_KEYWORDS = {
  "panas-dan-tubuh": [
    "panas", "cuaca panas", "gerah", "kepanasan", "gelombang panas", "suhu tinggi", "terik", "heatstroke",
    "sengatan panas", "heat exhaustion", "keringat", "berkeringat", "minum air", "hidrasi", "dehidrasi", "kipas angin",
    "lansia", "berteduh",
  ],
  "kualitas-udara-dan-pm25": [
    "polusi", "polusi udara", "kualitas udara", "udara", "pm25", "partikulat", "asap", "kabut asap", "masker",
    "respirator", "ispu", "aqi", "us aqi", "pencemar", "pencemaran", "debu",
  ],
  "indeks-uv-dan-perlindungan-matahari": [
    "uv", "indeks uv", "ultraviolet", "sinar matahari", "matahari", "tabir surya", "sunscreen", "sunblock", "spf",
    "kulit terbakar", "kacamata hitam", "topi", "berjemur",
  ],
  "menstruasi-suhu-tubuh-dan-cuaca-panas": [
    "menstruasi", "haid", "datang bulan", "mens", "nyeri haid", "kram", "kram perut", "dismenore", "siklus",
    "siklus menstruasi", "fase luteal", "luteal", "ovulasi", "pembalut",
  ],
  "kehamilan-dan-cuaca-panas": [
    "hamil", "kehamilan", "ibu hamil", "janin", "kandungan", "bidan", "gerakan bayi", "trimester",
  ],
  "menyusui-saat-cuaca-panas": [
    "menyusui", "asi", "asi eksklusif", "laktasi", "pompa asi", "memompa", "bayi", "air putih bayi", "air seni bayi",
  ],
  "perubahan-iklim-dan-kesehatan-perempuan": [
    "iklim", "perubahan iklim", "pemanasan global", "krisis iklim", "kebijakan", "kemenkes", "rencana aksi",
  ],
};

export const GLOSSARY_KEYWORDS = {
  "heat-index": ["heat index", "indeks panas"],
  ispu: ["ispu"],
  "us-aqi": ["us aqi", "aqi"],
  "indeks-uv": ["indeks uv", "uv index"],
  "kelembapan-relatif": ["kelembapan", "kelembaban", "kelembapan relatif", "rh"],
  prakiraan: ["prakiraan", "ramalan cuaca"],
  pengamatan: ["pengamatan", "stasiun"],
  "data-model": ["data model"],
  "data-cadangan": ["data cadangan", "cadangan"],
  pm25: ["pm25", "partikulat"],
  dehidrasi: ["dehidrasi", "kurang cairan"],
  dismenore: ["dismenore", "nyeri haid"],
  "fase-luteal": ["fase luteal", "luteal"],
  "studi-populasi": ["studi populasi", "penelitian populasi"],
  "tinjauan-sistematis": ["tinjauan sistematis", "systematic review"],
  "meta-analisis": ["meta analisis", "metaanalisis"],
};

// Contoh pertanyaan di layar awal (wireframe screen 59: contoh topik Heat Index, ISPU, UV).
export const EXAMPLE_QUESTIONS = [
  "Apa itu Heat Index?",
  "Apa bedanya ISPU dan US AQI?",
  "Apa arti angka Indeks UV?",
  "Bagaimana menjaga tubuh saat cuaca panas?",
  "Apakah bayi yang mendapat ASI perlu air putih saat cuaca panas?",
];

// Pertanyaan yang meminta penilaian kondisi pribadi, obat, atau keadaan darurat → tidak dijawab (screen 61, E-4).
export const EMERGENCY_PATTERNS = [
  /\bpingsan\b/,
  /\btidak sadar/,
  /\bsesak napas\b|\bsesak nafas\b|\bsulit bernapas\b|\bsusah napas\b/,
  /\bkejang\b/,
  /\bnyeri dada\b/,
  /\bpendarahan\b|\bperdarahan hebat\b/,
  /\bdarurat\b|\bgawat\b/,
  /\bbayi (tidak|tak|kurang) bergerak\b|\bgerakan bayi (berkurang|hilang)\b/,
];

export const PERSONAL_PATTERNS = [
  /\b(apakah|apa|kenapa|mengapa) (saya|aku|gue|gw)\b/,
  /\b(saya|aku) (sakit|demam|menderita|kena|terkena|mengidap|merasa|hamil|telat)\b/,
  /\bdiagnos/,
  /\b(obat|dosis|resep|antibiotik|ibuprofen|parasetamol|paracetamol|suplemen)\b/,
  /\b(normal|bahaya|aman) (nggak|gak|tidak|enggak)\b.*\b(saya|aku)\b/,
  /\b(berapa|apa) risiko (saya|aku)\b/,
  /\b(catatan|riwayat|tracker) (saya|aku)\b/,
];
