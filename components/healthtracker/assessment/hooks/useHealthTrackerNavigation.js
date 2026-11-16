"use client";

import { useState } from "react";

export default function useHealthTrackerNavigation({
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
  snapshot,
}) {
  const [isAILoading, setIsAILoading] = useState(false);

  function handleNext() {
    if (!validateCurrentStep()) return;

    if (currentStep === storyStep) {
      const hasStory = story.trim().length > 0;

      if (!hasQuestionAnswer && !hasStory) {
        router.push("/healthtracker");
        return;
      }
    }

    setError("");

    setCurrentStep((previous) =>
      Math.min(previous + 1, summaryStep)
    );
  }

  function handleBack() {
    setError("");

    // Dari hasil refleksi AI, kembali ke awal check-in.
    if (currentStep === aiSummaryStep) {
      setCurrentStep(0);
      return;
    }

    setCurrentStep((previous) =>
      Math.max(previous - 1, 0)
    );
  }

  function handleSkipQuestions() {
    setError("");

    if (currentStep === 2) {
      setCurrentStep(3);
      return;
    }

    if (currentStep === 3) {
      setCurrentStep(storyStep);
    }
  }

  function handleContinueWithoutAI() {
    setError("");
    setAiNotice("");
    setCurrentStep(summaryStep);
  }

  async function handleContinueWithAI() {
    if (isAILoading) return;

    setError("");
    setAiNotice(null);
    setIsAILoading(true);

    const gejala = answers?.["HT-02"];

    const catatan = {
      kondisi: condition,
      gejala: Array.isArray(gejala)
        ? gejala
        : gejala
          ? [gejala]
          : [],
      cerita: (story ?? "").trim(),
      iklim: Object.values(snapshot?.indicators ?? {})
        .filter((item) => item.status === "ok" && item.value != null)
        .map(({ label, value, unit }) => ({
          label,
          value,
          unit,
        })),
    };

    try {
      const response = await fetch("/api/refleksi-ai", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ catatan }),
        signal: AbortSignal.timeout(50000),
      });

      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(
          data.error || "Refleksi AI gagal diproses."
        );
      }

      setAiNotice(data);
      setCurrentStep(aiSummaryStep);
    } catch (error) {
      console.error("Gagal memproses refleksi AI:", error);

      const offline =
        (typeof navigator !== "undefined" && navigator.onLine === false) ||
        error.name === "TypeError";

      setError(
        offline
          ? "Kamu sedang offline. Refleksi AI butuh internet. Kamu tetap bisa lanjut tanpa AI, dan catatanmu disimpan di perangkat sampai kamu online."
          : error.name === "TimeoutError"
          ? "Proses refleksi AI terlalu lama. Silakan coba kembali."
          : error.message || "Refleksi AI belum dapat diproses."
      );
    } finally {
      setIsAILoading(false);
    }
  }

  function handleAIComplete() {
    setIsAILoading(false);
    setCurrentStep(aiSummaryStep);
  }

  return {
    handleNext,
    handleBack,
    handleSkipQuestions,
    handleContinueWithoutAI,
    handleContinueWithAI,
    handleAIComplete,
    isAILoading,
  };
}