import Image from "next/image";
import Link from "next/link";
import { UserRound } from "lucide-react";
import { MainNav } from "@/components/layout/MainNav";
import { LocationStatus } from "@/components/environment/LocationStatus";

// Header global (wireframe: logo | 4 menu | Lokasi | Akun).
// Status akun masih placeholder sampai Tahap 5 (autentikasi).
export function SiteHeader() {
  return (
    <header className="sticky top-0 z-40 border-b bg-card/95 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-7xl items-center gap-4 px-4 lg:px-6">
        <Link href="/" className="flex shrink-0 items-center gap-2 rounded-lg" aria-label="SYCLE V2 — Beranda">
          {/* Logo asli (JPG berlatar). Versi transparan menunggu keputusan K-16. */}
          <Image
            src="/brand/logo-sycle.jpg"
            alt=""
            width={40}
            height={40}
            className="rounded-lg"
            priority
          />
          <span className="text-lg font-bold tracking-tight text-primary-pressed">SYCLE</span>
        </Link>

        <div className="flex flex-1 justify-center">
          <MainNav />
        </div>

        <div className="ml-auto flex min-w-0 items-center gap-1 text-sm md:ml-0">
          <LocationStatus />
          <Link
            href="/masuk"
            className="hidden h-10 items-center gap-1.5 rounded-lg px-3 font-medium hover:bg-secondary md:flex"
          >
            <UserRound className="size-4" aria-hidden="true" />
            Masuk
          </Link>
        </div>
      </div>
    </header>
  );
}
