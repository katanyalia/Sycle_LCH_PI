"use client";

import { useState } from "react";
import SpecialAnswerOption from "./SpecialAnswerOption";
import MenstruasiRenderer from "./MenstruasiRenderer";

import {
  Heart,
  Activity,
  Moon,
  Sun,
  Droplets,
  Utensils,
  Smile,
  Frown,
  Meh,
  Baby,
  CalendarDays,
  Thermometer,
  Footprints,
  Sparkles,
  House,
  Car,
  CheckCircle2,
  Clock,
} from "lucide-react";

import {
  HEALTH_TRACKER_SCALE,
  getHealthTrackerQuestion,
} from "@/data/healthTrackerQuestions";

import {
  getLabel,
  getValue,
} from "@/lib/healthtracker/questionHelpers";

const OPTION_LABEL_CLASS = "text-sm font-semibold leading-relaxed";

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

function getActivityVisual(label) {
  const normalized = label.toLowerCase();

  if (normalized.includes("dalam ruangan")) {
    return {
      Icon: House,
      description: "Beraktivitas di dalam ruangan",
      animation: "activity-float",
      color: "bg-[#F8E8EF]",
      iconColor: "text-[#B84E73]",
      border: "border-[#F0D3DF]",
    };
  }

  if (normalized.includes("luar ruangan")) {
    return {
      Icon: Sun,
      description: "Beraktivitas di luar ruangan",
      animation: "activity-sun",
      color: "bg-[#E9F2EA]",
      iconColor: "text-[#64866B]",
      border: "border-[#D7E6D9]",
    };
  }

  if (normalized.includes("berpindah")) {
    return {
      Icon: Footprints,
      description: "Beraktivitas di beberapa lokasi",
      animation: "activity-walk",
      color: "bg-[#EEEAF8]",
      iconColor: "text-[#8272A8]",
      border: "border-[#DDD5EF]",
    };
  }

  if (normalized.includes("perjalanan")) {
    return {
      Icon: Car,
      description: "Beraktivitas selama perjalanan",
      animation: "activity-drive",
      color: "bg-[#E8F1F7]",
      iconColor: "text-[#6489A5]",
      border: "border-[#D4E4EF]",
    };
  }

  return {
    Icon: Activity,
    description: "Aktivitas hari ini",
    animation: "",
    color: "bg-[#F8F5F7]",
    iconColor: "text-[#746875]",
    border: "border-[#EAE2E7]",
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

function HT02Renderer({ question, answers, scores, updateAnswer, updateScore }) {
  const NO_SYMPTOMS = "tidak_ada_yang_ingin_dicatat";

  const symptoms = question.options.filter(
    (option) => option.value !== NO_SYMPTOMS
  );

  const selectedValues = Array.isArray(answers?.["HT-02"])
    ? answers["HT-02"]
    : [];

  const hasNoSymptoms = selectedValues.includes(NO_SYMPTOMS);

  const [showSymptoms, setShowSymptoms] = useState(
    selectedValues.some((value) => value !== NO_SYMPTOMS)
  );

  function handleSelectSymptoms() {
    if (hasNoSymptoms) {
      updateAnswer?.("HT-02", []);
    }

    setShowSymptoms(true);
  }

  function handleNoSymptoms() {
    updateAnswer?.("HT-02", [NO_SYMPTOMS]);

    symptoms.forEach((symptom) => {
      updateScore?.(symptom.value, null);
    });

    setShowSymptoms(false);
  }

  function handleScore(symptomValue, score) {
    const nextValues = [
      ...selectedValues.filter(
        (value) => value !== NO_SYMPTOMS && value !== symptomValue
      ),
      symptomValue,
    ];

    updateAnswer?.("HT-02", nextValues);
    updateScore?.(symptomValue, score);
  }

  return (
    <div className="space-y-4">
      {/* Pilihan kondisi awal */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <button
          type="button"
          onClick={handleSelectSymptoms}
          aria-pressed={showSymptoms && !hasNoSymptoms}
          className={`rounded-xl border p-4 text-left transition-all ${
            showSymptoms && !hasNoSymptoms
              ? "border-[#B84E73] bg-[#F8E8EF] text-[#8E3E5E]"
              : "border-[#F0E3E9] bg-white text-[#332A35] hover:border-[#D9A5B8]"
          }`}
        >
          <span className="block font-bold">Ada Gejala</span>
          <span className="mt-1 block text-xs text-[#746875]">
            Saya merasakan gejala tertentu.
          </span>
        </button>

        <button
          type="button"
          onClick={handleNoSymptoms}
          aria-pressed={hasNoSymptoms}
          className={`rounded-xl border p-4 text-left transition-all ${
            hasNoSymptoms
              ? "border-[#8EAA91] bg-[#E9F2EA] text-[#477454]"
              : "border-[#F0E3E9] bg-white text-[#332A35] hover:border-[#B8CEBB]"
          }`}
        >
          <span className="block font-bold">Tidak Ada Gejala</span>
          <span className="mt-1 block text-xs text-[#746875]">
            Saya tidak merasakan gejala.
          </span>
        </button>
      </div>

      {/* Daftar gejala dan skala */}
      {showSymptoms && !hasNoSymptoms && (
        <div className="space-y-4">
          {/* Panduan skala khusus HT-02 */}
          <div className="rounded-xl bg-[#FFF8FB] p-3 sm:p-4">
            <p className="mb-3 text-xs font-bold text-[#8E3E5E]">
              Panduan skala gangguan aktivitas
            </p>

            <div className="grid grid-cols-2 gap-2 sm:grid-cols-5">
              {HEALTH_TRACKER_SCALE.map((item) => (
                <div
                  key={item.value}
                  className="flex items-start gap-2 rounded-lg bg-white px-2 py-2"
                >
                  <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-[#F8E8EF] text-xs font-bold text-[#B84E73]">
                    {item.value}
                  </span>

                  <span className="pt-0.5 text-[11px] leading-4 text-[#746875]">
                    {item.label}
                  </span>
                </div>
              ))}
            </div>

            <p className="mt-3 text-[11px] leading-relaxed text-[#8A7D89]">
              Nilai 0 berarti keluhan tidak mengganggu aktivitas,
              sedangkan nilai 4 berarti keluhan sangat mengganggu
              aktivitas. Skala ini bukan ukuran keparahan penyakit
              atau diagnosis.
            </p>
          </div>

          {/* Setiap gejala satu baris */}
          <div className="divide-y divide-[#F0E3E9]">
            {symptoms.map((symptom) => {
              const isSelected = selectedValues.includes(symptom.value);
              const selectedScore = scores?.[symptom.value];

              return (
                <div
                  key={symptom.value}
                  className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3 py-4"
                >
                  <span className="text-sm font-medium leading-relaxed text-[#332A35]">
                    {symptom.label}
                  </span>

                  <div
                    role="radiogroup"
                    aria-label={`Tingkat gangguan ${symptom.label}`}
                    className="flex items-center gap-2 sm:gap-3"
                  >
                    {HEALTH_TRACKER_SCALE.map((scaleOption) => {
                      const checked =
                        isSelected &&
                        Number(selectedScore) === Number(scaleOption.value);

                      return (
                        <label
                          key={scaleOption.value}
                          className="flex min-w-5 cursor-pointer flex-col items-center gap-1.5"
                          title={scaleOption.label}
                        >
                          <input
                            type="radio"
                            name={`HT-02-${symptom.value}`}
                            value={scaleOption.value}
                            checked={checked}
                            onChange={() =>
                              handleScore(
                                symptom.value,
                                Number(scaleOption.value)
                              )
                            }
                            className="size-4 cursor-pointer accent-[#B84E73]"
                            aria-label={`${scaleOption.value} - ${scaleOption.label}`}
                          />
                          <span className="text-xs font-semibold text-[#746875]">
                            {scaleOption.value}
                          </span>
                        </label>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>

          <p className="text-xs leading-relaxed text-[#746875]">
            Nilai 0 berarti gejala tidak mengganggu aktivitas, bukan berarti
            kamu tidak mengalami gejala tersebut.
          </p>
        </div>
      )}
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

  const value = answers?.[question.code];

  // HM-02: Hari keberapa menstruasi
  if (question.code === "HM-02") {
    return (
      <MenstruasiRenderer
        value={value}
        updateAnswer={updateAnswer}
      />
    );
  }

  // HT-02 menggunakan tampilan khusus.
  if (question.code === "HT-02") {
    return (
      <HT02Renderer
        question={question}
        answers={answers}
        scores={scores}
        updateAnswer={updateAnswer}
        updateScore={updateScore}
      />
    );
  }

  // HT-03 hanya digunakan sebagai konfigurasi skala.
  // Tidak ditampilkan sebagai kartu pertanyaan tersendiri.
  if (question.code === "HT-03") {
    return null;
  }

  // HK-01: Situasi selama kehamilan dengan skala aktivitas
  if (question.code === "HK-01") {
    const options = question.options ?? [];

    const isNoneOption = (option) => {
      const optionValue = String(getValue(option)).toLowerCase();
      const label = String(getLabel(option)).toLowerCase();

      return (
        ["tidak_ada", "tidak_ada_situasi"].includes(optionValue) ||
        label === "tidak ada"
      );
    };

    const isOtherOption = (option) => {
      const optionValue = String(getValue(option)).toLowerCase();
      const label = String(getLabel(option)).toLowerCase();

      return optionValue === "lainnya" || label === "lainnya";
    };

    const noneOption = options.find(isNoneOption);
    const noneValue = noneOption ? getValue(noneOption) : "tidak_ada";

    const situations = options.filter(
      (option) => !isNoneOption(option) && !isOtherOption(option)
    );

    const selectedValues = Array.isArray(value) ? value : [];
    const hasNoSituation = selectedValues.includes(noneValue);

    const handleNoSituation = (checked) => {
      if (checked) {
        situations.forEach((option) => {
          updateScore?.(getValue(option), null);
        });

        updateAnswer(question.code, [noneValue]);
      } else {
        updateAnswer(question.code, []);
      }
    };

    const handleSituationScore = (optionValue, score) => {
      const nextValues = [
        ...selectedValues.filter(
          (item) => item !== noneValue && item !== optionValue
        ),
        optionValue,
      ];

      updateAnswer(question.code, nextValues);
      updateScore?.(optionValue, score);
    };

    return (
      <div className="space-y-4">
        {/* Panduan skala */}
        <div className="rounded-xl bg-[#FFF8FB] p-3 sm:p-4">
          <p className="mb-3 text-xs font-bold text-[#8E3E5E]">
            Panduan skala gangguan aktivitas
          </p>

          <div className="grid grid-cols-2 gap-2 sm:grid-cols-5">
            {HEALTH_TRACKER_SCALE.map((item) => (
              <div
                key={item.value}
                className="flex items-start gap-2 rounded-lg bg-white px-2 py-2"
              >
                <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-[#F8E8EF] text-xs font-bold text-[#B84E73]">
                  {item.value}
                </span>

                <span className="pt-0.5 text-[11px] leading-4 text-[#746875]">
                  {item.label}
                </span>
              </div>
            ))}
          </div>

          <p className="mt-3 text-[11px] leading-relaxed text-[#8A7D89]">
            Nilai 0 berarti situasi tidak mengganggu aktivitas,
            sedangkan nilai 4 berarti situasi sangat mengganggu
            aktivitas. Skala ini bukan ukuran keparahan penyakit
            atau diagnosis.
          </p>
        </div>

        {/* Daftar situasi dan radio button */}
        <div className="divide-y divide-[#F0E3E9]">
          {situations.map((option) => {
            const optionValue = getValue(option);
            const label = getLabel(option);
            const isSelected = selectedValues.includes(optionValue);
            const selectedScore = scores?.[optionValue];

            return (
              <div
                key={optionValue}
                className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3 py-4"
              >
                <span className="text-sm font-medium leading-relaxed text-[#332A35]">
                  {label}
                </span>

                <div
                  role="radiogroup"
                  aria-label={`Tingkat gangguan ${label}`}
                  className="flex items-center gap-2 sm:gap-3"
                >
                  {HEALTH_TRACKER_SCALE.map((scaleOption) => {
                    const checked =
                      isSelected &&
                      Number(selectedScore) === Number(scaleOption.value);

                    return (
                      <label
                        key={scaleOption.value}
                        className="flex min-w-5 cursor-pointer flex-col items-center gap-1.5"
                        title={scaleOption.label}
                      >
                        <input
                          type="radio"
                          name={`HK-01-${optionValue}`}
                          value={scaleOption.value}
                          checked={checked}
                          onChange={() =>
                            handleSituationScore(
                              optionValue,
                              Number(scaleOption.value)
                            )
                          }
                          className="size-4 cursor-pointer accent-[#B84E73]"
                          aria-label={`${scaleOption.value} - ${scaleOption.label}`}
                        />

                        <span className="text-xs font-semibold text-[#746875]">
                          {scaleOption.value}
                        </span>
                      </label>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>

        <SpecialAnswerOption
          label="Tidak ada"
          description="Saya tidak mengalami situasi tersebut hari ini."
          checked={hasNoSituation}
          onChange={handleNoSituation}
        />
      </div>
    );
  }

  // HM-04 dan HM-06: pilihan kartu + checkbox
  if (["HM-04", "HM-06"].includes(question.code)) {
    const skipValue = "tidak_ingin_menjawab";

    const options = question.options?.filter(
      (option) => getValue(option) !== skipValue
    ) ?? [];

    const skipSelected = value === skipValue;

    return (
      <div className="space-y-5">
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          {options.map((option) => {
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
                className={`flex min-h-[64px] w-full items-center justify-between rounded-2xl border px-5 py-4 text-left transition-all duration-200 ${
                  selected
                    ? "border-[#B84E73] bg-[#F8E8EF] shadow-sm ring-2 ring-[#B84E73]/15"
                    : "border-[#EADDE3] bg-white hover:border-[#D9A5B8] hover:bg-[#FFF8FB]"
                }`}
              >
                <span
                  className={`text-sm font-bold leading-relaxed ${
                    selected
                      ? "text-[#8E3E5E]"
                      : "text-[#5F5360]"
                  }`}
                >
                  {label}
                </span>

                {selected && (
                  <CheckCircle2
                    size={20}
                    className="shrink-0 text-[#B84E73]"
                  />
                )}
              </button>
            );
          })}
        </div>

        <SpecialAnswerOption
          label="Tidak ingin menjawab"
          description="Saya memilih untuk tidak menjawab pertanyaan ini."
          checked={skipSelected}
          onChange={(checked) =>
            updateAnswer(
              question.code,
              checked ? skipValue : null
            )
          }
        />
      </div>
    );
  }

  // HM-03: Jumlah darah menstruasi
  if (question.code === "HM-03") {
    const skipValue = "tidak_ingin_menjawab";

    const options = question.options?.filter(
      (option) => getValue(option) !== skipValue
    ) ?? [];

    const skipSelected = value === skipValue;

    return (
      <div className="space-y-5">
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          {options.map((option) => {
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
                className={`flex min-h-[64px] w-full items-center justify-between rounded-2xl border px-5 py-4 text-left transition-all duration-200 ${
                  selected
                    ? "border-[#B84E73] bg-[#F8E8EF] shadow-sm ring-2 ring-[#B84E73]/15"
                    : "border-[#EADDE3] bg-white hover:border-[#D9A5B8] hover:bg-[#FFF8FB]"
                }`}
              >
                <span
                  className={`text-sm font-bold leading-relaxed ${
                    selected
                      ? "text-[#8E3E5E]"
                      : "text-[#5F5360]"
                  }`}
                >
                  {label}
                </span>

                {selected && (
                  <CheckCircle2
                    size={20}
                    className="shrink-0 text-[#B84E73]"
                  />
                )}
              </button>
            );
          })}
        </div>

        <SpecialAnswerOption
          label="Tidak ingin menjawab"
          description="Saya memilih untuk tidak menjawab pertanyaan ini."
          checked={skipSelected}
          onChange={(checked) =>
            updateAnswer(
              question.code,
              checked ? skipValue : null
            )
          }
        />
      </div>
    );
  }

  // HS-01 dan HS-02: Ya/Tidak + checkbox
  if (["HS-01", "HS-02"].includes(question.code)) {
    const skipValue = "tidak_ingin_menjawab";

    const options = question.options?.filter(
      (option) => getValue(option) !== skipValue
    ) ?? [];

    const skipSelected = value === skipValue;

    return (
      <div className="space-y-5">
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          {options.map((option) => {
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
                className={`flex min-h-[64px] w-full items-center justify-between rounded-2xl border px-5 py-4 text-left transition-all ${
                  selected
                    ? "border-[#B84E73] bg-[#F8E8EF] shadow-sm ring-2 ring-[#B84E73]/15"
                    : "border-[#EADDE3] bg-white hover:border-[#D9A5B8] hover:bg-[#FFF8FB]"
                }`}
              >
                <span
                  className={`text-sm font-bold leading-relaxed ${
                    selected
                      ? "text-[#8E3E5E]"
                      : "text-[#5F5360]"
                  }`}
                >
                  {label}
                </span>

                {selected && (
                  <CheckCircle2
                    size={20}
                    className="shrink-0 text-[#B84E73]"
                  />
                )}
              </button>
            );
          })}
        </div>

        <SpecialAnswerOption
          label="Tidak ingin menjawab"
          description="Saya memilih untuk tidak menjawab pertanyaan ini."
          checked={skipSelected}
          onChange={(checked) =>
            updateAnswer(
              question.code,
              checked ? skipValue : null
            )
          }
        />
      </div>
    );
  }

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
                  onClick={() => updateAnswer(question.code, optionValue)}
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
                      size={32}
                      strokeWidth={1.8}
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

    // HT-01: Kartu kenyamanan tubuh
    if (question.code === "HT-01") {
      const skipValue = "tidak_ingin_menjawab";

      const comfortOptions = question.options?.filter(
        (option) => getValue(option) !== skipValue
      ) ?? [];

      const skipSelected = value === skipValue;

      return (
        <div className="space-y-5">
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            {comfortOptions.map((option) => {
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
                  className={`flex min-h-[64px] w-full items-center justify-between rounded-2xl border px-5 py-4 text-left transition-all duration-200 ${
                    selected
                      ? "border-[#B84E73] bg-[#F8E8EF] shadow-sm ring-2 ring-[#B84E73]/15"
                      : "border-[#EADDE3] bg-white hover:border-[#D9A5B8] hover:bg-[#FFF8FB]"
                  }`}
                >
                  <span
                    className={`text-sm font-bold leading-relaxed ${
                      selected ? "text-[#8E3E5E]" : "text-[#5F5360]"
                    }`}
                  >
                    {label}
                  </span>

                  {selected && (
                    <CheckCircle2
                      size={20}
                      className="shrink-0 text-[#B84E73]"
                    />
                  )}
                </button>
              );
            })}
          </div>

          <SpecialAnswerOption
            label="Tidak ingin menjawab"
            description="Saya memilih untuk tidak menjawab pertanyaan ini."
            checked={skipSelected}
            onChange={(checked) =>
              updateAnswer(
                question.code,
                checked ? skipValue : null
              )
            }
          />
        </div>
      );
    }

    // HT-05: Durasi berada di luar ruangan
    if (question.code === "HT-05") {
      const skipValue = "tidak_yakin";

      const durationOptions = question.options?.filter(
        (option) => getValue(option) !== skipValue
      ) ?? [];

      const skipSelected = value === skipValue;

      return (
        <div className="space-y-5">
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            {durationOptions.map((option) => {
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
                  className={`flex min-h-[64px] w-full items-center justify-between rounded-2xl border px-5 py-4 text-left transition-all duration-200 ${
                    selected
                      ? "border-[#B84E73] bg-[#F8E8EF] shadow-sm ring-2 ring-[#B84E73]/15"
                      : "border-[#EADDE3] bg-white hover:border-[#D9A5B8] hover:bg-[#FFF8FB]"
                  }`}
                >
                  <span
                    className={`text-sm font-bold leading-relaxed ${
                      selected
                        ? "text-[#8E3E5E]"
                        : "text-[#5F5360]"
                    }`}
                  >
                    {label}
                  </span>

                  {selected && (
                    <CheckCircle2
                      size={20}
                      className="shrink-0 text-[#B84E73]"
                    />
                  )}
                </button>
              );
            })}
          </div>

          <SpecialAnswerOption
            label="Tidak yakin"
            description="Saya tidak yakin berapa lama berada di luar ruangan hari ini."
            checked={skipSelected}
            onChange={(checked) =>
              updateAnswer(
                question.code,
                checked ? skipValue : null
              )
            }
          />
        </div>
      );
    }

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
                {(() => {
                const icons = [
                  Heart,
                  Activity,
                  Moon,
                  Sun,
                  Smile,
                  Sparkles,
                ];

                const Icon = icons[question.options.indexOf(option)] || Heart;

                return <Icon size={28} className="text-[#B84E73]" />;
              })()}
              </span>

              <span
                className={`flex-1 text-sm font-bold leading-relaxed ${
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

  if (question.code === "HS-04") {
    const selectedValues = Array.isArray(value) ? value : [];

    const noneOption = question.options?.find((option) => {
      const optionValue = getValue(option);
      const label = getLabel(option).toLowerCase();

      return (
        ["tidak_ada", "tidak_ada_kondisi"].includes(optionValue) ||
        label === "tidak ada"
      );
    });

    const noneValue = noneOption ? getValue(noneOption) : "tidak_ada";

    const options = (question.options ?? []).filter((option) => {
      const label = getLabel(option).toLowerCase();
      const optionValue = getValue(option);

      return (
        label !== "lainnya" &&
        optionValue !== "lainnya" &&
        optionValue !== noneValue
      );
    });

    const noneSelected = selectedValues.includes(noneValue);

    const toggleOption = (optionValue, checked) => {
      if (checked) {
        updateAnswer(
          question.code,
          [...selectedValues.filter((item) => item !== noneValue), optionValue]
        );
      } else {
        updateAnswer(
          question.code,
          selectedValues.filter((item) => item !== optionValue)
        );
      }
    };

    return (
      <div className="space-y-3">
        <div className="space-y-2">
          {options.map((option) => {
            const optionValue = getValue(option);
            const label = getLabel(option);
            const checked = selectedValues.includes(optionValue);

            return (
              <label
                key={optionValue}
                className={`flex cursor-pointer items-center gap-3 rounded-2xl border p-4 transition-all ${
                  checked
                    ? "border-[#B84E73] bg-[#F8E8EF]"
                    : "border-[#EADDE3] bg-white hover:border-[#D9A5B8]"
                }`}
              >
                <input
                  type="checkbox"
                  checked={checked}
                  onChange={(event) =>
                    toggleOption(optionValue, event.target.checked)
                  }
                  className="size-4 shrink-0 cursor-pointer accent-[#B84E73]"
                />
                <span className="text-sm font-bold text-[#332A35]">
                  {label}
                </span>
              </label>
            );
          })}
        </div>
        <SpecialAnswerOption
          label="Tidak ada"
          description="Saya tidak mengalami kondisi tersebut hari ini."
          checked={noneSelected}
          onChange={(checked) =>
            updateAnswer(
              question.code,
              checked ? [noneValue] : []
            )
          }
        />
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