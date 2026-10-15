import { notFound } from "next/navigation";
import { ComponentPreview } from "./ComponentPreview";

export const metadata = { title: "Pratinjau komponen", robots: { index: false } };

// Halaman pengembang untuk memeriksa design system. Tidak tersedia di production.
export default function PratinjauKomponenPage() {
  if (process.env.NODE_ENV === "production") notFound();
  return <ComponentPreview />;
}
