import { createPdfDocument, toWinAnsi, wrapText } from "@/lib/pdf/simplePdf";

function checkStructure(bytes) {
  const text = bytes.toString("latin1");
  expect(text.startsWith("%PDF-1.4")).toBe(true);
  expect(text.trimEnd().endsWith("%%EOF")).toBe(true);
  const startxref = Number(/startxref\n(\d+)/.exec(text)[1]);
  expect(text.slice(startxref, startxref + 4)).toBe("xref");
  // Setiap offset di tabel xref harus menunjuk tepat ke "n 0 obj".
  const entries = [...text.slice(startxref).matchAll(/(\d{10}) 00000 n /g)].map((m) => Number(m[1]));
  entries.forEach((offset, i) => expect(text.slice(offset, offset + `${i + 1} 0 obj`.length)).toBe(`${i + 1} 0 obj`));
  return text;
}

describe("PDF tanpa package (T7-2)", () => {
  test("struktur valid: header, xref, trailer", () => {
    const pdf = createPdfDocument({ title: "Uji", footer: "Kaki" });
    pdf.heading("Judul").text("Isi (dengan kurung) dan \\ garis miring.").rule().field("Label", "Nilai");
    const text = checkStructure(pdf.toBytes());
    expect(text).toContain("(Isi \\(dengan kurung\\) dan \\\\ garis miring.) Tj");
    expect(text).toContain("/BaseFont /Helvetica-Bold");
    expect(text).toContain("(Halaman 1 dari 1) Tj");
  });

  test("teks panjang dipenggal dan pindah halaman otomatis", () => {
    const pdf = createPdfDocument();
    for (let i = 0; i < 120; i++) pdf.text(`Baris ke-${i} dengan isi yang cukup panjang agar dipenggal menjadi beberapa baris di halaman A4.`);
    const text = checkStructure(pdf.toBytes());
    const pages = Number(/\/Count (\d+)/.exec(text)[1]);
    expect(pages).toBeGreaterThan(2);
    expect(text).toContain(`(Halaman ${pages} dari ${pages}) Tj`);
  });

  test("pemenggalan tidak melebihi lebar dan menjaga semua kata", () => {
    const lines = wrapText(toWinAnsi("kata ".repeat(60).trim()), "F1", 10, 200);
    expect(lines.length).toBeGreaterThan(1);
    expect(lines.join(" ").split(" ")).toHaveLength(60);
  });

  test("karakter Indonesia & satuan dikodekan WinAnsi; yang tidak didukung diganti", () => {
    expect(toWinAnsi("31,5 °C – µg/m³")).toBe("31,5 \xb0C \x96 \xb5g/m\xb3");
    expect(toWinAnsi("≤ 25 km → 😊")).toBe("<= 25 km -> ?");
  });
});
