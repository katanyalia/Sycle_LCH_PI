import { Suspense } from "react";
import GeneralAssessmentContent from "@/components/assessment/GeneralAssessmentContent";

export default function AssessmentPage() {
  return (
    <main className="min-h-screen px-4 py-8">
      <Suspense fallback={<p>Memuat assessment...</p>}>
        <GeneralAssessmentContent />
      </Suspense>
    </main>
  );
}