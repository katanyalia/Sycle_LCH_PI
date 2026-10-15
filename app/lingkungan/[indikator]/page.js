import { notFound } from "next/navigation";
import { INDICATOR_PAGES } from "@/lib/environment/indicatorRoutes";
import { IndicatorDetail } from "@/components/environment/IndicatorDetail";

export function generateStaticParams() {
  return Object.keys(INDICATOR_PAGES).map((indikator) => ({ indikator }));
}

export const dynamicParams = false;

export async function generateMetadata({ params }) {
  const { indikator } = await params;
  return { title: INDICATOR_PAGES[indikator]?.title ?? "Detail indikator" };
}

// WF-01 screen 05–09 — detail indikator lingkungan.
export default async function IndikatorPage({ params }) {
  const { indikator } = await params;
  if (!INDICATOR_PAGES[indikator]) notFound();
  return <IndicatorDetail slug={indikator} />;
}
