"use client";

import { useState } from "react";
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  RotateCcw,
  Shuffle,
} from "lucide-react";

// Kartu Belajar: depan = istilah, belakang = definisi. Progres tidak disimpan.
export default function GlossaryFlashcards({
  terms,
  understood,
  onToggleUnderstood,
}) {
  const [order, setOrder] = useState(() => terms.map((_, index) => index));
  const [position, setPosition] = useState(0);
  const [flipped, setFlipped] = useState(false);

  if (terms.length === 0) {
    return (
      <p className="rounded-[22px] border border-dashed border-[#E4CBD7] bg-white p-8 text-center text-sm text-[#827382]">
        Belum ada istilah pada topik ini.
      </p>
    );
  }

  const term = terms[order[position]];
  const isUnderstood = understood.has(term.id);

  function goTo(nextPosition) {
    setPosition((nextPosition + terms.length) % terms.length);
    setFlipped(false);
  }

  function shuffle() {
    const next = terms.map((_, index) => index);
    for (let i = next.length - 1; i > 0; i -= 1) {
      const j = Math.floor(Math.random() * (i + 1));
      [next[i], next[j]] = [next[j], next[i]];
    }
    setOrder(next);
    setPosition(0);
    setFlipped(false);
  }

  return (
    <div className="mx-auto max-w-2xl">
      <div className="mb-3 flex items-center justify-between text-sm text-[#827382]">
        <span>
          Kartu{" "}
          <span className="font-extrabold text-[#514351]">{position + 1}</span>{" "}
          dari {terms.length}
        </span>
        <button
          type="button"
          onClick={shuffle}
          className="inline-flex items-center gap-1.5 font-bold text-[#B84E73] hover:text-[#8E3E5E]"
        >
          <Shuffle className="size-4" />
          Acak
        </button>
      </div>

      <button
        type="button"
        onClick={() => setFlipped((value) => !value)}
        aria-label={flipped ? "Tampilkan istilah" : "Tampilkan definisi"}
        className={`flex min-h-[260px] w-full flex-col items-center justify-center rounded-[26px] border p-7 text-center shadow-[0_8px_28px_rgb(120_70_90_/_8%)] transition-colors sm:p-10 ${
          flipped
            ? "border-[#D6E8D8] bg-[#EDF6EE]"
            : "border-[#F3D5E1] bg-[#FFF0F5]"
        }`}
      >
        {flipped ? (
          <>
            <span className="text-xs font-extrabold uppercase tracking-[0.14em] text-[#427D55]">
              Definisi
            </span>
            <p className="mt-4 text-base leading-7 text-[#332A35] sm:text-lg sm:leading-8">
              {term.definition}
            </p>
            {term.note && (
              <p className="mt-4 text-sm leading-6 text-[#5E6F61]">{term.note}</p>
            )}
          </>
        ) : (
          <>
            <span className="text-xs font-extrabold uppercase tracking-[0.14em] text-[#B84E73]">
              Istilah
            </span>
            <p className="mt-4 text-2xl font-extrabold leading-tight text-[#332A35] sm:text-3xl">
              {term.term}
            </p>
            <span className="mt-6 inline-flex items-center gap-1.5 text-sm font-bold text-[#984568]">
              <RotateCcw className="size-4" />
              Ketuk untuk melihat definisi
            </span>
          </>
        )}
      </button>

      <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
        <button
          type="button"
          onClick={() => goTo(position - 1)}
          className="inline-flex items-center gap-1.5 rounded-full border border-[#E9DCE3] bg-white px-4 py-2 text-sm font-bold text-[#6E5F6C] hover:border-[#D7A9BC] hover:text-[#984568]"
        >
          <ArrowLeft className="size-4" />
          Sebelumnya
        </button>

        <button
          type="button"
          onClick={() => onToggleUnderstood(term.id)}
          aria-pressed={isUnderstood}
          className={`inline-flex items-center gap-1.5 rounded-full px-4 py-2 text-sm font-extrabold transition ${
            isUnderstood
              ? "bg-[#52775B] text-white"
              : "border border-[#B7D9BE] bg-white text-[#427D55] hover:bg-[#EDF6EE]"
          }`}
        >
          <CheckCircle2 className="size-4" />
          {isUnderstood ? "Sudah paham" : "Tandai sudah paham"}
        </button>

        <button
          type="button"
          onClick={() => goTo(position + 1)}
          className="inline-flex items-center gap-1.5 rounded-full bg-[#B84E73] px-4 py-2 text-sm font-bold text-white hover:bg-[#8E3E5E]"
        >
          Berikutnya
          <ArrowRight className="size-4" />
        </button>
      </div>
    </div>
  );
}
