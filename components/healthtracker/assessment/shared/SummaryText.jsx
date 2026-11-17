// Menampilkan teks ringkasan; bagian **...** ditebalkan (cerita pengguna).
export default function SummaryText({ text }) {
  if (typeof text !== "string" || !text) return null;

  return text.split(/(\*\*[^*]+\*\*)/g).map((part, index) =>
    part.startsWith("**") && part.endsWith("**") ? (
      <strong key={index} className="font-semibold text-[#332A35]">
        {part.slice(2, -2)}
      </strong>
    ) : (
      part
    )
  );
}
