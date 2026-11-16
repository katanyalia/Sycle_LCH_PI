// PDF untuk catatan Health Tracker yang masih tersimpan di perangkat (belum tersinkron).
// Memakai pembentuk PDF yang sama dengan server, jadi isinya sama dengan PDF catatan tersimpan,
// ditambah label "Belum tersinkron". Dibuat sepenuhnya di browser, tidak butuh internet.
import { mapHealthTrackerToTable } from "@/lib/healthtracker/trackerMapper";
import { buildTrackerRecordPdf } from "@/lib/services/trackerPdfService";

function queuedItemToRecord(item) {
  const payload = mapHealthTrackerToTable(item.input);

  return {
    id: `offline-${item.id}`,
    recorded_at: item.recordedAt,
    context: payload.health_tracker.context,
    story: payload.health_tracker.story,
    refleksi_ai: null,
    answers: payload.answer_tracker.map((answer) => ({
      code_question: answer.code_question,
      answer: answer.answer_value,
      scale: answer.scale,
    })),
    tracker_environment_snapshots: payload.environment
      ? { ...payload.environment, captured_at: item.recordedAt }
      : null,
  };
}

export function downloadQueuedRecordPdf(item) {
  const { bytes, filename } = buildTrackerRecordPdf(queuedItemToRecord(item), { unsynced: true });
  const url = URL.createObjectURL(new Blob([bytes], { type: "application/pdf" }));

  const link = document.createElement("a");
  link.href = url;
  link.download = filename.replace(".pdf", "-belum-tersinkron.pdf");
  document.body.appendChild(link);
  link.click();
  link.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
