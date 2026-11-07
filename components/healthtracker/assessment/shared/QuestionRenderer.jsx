"use client";

import {
  Heart,
  Activity,
  Moon,
  Sun,
  Droplets,
  Utensils,
  Smile,
  Frown,
  Baby,
  CalendarDays,
  Thermometer,
  Footprints,
  Sparkles,
  House,
  Car,
  CheckCircle2,
} from "lucide-react";

import {
  HEALTH_TRACKER_SCALE,
  getHealthTrackerQuestion,
} from "@/data/healthTrackerQuestions";

import {
  getLabel,
  getValue,
} from "@/lib/healthtracker/questionHelpers";

// Ikon pilihan jawaban
function getOptionIcon(label = "") {
  const text = String(label).toLowerCase();

  let Icon = Sparkles;

  if (/haid|menstruasi|siklus/.test(text)) Icon = CalendarDays;
  else if (/hamil|kehamilan/.test(text)) Icon = Baby;
  else if (/menyusui|asi/.test(text)) Icon = Heart;
  else if (/nyeri|sakit|kram/.test(text)) Icon = Activity;
  else if (/lelah|capek|letih|tidur/.test(text)) Icon = Moon;
  else if (/panas|demam|suhu/.test(text)) Icon = Thermometer;
  else if (/darah|flek/.test(text)) Icon = Droplets;
  else if (/makan|minum/.test(text)) Icon = Utensils;
  else if (/jalan|bergerak|aktivitas/.test(text)) Icon = Footprints;
  else if (/matahari|luar ruangan/.test(text)) Icon = Sun;
  else if (/nyaman|baik|normal/.test(text)) Icon = Smile;
  else if (/cemas|sedih|stres/.test(text)) Icon = Frown;

  return <Icon size={24} strokeWidth={1.8} color="#B84E73" />;
}

function getActivityVisual(label = "") {
  const text = String(label).toLowerCase();

  if (/dalam ruangan|indoor/.test(text)) {
    return {
      Icon: House,
      description: "Beraktivitas di dalam ruangan",
      animation: "activity-float",
    };
  }

  if (/luar ruangan|outdoor/.test(text)) {
    return {
      Icon: Sun,
      description: "Beraktivitas di luar ruangan",
      animation: "activity-sun",
    };
  }

  if (/berpindah|moving/.test(text)) {
    return {
      Icon: Footprints,
      description: "Beraktivitas di beberapa lokasi",
      animation: "activity-walk",
    };
  }

  if (/perjalanan|travel/.test(text)) {
    return {
      Icon: Car,
      description: "Beraktivitas selama perjalanan",
      animation: "activity-drive",
    };
  }

  return {
    Icon: Sparkles,
    description: "Pilih aktivitas yang sesuai",
    animation: "activity-float",
  };
}

// Pilihan skala 0–4
function ScaleOptions({ value, onChange }) {
  return (
    <div className="grid grid-cols-1 gap-2 sm:grid-cols-5">
      {HEALTH_TRACKER_SCALE.map((option) => {
        const optionValue =
          typeof option === "object" ? getValue(option) : option;

        const label = getLabel(option);
        const selected = String(value) === String(optionValue);

        return (
          <button
            key={optionValue}
            type="button"
            onClick={() => onChange(Number(optionValue))}
            aria-pressed={selected}
            className={`rounded-xl border px-3 py-3 text-sm font-semibold transition ${
              selected
                ? "border-[#B84E73] bg-[#F8E8EF] text-[#8E3E5E]"
                : "border-[#EADDE3] bg-white text-[#5F5360] hover:border-[#B84E73]"
            }`}
          >
            {label}
          </button>
        );
      })}
    </div>
  );
}

