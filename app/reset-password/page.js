import Link from "next/link";
import { PageShell } from "@/components/layout/PageShell";
import { StatusMessage } from "@/components/feedback/StatusMessage";
import { Button } from "@/components/ui/button";
import { ResetPasswordForm } from "@/components/auth/AuthForms";
import { createClient } from "@/lib/supabase/server";

export const metadata = { title: "Atur ulang kata sandi" };

// Dibuka dari tautan pemulihan di email (melalui /auth/confirm).
export default async function ResetPasswordPage() {
  const supabase = await createClient();
  const { data } = await supabase.auth.getClaims();

  return (
    <PageShell eyebrow="Akun" title="Buat kata sandi baru.">
      <div className="max-w-md">
        {data?.claims ? (
          <ResetPasswordForm />
        ) : (
          <StatusMessage
            variant="error"
            title="Sesi pemulihan tidak ditemukan"
            action={
              <Button asChild>
                <Link href="/lupa-password">Minta tautan baru</Link>
              </Button>
            }
          >
            Buka halaman ini dari tautan pemulihan di emailmu. Tautan hanya berlaku sementara.
          </StatusMessage>
        )}
      </div>
    </PageShell>
  );
}
