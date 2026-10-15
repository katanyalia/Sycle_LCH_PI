import { Open_Sans } from "next/font/google";
import { SiteHeader } from "@/components/layout/SiteHeader";
import { SiteFooter } from "@/components/layout/SiteFooter";
import { MobileNav } from "@/components/layout/MainNav";
import { EnvironmentProvider } from "@/context/EnvironmentContext";
import "./globals.css";

// Font LOCKED: Open Sans (Master Draft 1.6).
const openSans = Open_Sans({
  variable: "--font-open-sans",
  subsets: ["latin"],
  display: "swap",
});

export const metadata = {
  title: {
    default: "SYCLE V2 — Kenali Lingkunganmu, Proteksi Awalmu.",
    template: "%s · SYCLE V2",
  },
  description:
    "SYCLE membantu perempuan memahami kondisi lingkungan, memperoleh edukasi kesehatan berbasis bukti, dan mencatat pengalaman tubuh secara sukarela.",
  applicationName: "SYCLE V2",
};

export const viewport = {
  themeColor: "#fff8fb",
};

export default function RootLayout({ children }) {
  return (
    <html lang="id" className={`${openSans.variable} h-full antialiased`}>
      <body className="flex min-h-full flex-col pb-20 lg:pb-0">
        <a
          href="#konten-utama"
          className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-50 focus:rounded-lg focus:bg-card focus:px-4 focus:py-2 focus:shadow"
        >
          Lompat ke konten utama
        </a>
        <EnvironmentProvider>
          <SiteHeader />
          <main id="konten-utama" className="flex-1">
            {children}
          </main>
          <SiteFooter />
          <MobileNav />
        </EnvironmentProvider>
      </body>
    </html>
  );
}
