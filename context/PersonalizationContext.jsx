"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { hasAnyAnswer, setAnswer as applyAnswer, visibleSteps } from "@/lib/personalization/flow";

// K-07: jawaban Personalisasi HANYA di memori (tidak localStorage/sessionStorage, tidak dikirim ke server,
// tidak menjadi riwayat). Peringatan browser muncul bila halaman ditutup/di-refresh saat ada jawaban.
const PersonalizationContext = createContext(null);

export function PersonalizationProvider({ children }) {
  const [answers, setAnswers] = useState({});
  const [stage, setStage] = useState("intro"); // intro | questions | review
  const [stepIndex, setStepIndex] = useState(0);

  const steps = useMemo(() => visibleSteps(answers), [answers]);
  const dirty = hasAnyAnswer(answers);

  useEffect(() => {
    if (!dirty) return undefined;
    const warn = (event) => {
      event.preventDefault();
      event.returnValue = "";
    };
    window.addEventListener("beforeunload", warn);
    return () => window.removeEventListener("beforeunload", warn);
  }, [dirty]);

  const answer = useCallback((code, value) => setAnswers((current) => applyAnswer(current, code, value)), []);

  const start = useCallback(() => {
    setStage("questions");
    setStepIndex(0);
  }, []);

  const goToStep = useCallback(
    (code) => {
      const index = visibleSteps(answers).indexOf(code);
      setStepIndex(index >= 0 ? index : 0);
      setStage("questions");
    },
    [answers]
  );

  const reset = useCallback(() => {
    setAnswers({});
    setStage("intro");
    setStepIndex(0);
  }, []);

  const value = useMemo(
    () => ({ answers, steps, stage, stepIndex, dirty, answer, start, goToStep, reset, setStage, setStepIndex }),
    [answers, steps, stage, stepIndex, dirty, answer, start, goToStep, reset]
  );

  return <PersonalizationContext.Provider value={value}>{children}</PersonalizationContext.Provider>;
}

export function usePersonalization() {
  const context = useContext(PersonalizationContext);
  if (!context) throw new Error("usePersonalization harus dipakai di dalam PersonalizationProvider");
  return context;
}
