"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { LogOut } from "lucide-react";

import { createClient } from "@/lib/supabase/client";
import { clearTrackerQueue } from "@/lib/healthtracker/offlineQueue";
import { Button } from "@/components/ui/button";

export default function LogoutButton({ compact = false }) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleLogout() {
    setIsLoading(true);
    setError("");

    const supabase = createClient();
    const { error } = await supabase.auth.signOut();

    if (error) {
      setError("Logout belum berhasil. Silakan coba kembali.");
      setIsLoading(false);
      return;
    }

    // Catatan offline yang belum terkirim ikut dihapus dari perangkat saat keluar.
    await clearTrackerQueue();

    router.replace("/login");
    router.refresh();
  }

  return (
    <div>
      <Button
        type="button"
        onClick={handleLogout}
        disabled={isLoading}
        variant="outline"
        size="lg"
        className={
            compact
                ? "w-full justify-start border-0 bg-transparent text-[#8E3E5E] shadow-none hover:bg-[#F8E8EF]"
                : "w-full border-[#B84E73] text-[#8E3E5E] hover:bg-[#F8E8EF] sm:w-auto"
        }
      >
        <LogOut size={18} />
        {isLoading ? "Keluar..." : "Keluar dari Akun"}
      </Button>

      {error && (
        <p className="mt-3 text-sm text-red-700">
          {error}
        </p>
      )}
    </div>
  );
}