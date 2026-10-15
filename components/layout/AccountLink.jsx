import Link from "next/link";
import { UserRound } from "lucide-react";
import { getCurrentUser } from "@/lib/auth/session";

// Area "Akun" di header (wireframe: Lokasi | Akun). Server Component: membaca sesi dari cookie.
export async function AccountLink() {
  const user = await getCurrentUser();
  const label = user ? user.displayName || "Akun saya" : "Masuk";
  return (
    <Link
      href={user ? "/profil" : "/masuk"}
      className="hidden h-10 max-w-[12rem] items-center gap-1.5 rounded-lg px-3 font-medium hover:bg-secondary md:flex"
      aria-label={user ? `Profil: ${label}` : "Masuk ke akun"}
    >
      <UserRound className="size-4 shrink-0" aria-hidden="true" />
      <span className="truncate">{label}</span>
    </Link>
  );
}
