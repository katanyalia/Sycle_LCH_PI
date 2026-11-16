import Image from "next/image";
import { useRouter } from "next/navigation";
import "./HeroSection.css";
import { Button } from "@/components/ui/button";

export default function HeroSection({ onStartCheckin }) {
  const router = useRouter();

  function goToGeneralGuidance() {
    router.push("/generalguidance");
  }

  return (
    <section className="hero">
      <div>
        <div className="eyebrow">
          Kesehatan perempuan & lingkungan
        </div>

        <h1>
          Kenali lingkunganmu, proteksi awalmu.
        </h1>

        <p className="lead">
          Lihat kondisi lingkungan di lokasi pilihanmu, pahami artinya,
          dan temukan langkah perlindungan yang sesuai dengan rencanamu.
        </p>
        
        <div className="actions">
          <Button
            size="lg"
            onClick={goToGeneralGuidance}
            className="hero-button"
          >
            Lihat Kondisi Hari Ini ↓
          </Button>
        </div>

      </div>

      <div className="hero-art">
        <Image
          src="/brand/hero-women.webp"
          alt="Ilustrasi empat perempuan duduk berangkulan sambil tersenyum"
          width={1200}
          height={699}
          priority
          sizes="(max-width: 700px) 100vw, 45vw"
          className="hero-illustration"
        />

        <div className="float-card float-top">
          ☀️ Lingkungan hari ini
        </div>

        <div className="float-card float-bottom">
          ♡ Catatan tubuhmu
        </div>
      </div>
    </section>
  );
}