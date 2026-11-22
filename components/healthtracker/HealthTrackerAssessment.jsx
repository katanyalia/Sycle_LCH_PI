"use client";

import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useAssessment } from "@/context/AssessmentContext";
import { generateHealthTrackerSummary } from "./assessment/utils/generateHealthTrackerSummary";

import ActivityScreen from "./assessment/ActivityScreen";
import ConditionScreen from "./assessment/ConditionScreen";
import FollowUpQuestionsScreen from "./assessment/FollowUpQuestionsScreen";
import GeneralQuestionsScreen from "./assessment/GeneralQuestionsScreen";
import ReviewScreen from "./assessment/ReviewScreen";
import StoryScreen from "./assessment/StoryScreen";
import SummaryScreen from "./assessment/SummaryScreen";
import LoadingAIScreen from "./assessment/LoadingAIScreen";
import AISummaryScreen from "./assessment/AISummaryScreen";

import useHealthTrackerEnvironment from "./assessment/hooks/useHealthTrackerEnvironment";
import useHealthTrackerAssessment from "./assessment/hooks/useHealthTrackerAssessment";
import useHealthTrackerSubmission from "./assessment/hooks/useHealthTrackerSubmission";
import useHealthTrackerNavigation from "./assessment/hooks/useHealthTrackerNavigation";
import SummaryQuestionCard from "./assessment/shared/SummaryQuestionCard";
import HealthTrackerLocationPicker from "./HealthTrackerLocationPicker";
import RecommendationsCard from "./assessment/RecommendationsCard";
import GuestActionsPanel from "./assessment/GuestActionsPanel";
import { createClient } from "@/lib/supabase/client";
import {
  HOME_ACTIVITY_TO_HT04,
  clearPendingCheckIn,
  readPendingCheckIn,
} from "@/lib/healthtracker/pendingCheckIn";

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
    restoreDraft,
    prefillActivity,
  } = useHealthTrackerAssessment();

  useEffect(() => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  }, [currentStep]);

  const {
    snapshot: liveSnapshot,
    environmentLoading,
    environmentError,
  } = useHealthTrackerEnvironment(environmentLocation);

  // null = sedang dicek; true = belum login (Guest); false = Member.
  const [isGuest, setIsGuest] = useState(null);
  // Data lingkungan dari draf Guest dipakai bila lokasi belum tersedia setelah login.
  const [restoredSnapshot, setRestoredSnapshot] = useState(null);
  // Aksi yang dipilih Guest sebelum login ("save" / "ai"), dijalankan sekali setelah draf terpasang.
  const pendingActionRef = useRef(null);
  const [resumeTick, setResumeTick] = useState(0);

  const snapshot = liveSnapshot ?? restoredSnapshot;


  const generatedSummary = useMemo(
    () =>
      generateHealthTrackerSummary({
        condition,
        answers,
        scores,
        story,
        snapshot,
      }),
    [condition, answers, scores, story, snapshot]
  );

  const { handleSubmit } = useHealthTrackerSubmission({
    router,
    condition,
    answers,
    scores,
    story,
    snapshot,
    aiNotice,
    generatedSummary,
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
  const aiSummaryStep = summaryStep + 1;

  // Saat halaman dibuka: cek status login (dari perangkat, tetap jalan saat offline), lalu
  // isi aktivitas dari Beranda atau lanjutkan draf Guest setelah login/daftar.
  useEffect(() => {
    let active = true;

    function start(guest) {
      if (!active) return;
      setIsGuest(guest);

      const params = new URLSearchParams(window.location.search);
      const draft = params.get("resume") === "1" ? readPendingCheckIn() : null;

      if (!draft) {
        const homeActivity = HOME_ACTIVITY_TO_HT04[params.get("activity")];
        if (homeActivity) {
          // Aktivitas sudah dipilih di Beranda: langsung ke Tahap 02 (Kondisi).
          // Tahap 01 tetap bisa dibuka lewat tombol Kembali bila ingin mengubahnya.
          prefillActivity(homeActivity);
          setCurrentStep(1);
        }
        return;
      }

      restoreDraft(draft);
      setRestoredSnapshot(draft.snapshot ?? null);

      if (guest) {
        // Belum jadi login: tampilkan lagi ringkasannya.
        setCurrentStep(summaryStep);
        return;
      }

      pendingActionRef.current = draft.intent === "ai" ? "ai" : "save";
      setCurrentStep(draft.intent === "ai" ? reviewStep : summaryStep);
      setResumeTick((value) => value + 1);
    }

    createClient()
      .auth.getSession()
      .then(({ data }) => start(!data.session))
      .catch(() => start(true));

    return () => {
      active = false;
    };
    // Sekali saat halaman dibuka.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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
    aiSummaryStep,
    questionSteps,
    hasQuestionAnswer,
    story,
    validateCurrentStep,
    setError,
    setAiNotice,
    condition,
    answers,
    scores,
    generatedSummary,
    snapshot,
  });

  // Jalankan aksi yang dipilih Guest setelah jawaban draf terpasang.
  useEffect(() => {
    const action = pendingActionRef.current;
    if (!resumeTick || !action) return;
    pendingActionRef.current = null;

    if (action === "ai") {
      handleContinueWithAI();
    } else {
      handleSubmit();
    }
    // Hanya dipicu oleh resumeTick (draf baru dipasang).
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [resumeTick]);

  function finishWithoutSaving() {
    clearPendingCheckIn();
    router.push("/");
  }

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
      <Link
      href="/healthtracker"
      className="mb-5 inline-flex items-center gap-2 text-sm font-bold text-[#8A6578] transition hover:text-[#B84E73]"
    >
      <ArrowLeft size={17} />
      Kembali ke Health Tracker
    </Link>

      {/* Hero dan informasi lokasi hanya tampil sebelum SummaryScreen */}
      {currentStep !== summaryStep &&
        currentStep !== aiSummaryStep && (
        <section className="mb-7 overflow-hidden rounded-3xl border border-[#F0E3E9] bg-[#FFF8FB] p-6 sm:p-8">

          <div className="mb-5 flex items-center gap-2">
            <span className="rounded-full bg-[#F8E8EF] px-3 py-1 text-xs font-bold tracking-wide text-[#B84E73]">
              HEALTH TRACKER
            </span>
            <span className="text-xs text-[#8A7B87]">
              Catatan kesehatan personal
            </span>
          </div>

          <p className="mb-2 text-sm font-bold text-[#B84E73]">
            Halo, Sahabat SYCLE!
          </p>

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
                <p className="mt-2 text-sm text-[#52745A]">
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
        <div>
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
            <LoadingAIScreen />
          )}

          {/* Hasil tanpa AI */}
          {currentStep === summaryStep && (
            <SummaryScreen
              conditionLabel={conditionLabel}
              summaryQuestions={summaryQuestions}
              answers={answers}
              scores={scores}
              condition={condition}
              story={story}
              snapshot={snapshot}
              generatedSummary={generatedSummary}
            />
          )}

          {/* Saran umum tanpa AI (Guest dan Member) */}
          {currentStep === summaryStep && (
            <RecommendationsCard condition={condition} answers={answers} />
          )}

          {/* Guest: simpan / Refleksi AI butuh akun */}
          {currentStep === summaryStep && isGuest && (
            <GuestActionsPanel
              draft={{ condition, answers, scores, story, snapshot }}
              onFinish={finishWithoutSaving}
            />
          )}

          {/* Hasil dengan AI */}
          {currentStep === aiSummaryStep && (
            <AISummaryScreen
              conditionLabel={conditionLabel}
              summaryQuestions={summaryQuestions}
              answers={answers}
              scores={scores}
              condition={condition}
              story={story}
              snapshot={snapshot}
              aiNotice={aiNotice}
              generatedSummary={generatedSummary}
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

        {/* Navigation */}
        {!isAILoading && (
          <div className="mt-6 flex flex-col-reverse gap-3 border-t border-[#F0E3E9] pt-5 sm:flex-row sm:items-center sm:justify-between">

          <button
            type="button"
            onClick={handleBack}
            className="inline-flex items-center justify-center gap-2 rounded-xl border border-[#EAD8E0] bg-white px-5 py-3 text-sm font-bold text-[#8E3E5E] shadow-[0_2px_8px_rgba(120,70,90,0.04)] transition-all hover:border-[#DDB3C3] hover:bg-[#FFF8FB] hover:text-[#B84E73] active:scale-[0.98]"
          >
            <ArrowLeft size={17} />
            Kembali
          </button>

        {currentStep === reviewStep && isGuest ? (
          <button
            type="button"
            onClick={handleContinueWithoutAI}
            className="rounded-xl bg-[#B84E73] px-6 py-3 text-sm font-semibold text-white transition hover:bg-[#8E3E5E]"
          >
            Lihat Ringkasan
          </button>
        ) : currentStep === summaryStep && isGuest ? null : currentStep === reviewStep ? (
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
        ) : currentStep === summaryStep ||
          currentStep === aiSummaryStep ? (
          <div className="flex flex-col gap-3 sm:flex-row">
            <button
              type="button"
              onClick={() => {
                clearPendingCheckIn();
                router.push("/healthtracker");
              }}
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
        ) : currentStep === 1 ? (
          <button
            type="button"
            onClick={handleNext}
            disabled={!condition}
            className="rounded-xl bg-[#B84E73] px-6 py-3 text-sm font-semibold text-white transition hover:bg-[#8E3E5E] disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:bg-[#B84E73]"
          >
            Lanjutkan
          </button>
        ) : currentStep === 2 || currentStep === 3 ? (
          <div className="flex gap-3">
            <button
              type="button"
              onClick={() =>
                setCurrentStep(currentStep === 2 ? 3 : storyStep)
              }
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