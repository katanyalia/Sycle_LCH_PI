"use client";

import Link from "next/link";
import Image from "next/image";
import LogoutButton from "@/components/profile/LogoutButton";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { MapPin, UserRound } from "lucide-react";

import { createClient } from "@/lib/supabase/client";

const navItems = [
  { href: "/", label: "Beranda" },
  { href: "/healthtracker", label: "Health Tracker" },
  { href: "/education", label: "Info & Edukasi" },
  { href: "/healthcare", label: "Healthcare" },
];

export default function Navbar() {
  const pathname = usePathname();

  const [user, setUser] = useState(null);
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);

  const isActive = (href) =>
    href === "/"
      ? pathname === "/"
      : pathname === href || pathname.startsWith(`${href}/`);

  const displayName =
    user?.user_metadata?.full_name ||
    user?.user_metadata?.display_name ||
    user?.user_metadata?.name ||
    user?.email?.split("@")[0] ||
    "Pengguna";

  const greetingName = displayName.trim().split(/\s+/)[0];

  useEffect(() => {
    const supabase = createClient();
    let mounted = true;

    async function checkSession() {
      const { data, error } = await supabase.auth.getSession();

      if (mounted) {
        setUser(error ? null : data.session?.user ?? null);
        setIsCheckingAuth(false);
      }

      if (mounted) {
        setUser(error ? null : data.session?.user ?? null);
        setIsCheckingAuth(false);
      }
    }

    checkSession();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (mounted) {
        setUser(session?.user ?? null);
        setIsCheckingAuth(false);
      }
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  return (
    <header className="header">
      <Link className="brand" href="/" aria-label="SYCLE Beranda" translate="no">
        <Image
          src="/images/sycle-logo.png"
          alt="SYCLE"
          width={80}
          height={32}
          priority
          className="brand-logo"
        />
      </Link>

      <nav className="nav-menu" aria-label="Navigasi utama">
        {navItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={`nav-link ${
              isActive(item.href) ? "nav-active" : ""
            }`}
            aria-current={isActive(item.href) ? "page" : undefined}
          >
            {item.label}
          </Link>
        ))}
      </nav>
      <div className="nav-actions">
        {!isCheckingAuth &&
          (user ? (
            <div className="relative group">
              <button
                type="button"
                className="nav-account flex items-center gap-2"
                aria-label={`Menu profil ${displayName}`}
                aria-haspopup="true"
              >
                <UserRound size={19} aria-hidden="true" />

                <span className="flex flex-col items-start leading-tight">
                  <span className="text-sm font-bold">
                    Hi, {greetingName}!
                  </span>

                  <span className="mt-1 text-xs font-medium text-[#B84E73]">
                    Lihat Profile
                  </span>
                </span>
              </button>

              {/* Dropdown Profile */}
              <div className="absolute right-0 top-full z-50 hidden w-64 pt-2 group-hover:block group-focus-within:block">
                <div className="overflow-hidden rounded-2xl border border-[#F0E5EB] bg-white shadow-lg">

                  {/* Informasi pengguna */}
                  <div className="border-b border-[#F0E5EB] px-4 py-4">
                    <p className="text-xs font-semibold text-[#8A7D89]">
                      Masuk sebagai
                    </p>

                    <p className="mt-1 truncate font-extrabold text-[#332A35]">
                      {displayName}
                    </p>

                    <p className="mt-1 truncate text-xs text-[#8A7D89]">
                      {user.email}
                    </p>
                  </div>

                  {/* Lihat Profile */}
                  <Link
                    href="/profile"
                    className="flex items-center gap-3 px-4 py-3 text-sm font-semibold text-[#332A35] transition-colors hover:bg-[#F8E8EF]"
                  >
                    <UserRound
                      size={18}
                      className="text-[#B84E73]"
                    />
                    Lihat Profile
                  </Link>

                  {/* Logout */}
                  <div className="border-t border-[#F0E5EB] p-2">
                    <LogoutButton compact />
                  </div>

                </div>
              </div>
            </div>
          ) : (
            <>
              <Link
                href="/login"
                className={`nav-button nav-button-outline ${
                  pathname === "/login" ? "nav-button-active" : ""
                }`}
                aria-current={pathname === "/login" ? "page" : undefined}
              >
                Masuk
              </Link>

              <Link
                href="/signup"
                className={`nav-button ${
                  pathname === "/signup" ? "nav-button-active" : ""
                }`}
                aria-current={pathname === "/signup" ? "page" : undefined}
              >
                Daftar
              </Link>
            </>
          ))}
      </div>
    </header>
  );
}