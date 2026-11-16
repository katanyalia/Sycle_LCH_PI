"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Trash2, X } from "lucide-react";
import { deleteTrackerHistory } from "@/app/healthtracker/history/actions";

const PRIMARY_BUTTON =
  "inline-flex h-11 items-center justify-center rounded-full bg-[#B84E73] px-5 text-sm font-bold text-white transition-colors duration-200 hover:bg-[#8E3E5E] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#B84E73] focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60";

const SECONDARY_BUTTON =
  "inline-flex h-11 items-center justify-center rounded-full border border-[#E8D5DE] bg-white px-5 text-sm font-bold text-[#8E3E5E] transition-colors duration-200 hover:border-[#B84E73] hover:bg-[#FFF8FB] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#B84E73] focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50";

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

  function handleClose() {
    if (isPending) return;

    setIsOpen(false);
    setMessage("");
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
        className="inline-flex h-11 items-center justify-center gap-2 rounded-full border border-[#E8C9D5] bg-white px-5 text-sm font-bold text-[#B84E73] transition-colors duration-200 hover:border-[#B84E73] hover:bg-[#F8E8EF] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#B84E73] focus-visible:ring-offset-2"
      >
        <Trash2 size={15} />
        Hapus
      </button>

      {isOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-[#332A35]/40 p-5"
          onClick={handleClose}
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
                onClick={handleClose}
                disabled={isPending}
                aria-label="Tutup dialog"
                className="inline-flex h-11 w-11 items-center justify-center rounded-full text-[#8A7D89] transition-colors duration-200 hover:bg-[#FFF8FB] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#B84E73] focus-visible:ring-offset-2 disabled:opacity-50"
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
                onClick={handleClose}
                disabled={isPending}
                className={SECONDARY_BUTTON}
              >
                Batal
              </button>

              <button
                type="button"
                onClick={handleDelete}
                disabled={isPending}
                className={PRIMARY_BUTTON}
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