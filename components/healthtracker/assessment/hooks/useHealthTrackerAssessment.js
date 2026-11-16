"use client";

import { useState } from "react";
import {
  HEALTH_TRACKER_BRANCH_STEPS,
  getHealthTrackerQuestion,
  setHealthTrackerAnswer,
} from "@/data/healthTrackerQuestions";

function resolveQuestions(items = []) {
  return items
    .map((item) => {
      const code = typeof item === "string" ? item : item?.code;
      return code ? getHealthTrackerQuestion(code) : item;
    })
    .filter(Boolean);
}

export default function useHealthTrackerAssessment() {
  const [condition, setCondition] = useState("");
  const [answers, setAnswers] = useState({});
  const [scores, setScores] = useState({});
  const [story, setStory] = useState("");
  const [currentStep, setCurrentStep] = useState(0);

  const [error, setError] = useState("");
  const [aiNotice, setAiNotice] = useState([]);
  const [saving, setSaving] = useState(false);

  function updateAnswer(code, value) {
    setAnswers((previous) =>
      setHealthTrackerAnswer(previous, code, value)
    );

    setError("");
  }

  function updateScore(optionCode, value) {
    setScores((previous) => ({
      ...previous,
      [optionCode]: value,
    }));

    setError("");
  }

  function changeCondition(value) {
    const oldBranchQuestions = resolveQuestions(
      HEALTH_TRACKER_BRANCH_STEPS[condition] ?? []
    );

    setCondition(value);

    // Pertahankan jawaban umum, termasuk HT-04.
    // Hapus jawaban khusus kondisi sebelumnya.
    setAnswers((previous) => {
      const next = { ...previous };

      oldBranchQuestions.forEach((question) => {
        delete next[question.code];

        if (question.otherText?.key) {
          delete next[question.otherText.key];
        }
      });

      return next;
    });

    // Pertahankan skor HT-02 karena pertanyaan umum tetap berlaku.
    const selectedGeneralOptions = answers["HT-02"] ?? [];

    setScores((previous) =>
      Object.fromEntries(
        Object.entries(previous).filter(([key]) =>
          selectedGeneralOptions.includes(key)
        )
      )
    );

    setCurrentStep(1);
    setError("");
  }

  return {
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
  };
}