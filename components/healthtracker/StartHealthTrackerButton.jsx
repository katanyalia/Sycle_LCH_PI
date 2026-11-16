"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { useAssessment } from "@/context/AssessmentContext";

export default function StartHealthTrackerButton() {
  const router = useRouter();
  const { startNewHealthTrackerCheckIn } = useAssessment();

  function handleStart() {
    startNewHealthTrackerCheckIn();
    router.push("/healthtracker/assessment");
  }

  return (
    <Button
      onClick={handleStart}
      variant="default"
      size="lg"
      className="h-11 min-h-11 w-full rounded-full border-transparent !bg-[#B84E73] px-5 text-sm font-bold text-white hover:!bg-[#8E3E5E] sm:w-auto"
    >
      <span>+</span>
      Mulai Daily Check-In
    </Button>
  );
}