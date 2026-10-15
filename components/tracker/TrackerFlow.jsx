"use client";

import { TrackerConsent, TrackerQuestionStep, TrackerReview } from "@/components/tracker/TrackerQuestions";
import { TrackerSaved, TrackerSummary } from "@/components/tracker/TrackerSummary";
import { useTrackerDraft } from "@/context/TrackerDraftContext";

// WF-04/05: pertanyaan → tinjau → persetujuan AI → ringkasan → disimpan.
export function TrackerFlow() {
  const { stage } = useTrackerDraft();
  if (stage === "review") return <TrackerReview />;
  if (stage === "consent") return <TrackerConsent />;
  if (stage === "summary") return <TrackerSummary />;
  if (stage === "saved") return <TrackerSaved />;
  return <TrackerQuestionStep />;
}