// Renderer pertanyaan Health Tracker
export default function QuestionRenderer({
  question,
  answers = {},
  scores = {},
  updateAnswer,
  updateScore,
}) {
  if (!question) return null;

  const value = answers[question.code];

  // SINGLE
  if (question.type === "single") {
    // Tampilan khusus untuk pilihan aktivitas HT-04
    if (question.code === "HT-04") {
      return (
        <>
          <div className="grid grid-cols-2 gap-3 sm:gap-4">
            {question.options?.map((option) => {
              const optionValue = getValue(option);
              const label = getLabel(option);
              const selected = value === optionValue;

              const visual = getActivityVisual(label);
              const Icon = visual.Icon;

              return (
                <button
                  key={optionValue}
                  type="button"
                  onClick={() =>
                    updateAnswer(question.code, optionValue)
                  }
                  aria-pressed={selected}
                  className={`group relative flex min-h-[170px] flex-col items-center justify-center overflow-hidden rounded-2xl border p-4 text-center transition-all duration-300 hover:-translate-y-1 hover:shadow-lg active:scale-[0.97] ${
                    selected
                      ? "border-[#B84E73] bg-[#F8E8EF] shadow-md ring-2 ring-[#B84E73]/20"
                      : "border-[#EADDE3] bg-white hover:border-[#D99AAF] hover:bg-[#FFF8FB]"
                  }`}
                >
                  {/* Ikon animasi */}
                  <span
                    className={`mb-4 flex h-16 w-16 items-center justify-center rounded-2xl transition-colors duration-300 ${
                      selected
                        ? "bg-white text-[#B84E73]"
                        : "bg-[#FFF8FB] text-[#B84E73]"
                    }`}
                  >
                    <Icon
                      size={34}
                      strokeWidth={1.7}
                      className={visual.animation}
                    />
                  </span>

                  {/* Judul pilihan */}
                  <span
                    className={`text-sm font-extrabold sm:text-base ${
                      selected
                        ? "text-[#8E3E5E]"
                        : "text-[#5F5360]"
                    }`}
                  >
                    {label}
                  </span>

                  {/* Deskripsi */}
                  <span className="mt-2 text-xs leading-5 text-[#8A7B87]">
                    {visual.description}
                  </span>

                  {/* Indikator pilihan */}
                  <span className="absolute right-3 top-3">
                    {selected ? (
                      <CheckCircle2
                        size={21}
                        className="text-[#B84E73]"
                      />
                    ) : (
                      <span className="block h-5 w-5 rounded-full border border-[#EADDE3]" />
                    )}
                  </span>
                </button>
              );
            })}
          </div>

          <style jsx>{`
            .activity-float {
              animation: float 3s ease-in-out infinite;
            }

            .activity-sun {
              animation: rotate 12s linear infinite;
            }

            .activity-walk {
              animation: walk 1.2s ease-in-out infinite;
            }

            .activity-drive {
              animation: drive 2s ease-in-out infinite;
            }

            @keyframes float {
              0%, 100% {
                transform: translateY(0);
              }
              50% {
                transform: translateY(-7px);
              }
            }

            @keyframes rotate {
              from {
                transform: rotate(0deg);
              }
              to {
                transform: rotate(360deg);
              }
            }

            @keyframes walk {
              0%, 100% {
                transform: translateY(0) rotate(-8deg);
              }
              50% {
                transform: translateY(-6px) rotate(8deg);
              }
            }

            @keyframes drive {
              0%, 100% {
                transform: translateX(-3px);
              }
              50% {
                transform: translateX(3px);
              }
            }

            @media (prefers-reduced-motion: reduce) {
              .activity-float,
              .activity-sun,
              .activity-walk,
              .activity-drive {
                animation: none;
              }
            }
          `}</style>
        </>
      );
    }

    // SINGLE untuk pertanyaan lainnya tetap menggunakan tampilan lama
    return (
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        {question.options?.map((option) => {
          const optionValue = getValue(option);
          const label = getLabel(option);
          const selected = value === optionValue;

          return (
            <button
              key={optionValue}
              type="button"
              onClick={() =>
                updateAnswer(question.code, optionValue)
              }
              aria-pressed={selected}
              className={`group flex min-h-[88px] items-center gap-4 rounded-2xl border p-4 text-left transition-all duration-200 hover:-translate-y-1 hover:shadow-md active:scale-[0.98] ${
                selected
                  ? "border-[#B84E73] bg-[#F8E8EF] shadow-sm ring-2 ring-[#B84E73]/15"
                  : "border-[#EADDE3] bg-white hover:border-[#D99AAF]"
              }`}
            >
              <span
                className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl ${
                  selected ? "bg-white" : "bg-[#FFF8FB]"
                }`}
                aria-hidden="true"
              >
                {getOptionIcon(label)}
              </span>

              <span
                className={`flex-1 text-sm font-semibold ${
                  selected ? "text-[#8E3E5E]" : "text-[#5F5360]"
                }`}
              >
                {label}
              </span>

              <span
                className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full border text-xs ${
                  selected
                    ? "border-[#B84E73] bg-[#B84E73] text-white"
                    : "border-[#EADDE3] text-transparent"
                }`}
              >
                ✓
              </span>
            </button>
          );
        })}
      </div>
    );
  }

  // MULTIPLE + INLINE SCALE
  if (question.type === "multiple") {
    const selectedValues = Array.isArray(value) ? value : [];

    const hasInlineScale = [
      "HT-02",
      "HK-01",
    ].includes(question.code);

    const excludedOptions = [
      "lainnya",
      "tidak_ada",
      "tidak_ada_yang_ingin_dicatat",
    ];

    return (
      <div className="space-y-3">
        {question.options?.map((option) => {
          const optionValue = getValue(option);
          const label = getLabel(option);
          const selected = selectedValues.includes(optionValue);

          const showScale =
            selected &&
            hasInlineScale &&
            !excludedOptions.includes(optionValue);

          return (
            <div
              key={optionValue}
              className={`rounded-2xl border p-4 transition ${
                selected
                  ? "border-[#B84E73] bg-[#FFF8FB]"
                  : "border-[#EADDE3] bg-white"
              }`}
            >
              <label className="flex cursor-pointer items-center gap-4">
                <span
                  className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-[#FFF8FB]"
                  aria-hidden="true"
                >
                  {getOptionIcon(label)}
                </span>

                <span className="flex-1 text-sm font-semibold text-[#5F5360]">
                  {label}
                </span>

                <input
                  type="checkbox"
                  checked={selected}
                  onChange={(event) => {
                    const nextValues = event.target.checked
                      ? [...selectedValues, optionValue]
                      : selectedValues.filter(
                          (item) => item !== optionValue
                        );

                    updateAnswer(question.code, nextValues);
                  }}
                  className="h-5 w-5 shrink-0 cursor-pointer accent-[#B84E73]"
                />
              </label>

              {showScale && (
                <div className="mt-4 border-t border-[#EADDE3] pt-4">
                  <p className="mb-3 text-sm font-semibold text-[#8E3E5E]">
                    Seberapa mengganggu {label.toLowerCase()} yang kamu rasakan?
                  </p>

                  <ScaleOptions
                    value={scores[optionValue]}
                    onChange={(nextValue) =>
                      updateScore?.(optionValue, nextValue)
                    }
                  />
                </div>
              )}
            </div>
          );
        })}
      </div>
    );
  }

  // SCALE
  if (question.type === "scale") {
    return (
      <div className="rounded-2xl bg-[#FFF8FB] p-4">
        <ScaleOptions
          value={value}
          onChange={(nextValue) =>
            updateAnswer(question.code, nextValue)
          }
        />
      </div>
    );
  }

  // PER OPTION SCALE
  if (question.type === "per_option_scale") {
    const parentQuestion = getHealthTrackerQuestion(
      question.dependsOn
    );

    const selectedValues = Array.isArray(
      answers[question.dependsOn]
    )
      ? answers[question.dependsOn]
      : [];

    const excludedOptions = [
      "lainnya",
      "tidak_ada",
      "tidak_ada_yang_ingin_dicatat",
    ];

    const scoredOptions = selectedValues.filter(
      (optionCode) => !excludedOptions.includes(optionCode)
    );

    if (scoredOptions.length === 0) return null;

    return (
      <div className="space-y-4">
        <div>
          <h3 className="text-sm font-bold text-[#332A35]">
            Tingkat gangguan
          </h3>
          <p className="mt-1 text-sm text-[#8A7D89]">
            Pilih tingkat gangguan untuk setiap keluhan yang kamu pilih.
          </p>
        </div>

        {scoredOptions.map((optionCode) => {
          const selectedOption = parentQuestion?.options?.find(
            (option) => getValue(option) === optionCode
          );

          const optionLabel =
            getLabel(selectedOption) || optionCode;

          return (
            <div
              key={optionCode}
              className="rounded-2xl border border-[#EADDE3] bg-white p-4"
            >
              <p className="mb-3 text-sm font-bold text-[#8E3E5E]">
                {optionLabel}
              </p>

              <ScaleOptions
                value={scores[optionCode]}
                onChange={(nextValue) =>
                  updateScore?.(optionCode, nextValue)
                }
              />
            </div>
          );
        })}
      </div>
    );
  }

  return (
    <p className="text-sm text-[#8A7D89]">
      Tipe pertanyaan belum didukung: {question.type}
    </p>
  );
}