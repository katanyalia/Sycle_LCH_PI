"use client";

import { useState } from "react";
import { FileDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { StatusMessage } from "@/components/feedback/StatusMessage";

// WF-06 screen 57 — unduh file PDF dari Route Handler (kepemilikan dicek di server).
// Status berhasil/gagal ditampilkan setelah respons server diterima.
export function PdfDownloadButton({ recordId }) {
  const [status, setStatus] = useState("idle");
  const [message, setMessage] = useState(null);

  async function download() {
    setStatus("loading");
    setMessage(null);
    try {
      const response = await fetch(`/api/tracker/records/${recordId}/pdf`, { cache: "no-store" });
      if (!response.ok) {
        const body = await response.json().catch(() => ({}));
        setStatus("error");
        setMessage(body.error ?? "PDF belum berhasil dibuat. Coba lagi.");
        return;
      }
      const blob = await response.blob();
      const filename = /filename="([^"]+)"/.exec(response.headers.get("Content-Disposition") ?? "")?.[1] ?? "catatan-sycle.pdf";
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      link.remove();
      URL.revokeObjectURL(url);
      setStatus("done");
      setMessage(filename);
    } catch {
      setStatus("error");
      setMessage("Tidak dapat terhubung ke server. Periksa koneksi internetmu lalu coba lagi.");
    }
  }

  return (
    <div className="space-y-3">
      <Button onClick={download} disabled={status === "loading"}>
        <FileDown aria-hidden="true" />
        {status === "loading" ? "Menyiapkan PDF…" : "Unduh PDF"}
      </Button>
      {status === "done" && (
        <StatusMessage variant="success" title="PDF berhasil dibuat">
          File {message} sudah dikirim ke browser. Periksa folder unduhan perangkatmu.
        </StatusMessage>
      )}
      {status === "error" && (
        <StatusMessage variant="error" title="PDF belum berhasil diunduh">
          {message}
        </StatusMessage>
      )}
    </div>
  );
}
