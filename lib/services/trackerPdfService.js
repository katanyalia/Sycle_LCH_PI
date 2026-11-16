// Menyusun PDF satu catatan tersimpan.
// Mencakup jawaban, kondisi lingkungan, dan refleksi AI.

import { createPdfDocument } from "@/lib/pdf/simplePdf";
import { buildRecordView, RECORD_NOTES } from "@/lib/tracker/record";

// Mengubah Markdown menjadi teks yang dapat dibaca di PDF.
function markdownToPdfText(markdown) {
  return String(markdown)
    .split(/\r?\n/)
    .map((line) => {
      const trimmed = line.trim();

      if (!trimmed) return "";

      // Judul Markdown.
      if (/^#{1,6}\s/.test(trimmed)) {
        return trimmed.replace(/^#{1,6}\s*/, "").toUpperCase();
      }

      // Daftar berpoin.
      if (/^[-*]\s+/.test(trimmed)) {
        return `• ${trimmed.replace(/^[-*]\s+/, "")}`;
      }

      // Tautan Markdown menjadi judul dan URL.
      return trimmed
        .replace(
          /\[([^\]]+)\]\((https?:\/\/[^)]+)\)/g,
          "$1 ($2)"
        )
        .replace(/\*\*(.*?)\*\*/g, "$1")
        .replace(/\*(.*?)\*/g, "$1")
        .replace(/`([^`]+)`/g, "$1");
    })
    .join("\n")
    .trim();
}

export function buildTrackerRecordPdf(
  record,
  { generatedAt = new Date(), unsynced = false } = {}
) {
  const view = buildRecordView(record);

  const generated = new Intl.DateTimeFormat("id-ID", {
    dateStyle: "long",
    timeZone: "Asia/Jakarta",
  }).format(generatedAt);

  const pdf = createPdfDocument({
    title: `Catatan Health Tracker SYCLE V2 — ${view.timeText}`,
    footer: unsynced
      ? `SYCLE V2 · Dibuat ${generated} dari catatan di perangkat (belum tersinkron) · Bukan dokumen diagnosis`
      : `SYCLE V2 · Dibuat ${generated} dari catatan tersimpan · Bukan dokumen diagnosis`,
  });

  pdf.text("SYCLE V2", {
    size: 10,
    bold: true,
    color: "#B84E73",
    gapAfter: 2,
  });

  pdf.text("Catatan Health Tracker", {
    size: 20,
    bold: true,
    gapAfter: 2,
  });

  pdf.text(
    `Dicatat ${view.timeText} · Konteks: ${view.contextLabel}`,
    { size: 10.5, color: "#6B5A6E", gapAfter: unsynced ? 4 : 10 }
  );

  // Catatan offline: dibuat dari salinan di perangkat sebelum terkirim ke akun.
  if (unsynced) {
    pdf.text(
      "Belum tersinkron: catatan ini masih tersimpan di perangkat dan akan dikirim ke akunmu saat online.",
      { size: 10, bold: true, color: "#8A5A1F", gapAfter: 10 }
    );
  }

  pdf.text(RECORD_NOTES.nonDiagnostic, {
    size: 10,
    bold: true,
    color: "#8E3E5E",
    gapAfter: 6,
  });

  pdf.rule();

  pdf.heading("Jawaban catatan");

  for (const answer of view.answers) {
    pdf.field(answer.label, answer.text);
  }

  pdf.text(RECORD_NOTES.scale, {
    size: 9,
    color: "#6B5A6E",
    gapAfter: 6,
  });

  pdf.rule();

  pdf.heading("Kondisi lingkungan saat pencatatan");

  if (view.environment) {
    pdf.field("Lokasi", view.environment.locationLabel);
    pdf.field("Waktu pengambilan data", view.environment.capturedText);

    for (const ind of view.environment.indicators) {
      const head = [
        ind.valueText,
        ind.standard && !ind.valueText.endsWith(ind.standard)
          ? ind.standard
          : null,
        ind.category,
      ]
        .filter(Boolean)
        .join(" · ");

      const meta = [
        `Sumber: ${ind.source}`,
        ind.dataTypeLabel,
        `waktu data ${ind.timeText}`,
        ind.isFallback ? "data cadangan" : null,
      ]
        .filter(Boolean)
        .join(" · ");

      pdf.field(ind.label, `${head}\n${meta}`);
    }

    pdf.text(RECORD_NOTES.environment, {
      size: 9,
      color: "#6B5A6E",
      gapAfter: 6,
    });
  } else {
    pdf.text(RECORD_NOTES.noEnvironment, { gapAfter: 6 });
  }

  pdf.rule();

  // Refleksi AI yang tersimpan di health_tracker.
  pdf.heading("Refleksi AI");

  if (view.aiReflection) {
    pdf.text(markdownToPdfText(view.aiReflection), {
      size: 9.5,
      color: "#332A35",
      gapAfter: 8,
    });
  } else {
    pdf.text(RECORD_NOTES.noAi, {
      size: 9,
      color: "#6B5A6E",
    });
  }

  const date = new Date(view.recordedAt);

  const stamp = Number.isNaN(date.getTime())
    ? "catatan"
    : date.toISOString().slice(0, 10);

  return {
    bytes: pdf.toBytes(),
    filename: `catatan-sycle-${stamp}.pdf`,
  };
}