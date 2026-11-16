"use client";

import { MessageCircle } from "lucide-react";

// Membuka widget Tanya Sycle dengan pertanyaan yang sudah terisi.
export default function AskSycleButton({ question }) {
  function openChat() {
    window.dispatchEvent(
      new CustomEvent("sycle:tanya", { detail: { question } })
    );
  }

  return (
    <button
      type="button"
      onClick={openChat}
      className="inline-flex items-center gap-2 rounded-full bg-[#B84E73] px-5 py-2.5 text-sm font-extrabold text-white transition hover:bg-[#8E3E5E]"
    >
      <MessageCircle className="size-4" aria-hidden="true" />
      Tanya Sycle
    </button>
  );
}
