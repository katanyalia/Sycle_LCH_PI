import Link from "next/link";
import { PageShell } from "@/components/layout/PageShell";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <PageShell title="Halaman tidak ditemukan" description="Halaman yang kamu cari tidak tersedia.">
      <Button asChild>
        <Link href="/">Kembali ke Beranda</Link>
      </Button>
    </PageShell>
  );
}
