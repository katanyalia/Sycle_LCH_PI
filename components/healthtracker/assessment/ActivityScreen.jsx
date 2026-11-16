"use client";

import { Activity } from "lucide-react";
import QuestionRenderer from "./shared/QuestionRenderer";

export default function ActivityScreen({
  question,
  answers,
  scores,
  updateAnswer,
  updateScore,
}) {
  return (
    <section className="space-y-6">
      {/* SECTION HEADER */}
      <div>
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[#F8E8EF] px-3 py-1.5 text-xs font-extrabold tracking-wide text-[#8E3E5E]">
          <Activity size={14} />
          TAHAP 01 · AKTIVITAS
        </div>

        <h2 className="text-xl font-extrabold tracking-tight text-[#332A35] sm:text-2xl">
          Aktivitas hari ini
        </h2>

        <p className="mt-2 max-w-2xl text-sm leading-7 text-[#746875] sm:text-base">
          Ceritakan aktivitas yang paling menggambarkan
          keseharianmu hari ini. Pilih jawaban yang paling
          sesuai dengan kegiatanmu.
        </p>
      </div>

      {/* ACTIVITY CARDS */}
      {question ? (
        <QuestionRenderer
          question={question}
          answers={answers}
          scores={scores}
          updateAnswer={updateAnswer}
          updateScore={updateScore}
        />
      ) : (
        <div
          role="alert"
          className="rounded-2xl border border-red-200 bg-red-50 p-4 text-sm leading-6 text-red-700"
        >
          Pertanyaan aktivitas tidak ditemukan. Silakan
          periksa kembali konfigurasi pertanyaan HT-04.
        </div>
      )}
    </section>
  );
}