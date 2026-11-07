"use client";

import { useState } from "react";

export default function useHealthTrackerNavigation({
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

  function handleContinueWithAI() {
    setError("");
    setAiNotice("");
    setIsAILoading(true);
  }

  function handleAIComplete() {
    setIsAILoading(false);
    setCurrentStep(summaryStep);
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