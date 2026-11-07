"use client";

import { ClipboardList } from "lucide-react";
import QuestionRenderer from "./shared/QuestionRenderer";

export default function GeneralQuestionsScreen({
  questions,
  answers,
  scores,
  updateAnswer,
  updateScore,
}) {
  return (
    <section className="space-y-6">
      <div>
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[#F8E8EF] px-3 py-1.5 text-xs font-bold tracking-wide text-[#8E3E5E]">
          <ClipboardList size={14} />
          PERTANYAAN UMUM
        </div>

        <h2 className="text-xl font-bold text-[#332A35]">
          Bagaimana kondisi tubuhmu hari ini?
        </h2>

        <p className="mt-2 text-sm leading-relaxed text-[#746875]">
          Ceritakan pengalaman dan perubahan yang kamu rasakan
          melalui pertanyaan berikut. Jawab sesuai dengan
          kondisi tubuhmu hari ini.
        </p>
      </div>

      {questions.length > 0 ? (
        <div className="space-y-5">
          {questions.map((question, index) => (
            <article
              key={question.code}
              className="rounded-2xl border border-[#F0E3E9] bg-white p-4 shadow-[0_5px_24px_rgb(120_70_90_/_4%)] transition-shadow duration-300 hover:shadow-[0_8px_24px_rgb(120_70_90_/_7%)] sm:p-6"
            >
              <div className="mb-4 flex items-start gap-3">
                <div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-[#F8E8EF] text-sm font-bold text-[#B84E73]">
                  {index + 1}
                </div>

                <h3 className="pt-1 text-base font-bold leading-relaxed text-[#332A35]">
                  {question.question}
                </h3>
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
      ) : null}
    </section>
  );
}