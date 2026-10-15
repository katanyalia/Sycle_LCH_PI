import { PageShell, SupportPanel } from "@/components/layout/PageShell";
import { StatusMessage } from "@/components/feedback/StatusMessage";
import { SignInForm } from "@/components/auth/AuthForms";
import { safeNextPath } from "@/lib/auth/redirect";

export const metadata = { title: "Login" };

// WF-09 screen 66 (+ 68 untuk keadaan kesalahan).
export default async function MasukPage({ searchParams }) {
  const { next, tautan } = await searchParams;
  const target = next ? safeNextPath(next) : "";
  return (
    <PageShell
      eyebrow="Akun"
      title="Masuk ke akun SYCLE."
      panel={
        <SupportPanel title="Tentang akun">
          <p>Login diperlukan untuk Health Tracker, Riwayat, dan Profil.</p>
          <p>Fitur lain tetap bisa dipakai tanpa login.</p>
        </SupportPanel>
      }
    >
      <div className="max-w-md space-y-4">
        {target.startsWith("/health-tracker") && (
          <StatusMessage variant="restricted" title="Health Tracker tersedia untuk Member">
            Masuk untuk melanjutkan. Setelah berhasil, kamu akan kembali ke halaman tujuanmu.
          </StatusMessage>
        )}
        {tautan === "tidak-valid" && (
          <StatusMessage variant="error" title="Tautan tidak dapat digunakan">
            Tautan sudah kedaluwarsa, sudah dipakai, atau dibuka di browser yang berbeda. Coba masuk, atau minta tautan baru.
          </StatusMessage>
        )}
        <SignInForm next={target} />
      </div>
    </PageShell>
  );
}
