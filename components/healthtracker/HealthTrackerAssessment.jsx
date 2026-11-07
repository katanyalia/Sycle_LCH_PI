"use client";

import { useMemo } from "react";
import { useRouter } from "next/navigation";
import { useAssessment } from "@/context/AssessmentContext";

import ActivityScreen from "./assessment/ActivityScreen";
import ConditionScreen from "./assessment/ConditionScreen";
import FollowUpQuestionsScreen from "./assessment/FollowUpQuestionsScreen";
import GeneralQuestionsScreen from "./assessment/GeneralQuestionsScreen";
import ReviewScreen from "./assessment/ReviewScreen";
import StoryScreen from "./assessment/StoryScreen";
import SummaryScreen from "./assessment/SummaryScreen";
import LoadingAIScreen from "./assessment/LoadingAIScreen";

import useHealthTrackerEnvironment from "./assessment/hooks/useHealthTrackerEnvironment";
import useHealthTrackerAssessment from "./assessment/hooks/useHealthTrackerAssessment";
import useHealthTrackerSubmission from "./assessment/hooks/useHealthTrackerSubmission";
import useHealthTrackerNavigation from "./assessment/hooks/useHealthTrackerNavigation";
import SummaryQuestionCard from "./assessment/shared/SummaryQuestionCard";
import HealthTrackerLocationPicker from "./HealthTrackerLocationPicker";

import {
  buildSummaryQuestions,
  getGeneralQuestions,
  getConditionQuestions,
} from "./assessment/utils/healthTrackerSummary";

import {
  HEALTH_TRACKER_SCALE,
  getHealthTrackerQuestion,
  isHealthTrackerQuestionVisible,
} from "@/data/healthTrackerQuestions";

const CONDITION_OPTIONS = [
  { value: "menstruasi", label: "Menstruasi" },
  { value: "kehamilan", label: "Kehamilan" },
  { value: "menyusui", label: "Menyusui" },
  { value: "lewati", label: "Lewati" },
];

function isAnswered(question, answers) {
  const value = answers[question.code];

  if (question.type === "multiple") {
    return Array.isArray(value) && value.length > 0;
  }

  return value !== undefined && value !== null && value !== "";
}

