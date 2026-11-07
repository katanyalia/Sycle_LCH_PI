"use client";

import Link from "next/link";
import { Heart, ArrowRight } from "lucide-react";
import { useAssessment } from "@/context/AssessmentContext";

export default function StartNewCheckInButton() {
  const { startNewHealthTrackerCheckIn } = useAssessment();

  return (
    <Link
      href="/healthtracker/assessment"
      onClick={startNewHealthTrackerCheckIn}
      className="inline-flex min-h-11 items-center justify-center gap-2 rounded-full bg-[#B84E73] px-5 py-3 text-sm font-bold text-white transition hover:bg-[#8E3E5E]"
    >
      <Heart size={17} />
      Mulai Check-In
      <ArrowRight size={16} />
    </Link>
  );
}