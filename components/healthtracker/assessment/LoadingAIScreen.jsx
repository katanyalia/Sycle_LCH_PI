"use client";

import {
  BrainCircuit,
  HeartPulse,
  Sparkles,
} from "lucide-react";

import { useEffect } from "react";

export default function LoadingAIScreen({ onComplete }) {
  useEffect(() => {
    const timer = setTimeout(() => {
      onComplete();
    }, 3000);

    return () => clearTimeout(timer);
  }, [onComplete]);

  return (
    <section className="flex min-h-[380px] flex-col items-center justify-center px-5 py-12 text-center">
      <div className="relative mb-7 flex size-24 items-center justify-center rounded-full bg-[#F8E8EF]">
        <div className="absolute inset-0 animate-ping rounded-full bg-[#F8E8EF] opacity-40" />

        <div className="relative flex size-16 items-center justify-center rounded-full bg-white text-[#B84E73] shadow-sm">
          <BrainCircuit size={34} />
        </div>

        <div className="absolute -right-1 top-1 flex size-8 items-center justify-center rounded-full bg-[#E9F2EA] text-[#52745A]">
          <HeartPulse size={17} />
        </div>

        <div className="absolute -bottom-1 -left-2 flex size-8 items-center justify-center rounded-full bg-white text-[#B84E73] shadow-sm">
          <Sparkles size={17} />
        </div>
      </div>

      <span className="rounded-full bg-[#F8E8EF] px-3 py-1.5 text-xs font-bold tracking-wide text-[#8E3E5E]">
        PERSIAPAN RINGKASAN
      </span>

      <h2 className="mt-4 text-xl font-bold text-[#332A35]">
        Menyiapkan catatan check-in kamu
      </h2>

      <p className="mt-3 max-w-md text-sm leading-7 text-[#746875]">
        Kami sedang menyiapkan informasi dari aktivitas,
        kondisi tubuh, dan cerita yang sudah kamu bagikan.
      </p>

      <div className="mt-7 h-2 w-full max-w-xs overflow-hidden rounded-full bg-[#F8E8EF]">
        <div className="h-full w-1/2 animate-pulse rounded-full bg-[#B84E73]" />
      </div>

      <p className="mt-4 text-xs leading-5 text-[#8A7B87]">
        Fitur analisis AI berbasis Hybrid RAG masih dalam
        tahap pengembangan.
      </p>
    </section>
  );
}