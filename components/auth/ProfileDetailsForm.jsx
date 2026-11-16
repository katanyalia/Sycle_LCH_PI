"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { saveProfileDetails } from "@/app/profile/actions";

export function ProfileDetailsForm({ profile = {} }) {
  const router = useRouter();

  const [form, setForm] = useState({
    full_name: profile.full_name || "",
    birth_date: profile.birth_date || "",
    domicile: profile.domicile || "",
    occupation: profile.occupation || "",
  });

  const [message, setMessage] = useState("");
  const [isPending, startTransition] = useTransition();

  function handleChange(event) {
    const { name, value } = event.target;

    setForm((previous) => ({
      ...previous,
      [name]: value,
    }));
  }

  function handleSubmit(event) {
    event.preventDefault();
    setMessage("");

    startTransition(async () => {
      try {
        const result = await saveProfileDetails(form);

        if (!result?.ok) {
          setMessage(
            result?.message || "Profil gagal diperbarui."
          );
          return;
        }

        setMessage("Informasi profil berhasil disimpan.");
        router.refresh();
      } catch {
        setMessage("Terjadi kesalahan. Silakan coba kembali.");
      }
    });
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div className="space-y-2">
        <label htmlFor="full_name" className="text-sm font-semibold text-[#332A35]">
          Nama lengkap
        </label>
        <Input
          id="full_name"
          name="full_name"
          value={form.full_name}
          onChange={handleChange}
          maxLength={100}
          placeholder="Masukkan nama lengkap"
          disabled={isPending}
        />
      </div>

      <div className="space-y-2">
        <label htmlFor="birth_date" className="text-sm font-semibold text-[#332A35]">
          Tanggal lahir
        </label>
        <Input
          id="birth_date"
          name="birth_date"
          type="date"
          value={form.birth_date}
          onChange={handleChange}
          disabled={isPending}
        />
      </div>

      <div className="space-y-2">
        <label htmlFor="domicile" className="text-sm font-semibold text-[#332A35]">
          Domisili
        </label>
        <Input
          id="domicile"
          name="domicile"
          value={form.domicile}
          onChange={handleChange}
          maxLength={100}
          placeholder="Contoh: Kota Padang"
          disabled={isPending}
        />
      </div>

      <div className="space-y-2">
        <label htmlFor="occupation" className="text-sm font-semibold text-[#332A35]">
          Pekerjaan
        </label>
        <Input
          id="occupation"
          name="occupation"
          value={form.occupation}
          onChange={handleChange}
          maxLength={100}
          placeholder="Masukkan pekerjaan"
          disabled={isPending}
        />
      </div>

      {message && (
        <p role="status" className="text-sm text-[#8E3E5E]">
          {message}
        </p>
      )}

      <Button
        type="submit"
        disabled={isPending}
        className="bg-[#B84E73] text-white hover:bg-[#8E3E5E]"
      >
        {isPending ? "Menyimpan..." : "Simpan Profil"}
      </Button>
    </form>
  );
}