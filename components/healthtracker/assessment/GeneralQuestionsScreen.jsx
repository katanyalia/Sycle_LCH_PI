"use client";

import { ClipboardList } from "lucide-react";
import QuestionRenderer from "./shared/QuestionRenderer";

const SCALE_GUIDANCE = [
  { value: 0, label: "Tidak mengganggu" },
  { value: 1, label: "Sedikit mengganggu" },
  { value: 2, label: "Cukup mengganggu" },
  { value: 3, label: "Sangat mengganggu" },
  { value: 4, label: "Amat sangat mengganggu" },
];

export default function GeneralQuestionsScreen({
  questions = [],
  answers,
  scores,
  updateAnswer,
  updateScore,
}) {
  // HT-03 tetap digunakan untuk konfigurasi skala,
  // tetapi tidak ditampilkan sebagai kartu pertanyaan.
  const visibleQuestions = questions.filter(
    (question) => question.code !== "HT-03"
  );

  return (
    <section className="space-y-6">
      {/* Header */}
      <div>
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[#F8E8EF] px-3 py-1.5 text-xs font-extrabold tracking-wide text-[#8E3E5E]">
          <ClipboardList size={14} />
          TAHAP 03 · PERTANYAAN UMUM
        </div>

        <h2 className="text-xl font-extrabold tracking-tight text-[#332A35] sm:text-2xl">
          Bagaimana kondisi tubuhmu hari ini?
        </h2>

        <p className="mt-2 max-w-2xl text-sm leading-7 text-[#746875] sm:text-base">
          Ceritakan pengalaman dan perubahan yang kamu rasakan
          melalui pertanyaan berikut. Jawab sesuai dengan
          kondisi tubuhmu hari ini.
        </p>
      </div>

      {/* Daftar pertanyaan */}
      {visibleQuestions.length > 0 && (
        <div className="space-y-5">
          {visibleQuestions.map((question, index) => (
            <article
              key={question.code}
              className="rounded-2xl border border-[#F0E3E9] bg-white p-4 shadow-[0_5px_24px_rgb(120_70_90_/_4%)] transition-shadow duration-300 hover:shadow-[0_8px_24px_rgb(120_70_90_/_7%)] sm:p-6"
            >
              <div className="mb-4 flex items-start gap-3">
                <div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-[#F8E8EF] text-sm font-bold text-[#B84E73]">
                  {index + 1}
                </div>

                <div className="min-w-0 flex-1">
                  <h3 className="pt-1 text-base font-bold leading-relaxed text-[#332A35]">
                    {question.question}
                  </h3>
                </div>
              </div>

              <div className="sm:pl-11">
                <QuestionRenderer
                  question={question}
                  answers={answers}
                  scores={scores}
                  updateAnswer={updateAnswer}
                  updateScore={updateScore}
                />
              </div>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}