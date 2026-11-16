
import "./globals.css";
import { AssessmentProvider } from "@/context/AssessmentContext";
import { Suspense } from "react";

import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import ChatWidget from "@/components/home/ChatWidget";
import { ServiceWorkerRegister } from "@/components/pwa/ServiceWorkerRegister";
import { TrackerOfflineSync } from "@/components/pwa/TrackerOfflineSync";
import { BrandTitleGuard } from "@/components/pwa/BrandTitleGuard";

export const metadata = {
  title: "Sycle — Lingkungan, tubuh, dan cerita harianmu",
  description: "Catatan kesehatan perempuan dan konteks lingkungan.",
  // Ikon dan mode aplikasi saat SYCLE ditambahkan ke Home Screen iPhone/iPad (PWA).
  icons: {
    icon: [
      { url: "/icons/icon-192.png", sizes: "192x192", type: "image/png" },
      { url: "/icons/icon-512.png", sizes: "512x512", type: "image/png" },
    ],
    apple: [{ url: "/icons/apple-touch-icon.png", sizes: "180x180", type: "image/png" }],
  },
  appleWebApp: {
    capable: true,
    title: "SYCLE",
    statusBarStyle: "default",
  },
};

// Warna bilah status/judul browser saat SYCLE dibuka sebagai aplikasi.
export const viewport = {
  themeColor: "#FFF8FB",
  colorScheme: "only light",
};

export default function RootLayout({ children }) {
  return (
    <html lang="id">
      <body>
        <AssessmentProvider>
          <Suspense fallback={null}>
            <Navbar />
          </Suspense>

          <main>{children}</main>

          <Footer />

          <ChatWidget />

          <ServiceWorkerRegister />

          <TrackerOfflineSync />

          <BrandTitleGuard />
        </AssessmentProvider>
      </body>
    </html>
  );
}