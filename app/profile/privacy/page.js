import Link from "next/link";

export default function PrivacyPage() {
  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-10">
      <Link
        href="/profile"
        className="text-sm font-medium text-[#8E3E5E] hover:underline"
      >
        ← Kembali ke Profil
      </Link>

      <h1 className="mt-5 text-2xl font-bold text-[#332A35]">
        Privasi dan Data
      </h1>

      <p className="mt-3 leading-7 text-[#6B606B]">
        Sycle membantu pengguna memahami konteks lingkungan dan
        kesehatan reproduksi. Kami berupaya menjaga informasi pengguna
        dan menjelaskan penggunaan data secara transparan.
      </p>

      <section className="mt-6 space-y-5 rounded-2xl border border-[#E9F2EA] bg-white p-6">
        <div>
          <h2 className="font-semibold text-[#332A35]">
            Informasi yang digunakan
          </h2>
          <p className="mt-1 text-sm leading-6 text-[#6B606B]">
            Informasi profil, jawaban assessment, dan data lingkungan
            dapat digunakan untuk menyediakan fitur Sycle sesuai
            kebutuhan aplikasi.
          </p>
        </div>

        <div>
          <h2 className="font-semibold text-[#332A35]">
            Lokasi dan data lingkungan
          </h2>
          <p className="mt-1 text-sm leading-6 text-[#6B606B]">
            Lokasi digunakan untuk membantu menampilkan informasi
            lingkungan yang relevan. Pengguna dapat memilih lokasi
            secara manual apabila tidak ingin menggunakan GPS.
          </p>
        </div>

        <div>
          <h2 className="font-semibold text-[#332A35]">
            Kendali atas data
          </h2>
          <p className="mt-1 text-sm leading-6 text-[#6B606B]">
            Jangan memasukkan informasi sensitif yang tidak diperlukan.
            Pengaturan akun dan pengelolaan data perlu mengikuti fitur
            yang benar-benar tersedia pada aplikasi.
          </p>
        </div>
      </section>

      <p className="mt-5 text-xs leading-5 text-[#6B606B]">
        Informasi ini merupakan penjelasan awal dan perlu disesuaikan
        dengan implementasi penyimpanan, pemrosesan, serta kebijakan
        privasi Sycle yang sebenarnya.
      </p>
    </main>
  );
}