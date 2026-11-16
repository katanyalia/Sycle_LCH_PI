// Pembuat PDF teks sederhana tanpa package (T7-2, K-05). Menghasilkan PDF 1.4 ukuran A4 dengan font
// standar Helvetica (tidak perlu menyematkan font). Mendukung judul, paragraf dengan pemenggalan baris
// otomatis, garis pemisah, halaman baru otomatis, dan nomor halaman.
// Teks dikodekan WinAnsi (huruf Latin, °, ³, µ, –, —, •); karakter lain diganti padanan ASCII.

const PAGE = { width: 595.28, height: 841.89, margin: 56 };
const CONTENT_WIDTH = PAGE.width - PAGE.margin * 2;
const FOOTER_SPACE = 36;

// Lebar glyph (per 1000 unit) untuk kode 32–126, dari metrik standar Adobe Helvetica & Helvetica-Bold.
// prettier-ignore
const WIDTHS = {
  F1: [278,278,355,556,556,889,667,191,333,333,389,584,278,333,278,278,556,556,556,556,556,556,556,556,556,556,278,278,584,584,584,556,1015,667,667,722,722,667,611,778,722,278,500,667,556,833,722,778,667,778,722,667,611,722,667,944,667,667,611,278,278,278,469,556,333,556,556,500,556,556,278,556,556,222,222,500,222,833,556,556,556,556,333,500,278,556,500,722,500,500,500,334,260,334,584],
  F2: [278,333,474,556,556,889,722,238,333,333,389,584,278,333,278,278,556,556,556,556,556,556,556,556,556,556,333,333,584,584,584,611,975,722,722,722,722,667,611,778,722,278,556,722,611,833,722,778,667,778,722,667,611,722,667,944,667,667,611,333,278,333,584,556,333,556,611,556,611,556,333,611,611,278,278,556,278,889,611,611,611,611,389,556,333,611,556,778,556,556,500,389,280,389,584],
};
const EXTRA_WIDTHS = { 0x95: 350, 0x96: 556, 0x97: 1000, 0x85: 1000, 0xb0: 400, 0xb3: 333, 0xb5: 556, 0xb7: 278 };

// Unicode → byte WinAnsi (selain ASCII dan Latin-1 yang sama persis).
const WIN_ANSI = { "€": 0x80, "…": 0x85, "‘": 0x91, "’": 0x92, "“": 0x93, "”": 0x94, "•": 0x95, "–": 0x96, "—": 0x97 };
const ASCII_FALLBACK = { "≤": "<=", "≥": ">=", "→": "->", "←": "<-", " ": " ", " ": " " };

export function toWinAnsi(text) {
  let out = "";
  for (const ch of String(text ?? "").normalize("NFC")) {
    const code = ch.codePointAt(0);
    if (ch === "\n") out += "\n";
    else if (ch === "\t") out += " ";
    else if (code >= 32 && code < 127) out += ch;
    else if (ASCII_FALLBACK[ch] !== undefined) out += ASCII_FALLBACK[ch];
    else if (WIN_ANSI[ch] !== undefined) out += String.fromCharCode(WIN_ANSI[ch]);
    else if (code >= 0xa1 && code <= 0xff) out += ch;
    else out += "?";
  }
  return out;
}

function textWidth(encoded, font, size) {
  let units = 0;
  for (let i = 0; i < encoded.length; i++) {
    const code = encoded.charCodeAt(i);
    units += code >= 32 && code < 127 ? WIDTHS[font][code - 32] : (EXTRA_WIDTHS[code] ?? 556);
  }
  return (units * size) / 1000;
}

// Memenggal teks (sudah WinAnsi) menjadi baris yang muat dalam `maxWidth`. Baris baru (\n) dipertahankan.
export function wrapText(encoded, font, size, maxWidth) {
  const lines = [];
  for (const paragraph of encoded.split("\n")) {
    let line = "";
    for (const word of paragraph.split(" ")) {
      const candidate = line ? `${line} ${word}` : word;
      if (textWidth(candidate, font, size) <= maxWidth) {
        line = candidate;
        continue;
      }
      if (line) lines.push(line);
      // Kata yang lebih panjang dari satu baris dipotong per karakter.
      let rest = word;
      while (textWidth(rest, font, size) > maxWidth) {
        let cut = rest.length - 1;
        while (cut > 1 && textWidth(rest.slice(0, cut), font, size) > maxWidth) cut--;
        lines.push(rest.slice(0, cut));
        rest = rest.slice(cut);
      }
      line = rest;
    }
    lines.push(line);
  }
  return lines;
}

const escapePdfString = (s) => s.replace(/\\/g, "\\\\").replace(/\(/g, "\\(").replace(/\)/g, "\\)");
const num = (n) => (Math.round(n * 100) / 100).toString();
const rgb = (hex) => {
  const v = parseInt(hex.replace("#", ""), 16);
  return [(v >> 16) & 255, (v >> 8) & 255, v & 255].map((c) => num(c / 255)).join(" ");
};