export default function HealthTrackerAssessment() {
  const router = useRouter();

  const { environmentLocation } = useAssessment();

  const {
    condition,
    answers,
    scores,
    story,
    setStory,
    currentStep,
    setCurrentStep,
    error,
    setError,
    aiNotice,
    setAiNotice,
    saving,
    setSaving,
    updateAnswer,
    updateScore,
    changeCondition,
  } = useHealthTrackerAssessment();

  const {
    snapshot,
    environmentLoading,
    environmentError,
  } = useHealthTrackerEnvironment(environmentLocation);

  const { handleSubmit } = useHealthTrackerSubmission({
    router,
    condition,
    answers,
    scores,
    story,
    snapshot,
    setError,
    setSaving,
  });

  const activityQuestion = getHealthTrackerQuestion("HT-04");

  const generalQuestions = useMemo(
    () => getGeneralQuestions(answers),
    [answers]
  );

  const conditionQuestions = useMemo(
    () => getConditionQuestions(condition, answers),
    [condition, answers]
  );

  const questionSteps = useMemo(
    () => [...generalQuestions, ...conditionQuestions],
    [generalQuestions, conditionQuestions]
  );

  const steps = useMemo(
    () => [
      { code: "activity", title: "Aktivitas" },
      { code: "condition", title: "Kondisi" },
      { code: "general", title: "Pertanyaan Umum" },
      { code: "followup", title: "Pertanyaan Lanjutan" },
      { code: "story", title: "Cerita" },
      { code: "review", title: "Review" },
      { code: "summary", title: "Ringkasan" },
    ],
    []
  );

  const summaryStep = steps.length - 1;
  const reviewStep = summaryStep - 1;
  const storyStep = reviewStep - 1;

  function validateCurrentStep() {
    if (currentStep === 0) {
      if (!isAnswered(activityQuestion, answers)) {
        setError("Silakan pilih aktivitas terlebih dahulu.");
        return false;
      }

      return true;
    }

    if (currentStep === 1) {
      if (!condition) {
        setError("Silakan pilih kondisi terlebih dahulu.");
        return false;
      }

      return true;
    }

    // Pertanyaan umum dan lanjutan boleh dilewati.
    return true;
  }

  const hasQuestionAnswer = questionSteps.some((question) =>
    isAnswered(question, answers)
  );

  const {
    handleNext,
    handleBack,
    handleSkipQuestions,
    handleContinueWithoutAI,
    handleContinueWithAI,
    handleAIComplete,
    isAILoading,
  } = useHealthTrackerNavigation({
    router,
    currentStep,
    setCurrentStep,
    storyStep,
    summaryStep,
    questionSteps,
    hasQuestionAnswer,
    story,
    validateCurrentStep,
    setError,
    setAiNotice,
  });

  function renderSummaryItem(question) {
    return (
      <SummaryQuestionCard
        key={question.code}
        question={question}
        answers={answers}
        scores={scores}
        condition={condition}
      />
    );
  }

  const summaryQuestions = useMemo(
    () => buildSummaryQuestions(condition, activityQuestion),
    [condition, activityQuestion]
  );

  const conditionLabel =
    CONDITION_OPTIONS.find((option) => option.value === condition)?.label ??
    "Tidak disebutkan";

  return (
    <main className="health-tracker-flow mx-auto w-full max-w-4xl">

      {/* Hero dan informasi lokasi hanya tampil sebelum SummaryScreen */}
      {currentStep !== summaryStep && (
        <section className="mb-7 overflow-hidden rounded-3xl border border-[#F0E3E9] bg-[#FFF8FB] p-6 sm:p-8">

          <div className="mb-5 flex items-center gap-2">
            <span className="rounded-full bg-[#F8E8EF] px-3 py-1 text-xs font-bold tracking-wide text-[#B84E73]">
              HEALTH TRACKER
            </span>
            <span className="text-xs text-[#8A7B87]">
              Catatan kesehatan personal
            </span>
          </div>

          <h1 className="max-w-2xl text-2xl font-bold leading-snug text-[#332A35] sm:text-3xl">
            Bagaimana keadaan tubuhmu hari ini?
          </h1>

          <p className="mt-3 max-w-2xl text-sm leading-7 text-[#746875] sm:text-base">
            Luangkan waktu sejenak untuk mencatat pengalaman tubuh,
            aktivitas, dan situasi lingkungan yang kamu alami hari ini.
          </p>

          {/* Environment information */}
          <div className="mt-7">
            <HealthTrackerLocationPicker />

            {environmentLoading &&
              (environmentLocation?.coordinates || environmentLocation?.adm4) ? (
                <p className="text-sm text-[#746875]">
                  Sedang menyiapkan data lingkungan...
                </p>
              ) : !environmentLoading && environmentError && environmentLocation?.adm4 ? (
                <p className="text-sm text-[#746875]">
                  {environmentError}
                </p>
              ) : snapshot ? (
                <p className="text-sm text-[#52745A]">
                  Data lingkungan berhasil disiapkan.
                </p>
              ) : null}

            <p className="mt-3 text-xs leading-5 text-[#8A7B87]">
              Informasi lingkungan membantu memahami konteks aktivitas,
              bukan untuk menentukan diagnosis kesehatan.
            </p>
          </div>
        </section>
      )}

      {/* Assessment */}
      <section className="rounded-3xl border border-[#F0E3E9] bg-white p-5 sm:p-7">
        <div className="mt-8">
          {/* Step 1: Activity */}
          {currentStep === 0 && (
            <ActivityScreen
              question={activityQuestion}
              answers={answers}
              scores={scores}
              updateAnswer={updateAnswer}
              updateScore={updateScore}
            />
          )}

          {/* Step 2: Condition */}
          {currentStep === 1 && (
            <ConditionScreen
              options={CONDITION_OPTIONS}
              condition={condition}
              onChange={changeCondition}
            />
          )}

          {/* Step 3: Pertanyaan Umum */}
          {currentStep === 2 && (
            <GeneralQuestionsScreen
              questions={generalQuestions}
              answers={answers}
              scores={scores}
              updateAnswer={updateAnswer}
              updateScore={updateScore}
            />
          )}

          {/* Step 4: Pertanyaan Lanjutan */}
          {currentStep === 3 && (
            <FollowUpQuestionsScreen
              questions={conditionQuestions}
              answers={answers}
              scores={scores}
              updateAnswer={updateAnswer}
              updateScore={updateScore}
            />
          )}

          {/* Story */}
          {currentStep === storyStep && (
            <StoryScreen
              story={story}
              setStory={(value) => {
                setStory(value);
                setError("");
              }}
            />
          )}

          {/* Review Jawaban */}
          {currentStep === reviewStep && !isAILoading && (
            <ReviewScreen
              conditionLabel={conditionLabel}
              summaryQuestions={summaryQuestions}
              renderSummaryItem={renderSummaryItem}
              story={story}
            />
          )}

          {/* Loading AI */}
          {currentStep === reviewStep && isAILoading && (
            <LoadingAIScreen
              onComplete={handleAIComplete}
            />
          )}

          {/* Step 5: Summary */}
          {currentStep === summaryStep && (
            <SummaryScreen
              conditionLabel={conditionLabel}
              summaryQuestions={summaryQuestions}
              answers={answers}
              scores={scores}
              condition={condition}
              story={story}
              snapshot={snapshot}
            />
          )}
        </div>

        {/* Error */}
        {error && (
          <p
            role="alert"
            className="mt-5 rounded-xl bg-red-50 p-3 text-sm text-red-700"
          >
            {error}
          </p>
        )}

        {aiNotice && currentStep === reviewStep && (
          <p
            role="status"
            className="mt-4 rounded-xl border border-[#EADDE3] bg-[#FFF8FB] p-4 text-sm leading-6 text-[#746875]"
          >
            {aiNotice}
          </p>
        )}

        {/* Navigation */}
        {!isAILoading && (
          <div className="mt-8 flex flex-col-reverse gap-3 border-t border-[#F0E3E9] pt-5 sm:flex-row sm:items-center sm:justify-between">
            <button
              type="button"
              onClick={handleBack}
              className="..."
            >
              Kembali
            </button>

            {currentStep === reviewStep ? (
              <div className="flex flex-col gap-3 sm:flex-row">
                <button
                  type="button"
                  onClick={handleContinueWithoutAI}
                  className="rounded-xl border border-[#B84E73] px-5 py-3 text-sm font-semibold text-[#8E3E5E] transition hover:bg-[#FFF8FB]"
                >
                  Lanjut Tanpa AI
                </button>

                <button
                  type="button"
                  onClick={handleContinueWithAI}
                  className="rounded-xl bg-[#B84E73] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#8E3E5E]"
                >
                  Lanjut dengan AI
                </button>
              </div>
            ) : currentStep === summaryStep ? (
              <div className="flex flex-col gap-3 sm:flex-row">
                <button
                  type="button"
                  onClick={() => router.push("/healthtracker")}
                  disabled={saving}
                  className="rounded-xl border border-[#B84E73] px-5 py-3 text-sm font-semibold text-[#8E3E5E] transition hover:bg-[#FFF8FB] disabled:opacity-50"
                >
                  Jangan Simpan
                </button>

                <button
                  type="button"
                  onClick={handleSubmit}
                  disabled={saving}
                  className="rounded-xl bg-[#B84E73] px-6 py-3 text-sm font-semibold text-white transition hover:bg-[#8E3E5E] disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {saving ? "Menyimpan..." : "Simpan Check-In"}
                </button>
              </div>
            ) : currentStep === 2 || currentStep === 3 ? (
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setCurrentStep(currentStep === 2 ? 3 : storyStep)}
                  className="rounded-xl border border-[#B84E73] px-5 py-3 text-sm font-semibold text-[#8E3E5E] transition hover:bg-[#FFF8FB]"
                >
                  Lewati
                </button>

                <button
                  type="button"
                  onClick={handleNext}
                  className="rounded-xl bg-[#B84E73] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#8E3E5E]"
                >
                  Lanjutkan
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={handleNext}
                className="rounded-xl bg-[#B84E73] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#8E3E5E]"
              >
                Lanjutkan
              </button>
            )}
          </div>
        )}
      </section>
    </main>
  );
}