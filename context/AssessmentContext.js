"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
} from "react";

import {
  conditions,
  symptoms,
  coreQuestions,
  visibleQuestions,
} from "@/data/sycle";

const initialProfile = {
  name: "Nadia",
  age: 31,
  weight: "58",
};

const AssessmentContext = createContext(null);

export function AssessmentProvider({ children }) {
  const [mode, setMode] = useState("member");
  const [condition, setCondition] = useState("");
  const [activity, setActivity] = useState("");
  const [location, setLocation] = useState("");
  const [environmentLocation, setEnvironmentLocation] = useState({
    adm4: null,
    coordinates: null,
  });

  const [profile, setProfile] = useState(initialProfile);
  const [answers, setAnswers] = useState({});
  const [scores, setScores] = useState({});
  const [story, setStory] = useState("");
  const [entries, setEntries] = useState([]);
  const [notice, setNotice] = useState("");
  const [healthTrackerSessionId, setHealthTrackerSessionId] =
    useState(0);

  const startNewHealthTrackerCheckIn = useCallback(() => {
    setHealthTrackerSessionId((previous) => previous + 1);
  }, []);

  const updateAnswer = useCallback((key, value) => {
    setAnswers((previous) => ({
      ...previous,
      [key]: value,
    }));
  }, []);

  const resetAssessment = useCallback((nextMode = "member") => {
    setMode(nextMode);
    setCondition("");
    setAnswers({});
    setScores({});
    setStory("");
    setNotice("");
  }, []);

  const validatePersonal = useCallback(() => {
    const age = Number(profile.age);

    if (
      profile.age === "" ||
      !Number.isFinite(age) ||
      age < 1 ||
      age > 100
    ) {
      return "Masukkan usia antara 1–100 tahun.";
    }

    return "";
  }, [profile.age]);
  
  const validateCore = useCallback(() => {
    if (!condition) {
      return "Pilih kondisi kesehatan terlebih dahulu.";
    }

    const questions = visibleQuestions(condition, answers);

    const incomplete = questions.some(([question]) => {
      const value = answers[question];

      return (
        value === undefined ||
        value === "" ||
        (Array.isArray(value) && value.length === 0)
      );
    });

    if (incomplete) {
      return "Lengkapi pertanyaan di layar ini.";
    }

    return "";
  }, [answers, condition]);

  const validateSymptoms = useCallback(() => {
    if (!condition) {
      return "Pilih kondisi kesehatan terlebih dahulu.";
    }

    const conditionSymptoms = symptoms[condition] ?? [];

    const incomplete = conditionSymptoms.some(
      (item) => scores[item] === undefined
    );

    if (incomplete) {
      return "Pilih skala untuk setiap gejala, termasuk Tidak ada (0).";
    }

    return "";
  }, [condition, scores]);

  const saveEntry = useCallback(() => {
    const entry = {
      id: Date.now(),
      date: new Date().toLocaleDateString("id-ID"),
      condition,
      activity,
      location,
      profile: { ...profile },
      answers: { ...answers },
      scores: { ...scores },
      story,
    };

    setEntries((previous) => [...previous, entry]);
    setNotice("Catatan demo disimpan pada sesi browser ini.");

    return entry;
  }, [
    condition,
    activity,
    location,
    profile,
    answers,
    scores,
    story,
  ]);

  const value = useMemo(
    () => ({
      mode,
      setMode,
      condition,
      setCondition,
      activity,
      setActivity,
      location,
      setLocation,
      environmentLocation,
      setEnvironmentLocation,
      profile,
      setProfile,
      answers,
      setAnswers,
      updateAnswer,
      scores,
      setScores,
      story,
      setStory,
      entries,
      setEntries,
      notice,
      setNotice,
      healthTrackerSessionId,
      startNewHealthTrackerCheckIn,
      resetAssessment,
      validatePersonal,
      validateCore,
      validateSymptoms,
      saveEntry,
      conditions,
      symptoms,
      coreQuestions,
    }),
    [
      mode,
      condition,
      activity,
      location,
      environmentLocation,
      profile,
      answers,
      updateAnswer,
      scores,
      story,
      entries,
      notice,
      healthTrackerSessionId,
      startNewHealthTrackerCheckIn,
      resetAssessment,
      validatePersonal,
      validateCore,
      validateSymptoms,
      saveEntry,
    ]
  );

  return (
    <AssessmentContext.Provider value={value}>
      {children}
    </AssessmentContext.Provider>
  );
}

export function useAssessment() {
  const context = useContext(AssessmentContext);

  if (!context) {
    throw new Error(
      "useAssessment harus digunakan di dalam AssessmentProvider."
    );
  }

  return context;
}