export function createPdfDocument({ title = "Dokumen", footer = "" } = {}) {
  const pages = [];
  let ops = null;
  let y = 0;

  function newPage() {
    ops = [];
    pages.push(ops);
    y = PAGE.height - PAGE.margin;
  }
  function ensureSpace(height) {
    if (!ops || y - height < PAGE.margin + FOOTER_SPACE) newPage();
  }
  function drawLine(text, { x, size, font, color }) {
    ops.push(`BT /${font} ${num(size)} Tf ${rgb(color)} rg ${num(x)} ${num(y)} Td (${escapePdfString(text)}) Tj ET`);
  }

  const doc = {
    // Paragraf dengan pemenggalan otomatis. indent = geser kiri (pt).
    text(value, { size = 10.5, bold = false, color = "#332A35", indent = 0, gapAfter = 4, lineHeight = 1.4 } = {}) {
      const font = bold ? "F2" : "F1";
      const lines = wrapText(toWinAnsi(value), font, size, CONTENT_WIDTH - indent);
      const leading = size * lineHeight;
      for (const line of lines) {
        ensureSpace(leading);
        y -= size;
        drawLine(line, { x: PAGE.margin + indent, size, font, color });
        y -= leading - size;
      }
      y -= gapAfter;
      return doc;
    },
    heading(value, { size = 13, color = "#8E3E5E" } = {}) {
      ensureSpace(size * 3);
      y -= 6;
      return doc.text(value, { size, bold: true, color, gapAfter: 4 });
    },
    // Pasangan label (tebal, kecil) + isi, dipakai untuk jawaban dan indikator.
    field(label, value, { indent = 0 } = {}) {
      ensureSpace(34);
      doc.text(label, { size: 9, bold: true, color: "#6B5A6E", indent, gapAfter: 0 });
      return doc.text(value, { size: 10.5, indent, gapAfter: 6 });
    },
    rule({ color = "#E8D3DC" } = {}) {
      ensureSpace(12);
      y -= 4;
      ops.push(`${rgb(color)} RG 0.75 w ${num(PAGE.margin)} ${num(y)} m ${num(PAGE.width - PAGE.margin)} ${num(y)} l S`);
      y -= 8;
      return doc;
    },
    space(height = 8) {
      y -= height;
      return doc;
    },
    toBytes() {
      if (pages.length === 0) newPage();
      const total = pages.length;
      const encodedFooter = toWinAnsi(footer);
      pages.forEach((pageOps, index) => {
        const label = toWinAnsi(`Halaman ${index + 1} dari ${total}`);
        const footerY = PAGE.margin - 22;
        if (encodedFooter) {
          const footerLine = wrapText(encodedFooter, "F1", 8, CONTENT_WIDTH - 90)[0];
          pageOps.push(`BT /F1 8 Tf ${rgb("#6B5A6E")} rg ${num(PAGE.margin)} ${num(footerY)} Td (${escapePdfString(footerLine)}) Tj ET`);
        }
        const x = PAGE.width - PAGE.margin - textWidth(label, "F1", 8);
        pageOps.push(`BT /F1 8 Tf ${rgb("#6B5A6E")} rg ${num(x)} ${num(footerY)} Td (${escapePdfString(label)}) Tj ET`);
      });
      return serialize(pages, toWinAnsi(title));
    },
  };
  return doc;
}

// Menyusun objek PDF + tabel xref. Semua string berupa byte Latin-1 (1 karakter = 1 byte).
function serialize(pages, encodedTitle) {
  const objects = [];
  const add = (body) => objects.push(body); // nomor objek = urutan, dimulai dari 1

  const catalogId = add(null);
  const pagesId = add(null);
  const fontRegular = add("<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica /Encoding /WinAnsiEncoding >>");
  const fontBold = add("<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold /Encoding /WinAnsiEncoding >>");
  const pageIds = pages.map((ops) => {
    const stream = ops.join("\n");
    const contentId = add(`<< /Length ${stream.length} >>\nstream\n${stream}\nendstream`);
    return add(
      `<< /Type /Page /Parent ${pagesId} 0 R /MediaBox [0 0 ${num(PAGE.width)} ${num(PAGE.height)}] ` +
        `/Resources << /Font << /F1 ${fontRegular} 0 R /F2 ${fontBold} 0 R >> >> /Contents ${contentId} 0 R >>`
    );
  });
  objects[catalogId - 1] = `<< /Type /Catalog /Pages ${pagesId} 0 R >>`;
  objects[pagesId - 1] = `<< /Type /Pages /Kids [${pageIds.map((id) => `${id} 0 R`).join(" ")}] /Count ${pageIds.length} >>`;
  const infoId = add(`<< /Title (${escapePdfString(encodedTitle)}) /Producer (SYCLE V2) >>`);

  let out = "%PDF-1.4\n%\xe2\xe3\xcf\xd3\n";
  const offsets = [];
  objects.forEach((body, i) => {
    offsets.push(out.length);
    out += `${i + 1} 0 obj\n${body}\nendobj\n`;
  });
  const xrefOffset = out.length;
  out += `xref\n0 ${objects.length + 1}\n0000000000 65535 f \n`;
  for (const offset of offsets) out += `${String(offset).padStart(10, "0")} 00000 n \n`;
  out += `trailer\n<< /Size ${objects.length + 1} /Root ${catalogId} 0 R /Info ${infoId} 0 R >>\nstartxref\n${xrefOffset}\n%%EOF\n`;
  // Server memakai Buffer; di browser (PDF catatan offline) dipakai Uint8Array dengan isi yang sama.
  if (typeof Buffer !== "undefined") return Buffer.from(out, "latin1");
  const bytes = new Uint8Array(out.length);
  for (let i = 0; i < out.length; i += 1) bytes[i] = out.charCodeAt(i) & 0xff;
  return bytes;
}
