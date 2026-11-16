"use client";

import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";

// Kolom password dengan tombol mata untuk menampilkan/menyembunyikan isi.
export default function PasswordInput({ id, className = "", ...props }) {
  const [visible, setVisible] = useState(false);

  return (
    <div className="relative">
      <input
        id={id}
        type={visible ? "text" : "password"}
        className={`w-full rounded-xl border border-[#E5CCD7] bg-white py-3 pl-4 pr-12 text-sm text-[#332A35] outline-none transition focus:border-[#B84E73] focus:ring-2 focus:ring-[#F8E8EF] ${className}`}
        {...props}
      />
      <button
        type="button"
        onClick={() => setVisible((value) => !value)}
        aria-label={visible ? "Sembunyikan password" : "Tampilkan password"}
        aria-controls={id}
        aria-pressed={visible}
        className="absolute right-2 top-1/2 flex size-9 -translate-y-1/2 items-center justify-center rounded-lg text-[#8A7A85] transition hover:bg-[#F8E8EF] hover:text-[#8E3E5E]"
      >
        {visible ? <EyeOff size={18} aria-hidden="true" /> : <Eye size={18} aria-hidden="true" />}
      </button>
    </div>
  );
}
