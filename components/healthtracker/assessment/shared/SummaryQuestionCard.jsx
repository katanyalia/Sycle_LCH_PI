"use client";

import {
  Card,
  CardContent,
} from "@/components/ui/card";

import {
  getSummaryQuestionData,
} from "../utils/healthTrackerSummary";

export default function SummaryQuestionCard({
  question,
  answers,
  scores,
  condition,
}) {
  const summary = getSummaryQuestionData(
    question,
    answers,
    scores,
    condition
  );

  if (!summary || !summary.isAnswered) return null;

  const {
    answerLabel,
    hasOther,
    otherText,
    scoredOptions,
  } = summary;

  return (
    <Card className="rounded-xl border border-[#F0E3E9] bg-white py-0 shadow-none">
      <CardContent className="p-4">
        <p className="mt-1 text-sm font-semibold text-[#332A35]">
          {question.question}
        </p>

        <p className="mt-2 text-sm leading-6 text-[#5F5360]">
          {answerLabel}
        </p>

        {/* Keterangan Lainnya */}
        {hasOther && (
          <div className="mt-3 rounded-xl bg-[#FFF8FB] p-3">
            <p className="text-xs font-semibold text-[#8E3E5E]">
              Keterangan lainnya
            </p>

            <p className="mt-1 text-sm text-[#5F5360]">
              {otherText}
            </p>
          </div>
        )}

        {/* Tingkat gangguan per pilihan */}
        {scoredOptions.length > 0 && (
          <div className="mt-4 border-t border-[#F0E3E9] pt-4">
            <p className="mb-3 text-xs font-bold uppercase tracking-wide text-[#8E3E5E]">
              Tingkat gangguan
            </p>

            <div className="space-y-3">
              {scoredOptions.map((option) => (
                <div
                  key={option.code}
                  className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between"
                >
                  <span className="text-sm text-[#5F5360]">
                    {option.label}
                  </span>

                  <span
                    className={`text-sm font-semibold ${
                      option.scoreAnswered
                        ? "text-[#8E3E5E]"
                        : "text-[#9A8E99]"
                    }`}
                  >
                    {option.scoreLabel}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}