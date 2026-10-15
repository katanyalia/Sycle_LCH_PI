"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { hasTrackerInput, setTrackerAnswer, trackerSteps } from "@/lib/tracker/flow";

// Draf Health Tracker HANYA di memori (K-07): tidak di localStorage/sessionStorage, tidak autosave.
// Draf dikosongkan otomatis bila akun berganti / logout (userId berubah) agar tidak terlihat pengguna lain.
const TrackerDraftContext = createContext(null);

const INITIAL = { answers: {}, stage: "questions", stepIndex: 0, saved: null };

export function TrackerDraftProvider({ userId, children }) {
  const [state, setState] = useState({ ...INITIAL, ownerId: userId });

  // Sesuaikan state ketika pemilik sesi berubah (pola "adjust state during render").
  if (state.ownerId !== userId) setState({ ...INITIAL, ownerId: userId });

  const { answers, stage, stepIndex, saved } = state;
  const steps = useMemo(() => trackerSteps(answers), [answers]);
  const dirty = hasTrackerInput(answers) && !saved;

  useEffect(() => {
    if (!dirty) return undefined;
    const warn = (event) => {
      event.preventDefault();
      event.returnValue = "";
    };
    window.addEventListener("beforeunload", warn);
    return () => window.removeEventListener("beforeunload", warn);
  }, [dirty]);

  const update = useCallback((patch) => setState((s) => ({ ...s, ...(typeof patch === "function" ? patch(s) : patch) })), []);
  const answer = useCallback((key, value) => update((s) => ({ answers: setTrackerAnswer(s.answers, key, value) })), [update]);
  const setStage = useCallback((next) => update({ stage: next }), [update]);
  const setStepIndex = useCallback((index) => update({ stepIndex: index }), [update]);
  const goToStep = useCallback(
    (code) => update((s) => ({ stage: "questions", stepIndex: Math.max(0, trackerSteps(s.answers).indexOf(code)) })),
    [update]
  );
  const markSaved = useCallback((result) => update({ saved: result, stage: "saved" }), [update]);
  const reset = useCallback(() => setState((s) => ({ ...INITIAL, ownerId: s.ownerId })), []);

  const value = useMemo(
    () => ({ answers, steps, stage, stepIndex, saved, dirty, answer, setStage, setStepIndex, goToStep, markSaved, reset }),
    [answers, steps, stage, stepIndex, saved, dirty, answer, setStage, setStepIndex, goToStep, markSaved, reset]
  );
  return <TrackerDraftContext.Provider value={value}>{children}</TrackerDraftContext.Provider>;
}

export function useTrackerDraft() {
  const context = useContext(TrackerDraftContext);
  if (!context) throw new Error("useTrackerDraft harus dipakai di dalam TrackerDraftProvider");
  return context;
}
