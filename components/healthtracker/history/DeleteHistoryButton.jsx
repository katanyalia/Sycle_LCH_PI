"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Trash2, X } from "lucide-react";
import { deleteTrackerHistory } from "@/app/healthtracker/history/actions";

export default function DeleteHistoryButton({ recordId }) {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [message, setMessage] = useState("");
  const [isPending, startTransition] = useTransition();

  function handleDelete() {
    setMessage("");

    startTransition(async () => {
      const result = await deleteTrackerHistory(recordId);

      if (!result.ok) {
        setMessage(result.message || "Riwayat gagal dihapus.");
        return;
      }

      setIsOpen(false);
      router.refresh();
    });
  }

  return (
    <>
      <button
        type="button"
        onClick={() => {
          setMessage("");
          setIsOpen(true);
        }}
        aria-label="Hapus riwayat Check-In"
        className="inline-flex items-center justify-center gap-2 rounded-full border border-[#E8C9D5] px-4 py-2 text-xs font-bold text-[#B84E73] transition hover:border-[#B84E73] hover:bg-[#F8E8EF] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#B84E73] focus-visible:ring-offset-2"
      >
        <Trash2 size={15} />
        Hapus
      </button>

      {isOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-[#332A35]/40 p-5"
          onClick={() => !isPending && setIsOpen(false)}
        >
          <section
            role="alertdialog"
            aria-modal="true"
            aria-labelledby="delete-history-title"
            aria-describedby="delete-history-description"
            className="w-full max-w-md rounded-[24px] border border-[#F0E2E9] bg-white p-6 shadow-[0_12px_40px_rgb(51_42_53_/_18%)]"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="flex items-start justify-between gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#F8E8EF] text-[#B84E73]">
                <Trash2 size={23} />
              </div>

              <button
                type="button"
                onClick={() => setIsOpen(false)}
                disabled={isPending}
                aria-label="Tutup dialog"
                className="rounded-full p-2 text-[#8A7D89] transition hover:bg-[#FFF8FB] disabled:opacity-50"
              >
                <X size={19} />
              </button>
            </div>

            <h2
              id="delete-history-title"
              className="mt-5 text-xl font-extrabold text-[#332A35]"
            >
              Hapus riwayat Check-In?
            </h2>

            <p
              id="delete-history-description"
              className="mt-2 text-sm leading-7 text-[#6F6570]"
            >
              Catatan ini akan dihapus dari akunmu, termasuk item
              jawaban dan snapshot lingkungan yang terkait.
              Tindakan ini tidak dapat dibatalkan.
            </p>

            {message && (
              <p
                role="alert"
                className="mt-4 rounded-xl border border-[#F0D6A8] bg-[#FFF4E5] p-3 text-sm leading-6 text-[#7A4B00]"
              >
                {message}
              </p>
            )}

            <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                disabled={isPending}
                className="rounded-full border border-[#E8DCE3] px-5 py-3 text-sm font-bold text-[#6F6570] transition hover:bg-[#FFF8FB] disabled:opacity-50"
              >
                Batal
              </button>

              <button
                type="button"
                onClick={handleDelete}
                disabled={isPending}
                className="rounded-full bg-[#B84E73] px-5 py-3 text-sm font-extrabold text-white transition hover:bg-[#8E3E5E] disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isPending ? "Menghapus..." : "Ya, Hapus Riwayat"}
              </button>
            </div>
          </section>
        </div>
      )}
    </>
  );
}