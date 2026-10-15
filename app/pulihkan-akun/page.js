import { redirect } from "next/navigation";

// Alamat lama Tahap 1 → halaman Lupa kata sandi.
export default function PulihkanAkunPage() {
  redirect("/lupa-password");
}
