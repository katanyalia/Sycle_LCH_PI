import { Check, X } from "lucide-react";
import { checkPassword } from "@/lib/auth/passwordRules";

// Daftar syarat password yang berubah langsung saat pengguna mengetik.
export default function PasswordChecklist({ value }) {
  const rules = checkPassword(value);

  return (
    <ul className="mt-3 space-y-1.5" aria-label="Syarat password">
      {rules.map((rule) => (
        <li
          key={rule.id}
          className={`flex items-center gap-2 text-xs font-semibold ${
            rule.passed ? "text-[#2F6B3A]" : "text-[#8A7A85]"
          }`}
        >
          {rule.passed ? <Check size={14} aria-hidden="true" /> : <X size={14} aria-hidden="true" />}
          <span>{rule.label}</span>
          <span className="sr-only">{rule.passed ? "terpenuhi" : "belum terpenuhi"}</span>
        </li>
      ))}
    </ul>
  );
}
