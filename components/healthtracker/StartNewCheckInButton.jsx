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
      className="inline-flex h-11 min-h-11 w-full items-center justify-center gap-2 rounded-full bg-[#B84E73] px-5 text-sm font-bold !text-white transition hover:bg-[#8E3E5E] sm:w-auto"
      style={{ color: "#ffffff" }}
    >
      <Heart size={17} className="text-white" />
      <span className="text-white">Mulai Check-In</span>
      <ArrowRight size={16} className="text-white" />
    </Link>
  );
}