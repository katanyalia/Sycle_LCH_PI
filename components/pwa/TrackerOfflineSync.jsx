"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { CloudOff, Download, RefreshCw } from "lucide-react";

import { saveHealthTrackerAssessment } from "@/app/healthtracker/assessment/actions";
import { createClient } from "@/lib/supabase/client";
import {
  lastTrackerUser,
  listQueuedRecords,
  onTrackerQueueChange,
  rememberTrackerUser,
  removeQueuedRecord,
} from "@/lib/healthtracker/offlineQueue";
import { downloadQueuedRecordPdf } from "@/lib/healthtracker/offlinePdf";

// Mengirim catatan Health Tracker yang dibuat saat offline ke Supabase begitu perangkat online,
// dan menampilkan penanda "belum tersinkron" selama masih ada catatan di perangkat.
export function TrackerOfflineSync() {
  const [pending, setPending] = useState([]);
  const [pdfError, setPdfError] = useState("");
  const [syncing, setSyncing] = useState(false);
  const runningRef = useRef(false);

  const sync = useCallback(async () => {
    if (runningRef.current) return;
    runningRef.current = true;

    try {
      const supabase = createClient();
      let sessionUserId = null;
      try {
        const { data } = await supabase.auth.getSession();
        sessionUserId = data.session?.user?.id ?? null;
      } catch {
        sessionUserId = null;
      }
      rememberTrackerUser(sessionUserId);
      const userId = sessionUserId ?? lastTrackerUser();
      const queued = await listQueuedRecords();

      // Catatan akun lain (mis. sesi yang sudah berakhir) tidak ditampilkan dan tidak dikirim.
      const mine = userId ? queued.filter((item) => item.userId === userId) : [];
      setPending(mine);

      // Kirim hanya bila sesi login aktif (bukan sekadar akun terakhir di perangkat).
      if (!mine.length || !sessionUserId || navigator.onLine === false) return;

      setSyncing(true);
      for (const item of mine) {
        let result;
        try {
          result = await saveHealthTrackerAssessment({
            ...item.input,
            recordedAt: item.recordedAt,
          });
        } catch {
          break; // koneksi putus lagi; dicoba saat online berikutnya
        }
        if (!result?.ok) break; // mis. sesi berakhir; catatan tetap disimpan di perangkat
        await removeQueuedRecord(item.id);
      }

      const left = (await listQueuedRecords()).filter((item) => item.userId === userId);
      setPending(left);
    } finally {
      setSyncing(false);
      runningRef.current = false;
    }
  }, []);

  useEffect(() => {
    const frame = requestAnimationFrame(() => {
      sync();
    });
    window.addEventListener("online", sync);
    const stopListening = onTrackerQueueChange(() => {
      if (!runningRef.current) sync();
    });

    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("online", sync);
      stopListening();
    };
  }, [sync]);

  if (!pending.length) return null;

  function handleDownload(item) {
    setPdfError("");
    try {
      downloadQueuedRecordPdf(item);
    } catch {
      setPdfError("PDF belum berhasil dibuat. Coba lagi.");
    }
  }

  const timeFormat = new Intl.DateTimeFormat("id-ID", { dateStyle: "medium", timeStyle: "short" });

  return (
    <div
      role="status"
      className="fixed inset-x-4 bottom-24 z-40 mx-auto flex max-w-md items-start gap-3 rounded-2xl border border-[#F2D6B8] bg-[#FFF6EC] p-4 text-sm leading-6 text-[#6E5236] shadow-lg"
    >
      {syncing ? (
        <RefreshCw className="mt-1 size-4 shrink-0 animate-spin" aria-hidden="true" />
      ) : (
        <CloudOff className="mt-1 size-4 shrink-0" aria-hidden="true" />
      )}
      <div className="min-w-0 flex-1">
        <p>
          <strong>{pending.length} catatan Health Tracker belum tersinkron.</strong>{" "}
          {syncing
            ? "Sedang mengirim ke akunmu..."
            : "Catatan tersimpan di perangkat ini dan akan dikirim otomatis saat kamu online."}
        </p>

        <ul className="mt-2 space-y-1">
          {pending.map((item) => (
            <li key={item.id} className="flex items-center justify-between gap-2">
              <span className="text-xs">{timeFormat.format(new Date(item.recordedAt))}</span>
              <button
                type="button"
                onClick={() => handleDownload(item)}
                className="inline-flex items-center gap-1 rounded-full border border-[#E9C9A6] bg-white px-3 py-1 text-xs font-bold text-[#8A5A1F] hover:bg-[#FFF0DD]"
              >
                <Download className="size-3.5" aria-hidden="true" />
                Unduh PDF
              </button>
            </li>
          ))}
        </ul>

        {pdfError && <p className="mt-1 text-xs text-red-700">{pdfError}</p>}
      </div>
    </div>
  );
}
