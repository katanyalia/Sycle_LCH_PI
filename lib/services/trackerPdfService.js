// Menyusun PDF satu catatan tersimpan (screen 57, T7-2): judul & tanggal, keterangan non-diagnostik,
// jawaban Tracker, kondisi lingkungan beserta sumber & waktunya. Tanpa package (lib/pdf/simplePdf.js).
import { createPdfDocument } from "@/lib/pdf/simplePdf";
import { buildRecordView, RECORD_NOTES } from "@/lib/tracker/record";

export function buildTrackerRecordPdf(record, { generatedAt = new Date() } = {}) {
  const view = buildRecordView(record);
  const generated = new Intl.DateTimeFormat("id-ID", { dateStyle: "long", timeZone: "Asia/Jakarta" }).format(generatedAt);
  const pdf = createPdfDocument({
    title: `Catatan Health Tracker SYCLE V2 — ${view.timeText}`,
    footer: `SYCLE V2 · Dibuat ${generated} dari catatan tersimpan · Bukan dokumen diagnosis`,
  });

  pdf.text("SYCLE V2", { size: 10, bold: true, color: "#B84E73", gapAfter: 2 });
  pdf.text("Catatan Health Tracker", { size: 20, bold: true, gapAfter: 2 });
  pdf.text(`Dicatat ${view.timeText} · Konteks: ${view.contextLabel}`, { size: 10.5, color: "#6B5A6E", gapAfter: 10 });
  pdf.text(RECORD_NOTES.nonDiagnostic, { size: 10, bold: true, color: "#8E3E5E", gapAfter: 6 });
  pdf.rule();

  pdf.heading("Jawaban catatan");
  for (const answer of view.answers) pdf.field(answer.label, answer.text);
  pdf.text(RECORD_NOTES.scale, { size: 9, color: "#6B5A6E", gapAfter: 6 });
  pdf.rule();

  pdf.heading("Kondisi lingkungan saat pencatatan");
  if (view.environment) {
    pdf.field("Lokasi", view.environment.locationLabel);
    pdf.field("Waktu pengambilan data", view.environment.capturedText);
    for (const ind of view.environment.indicators) {
      const head = [ind.valueText, ind.standard && !ind.valueText.endsWith(ind.standard) ? ind.standard : null, ind.category]
        .filter(Boolean)
        .join(" · ");
      const meta = [`Sumber: ${ind.source}`, ind.dataTypeLabel, `waktu data ${ind.timeText}`, ind.isFallback ? "data cadangan" : null]
        .filter(Boolean)
        .join(" · ");
      pdf.field(ind.label, `${head}\n${meta}`);
    }
    pdf.text(RECORD_NOTES.environment, { size: 9, color: "#6B5A6E", gapAfter: 6 });
  } else {
    pdf.text(RECORD_NOTES.noEnvironment, { gapAfter: 6 });
  }
  pdf.rule();

  pdf.heading("Refleksi AI");
  pdf.text(RECORD_NOTES.noAi);

  const date = new Date(view.recordedAt);
  const stamp = Number.isNaN(date.getTime()) ? "catatan" : date.toISOString().slice(0, 10);
  return { bytes: pdf.toBytes(), filename: `catatan-sycle-${stamp}.pdf` };
}
