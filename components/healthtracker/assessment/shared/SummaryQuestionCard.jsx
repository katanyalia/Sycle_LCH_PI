"use client";

import {
  Card,
  CardContent,
} from "@/components/ui/card";

import { HEALTH_TRACKER_SCALE } from "@/data/healthTrackerQuestions";

import {
  getLabel,
  getValue,
  getInlineScaleQuestion,
  getAnswerLabel,
} from "../utils/healthTrackerSummary";

export default function SummaryQuestionCard({
  question,
  answers,
  scores,
  condition,
}) {
  if (!question || !answers) return null;

  const value = answers[question.code];

  const answerLabel =
  question.type === "scale"
    ? getLabel(
        HEALTH_TRACKER_SCALE.find(
          (option) =>
            String(getValue(option)) === String(value)
        )
      ) || "Belum diisi"
    : getAnswerLabel(question, answers);

  const isAnswered =
    Array.isArray(value)
      ? value.length > 0
      : value !== undefined && value !== null && value !== "";

  if (!isAnswered) return null;

  const otherTextKey = question.otherText?.key;

  const hasOther =
    otherTextKey &&
    Array.isArray(value) &&
    value.includes("lainnya");

  const scaleQuestion = getInlineScaleQuestion(
    question,
    condition
  );

  const scoredOptions =
    scaleQuestion && Array.isArray(value)
      ? value.filter(
          (optionCode) =>
            ![
              "lainnya",
              "tidak_ada",
              "tidak_ada_yang_ingin_dicatat",
            ].includes(optionCode)
        )
      : [];

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
              {answers[otherTextKey] || "Belum diisi"}
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
              {scoredOptions.map((optionCode) => {
                const selectedOption = question.options?.find(
                  (option) => getValue(option) === optionCode
                );

                const optionLabel =
                  getLabel(selectedOption) || optionCode;

                const score = scores?.[optionCode];

                const scaleOption = HEALTH_TRACKER_SCALE.find(
                  (option) =>
                    String(getValue(option)) === String(score)
                );

                const scoreLabel =
                  score !== undefined &&
                  score !== null &&
                  score !== ""
                    ? getLabel(scaleOption) || `Skor ${score}`
                    : "Belum diisi";

                return (
                  <div
                    key={optionCode}
                    className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between"
                  >
                    <span className="text-sm text-[#5F5360]">
                      {optionLabel}
                    </span>

                    <span
                      className={`text-sm font-semibold ${
                        score !== undefined &&
                        score !== null &&
                        score !== ""
                          ? "text-[#8E3E5E]"
                          : "text-[#9A8E99]"
                      }`}
                    >
                      {scoreLabel}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}