"use client";

import { useAssessment } from "@/context/AssessmentContext";
import HealthTrackerAssessment from "@/components/healthtracker/HealthTrackerAssessment";

export default function HealthTrackerAssessmentSession() {
  const { healthTrackerSessionId } = useAssessment();

  return (
    <HealthTrackerAssessment key={healthTrackerSessionId} />
  );
}