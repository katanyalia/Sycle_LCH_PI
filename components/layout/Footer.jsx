"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

// Disclaimer tidak-diagnostik di bagian bawah semua tampilan (Master V2.1 FR-17, AC-27).
// Di halaman Healthcare, tautan [Lihat Healthcare] tidak ditampilkan karena pengguna sudah di sana.
export default function Footer() {
  const pathname = usePathname();
  const onHealthcare = pathname?.startsWith("/healthcare");

  return (
    <footer className="footer">
      <div className="footer-main">
        {/* IDENTITAS SYCLE */}
        <div className="footer-brand">
          <span className="footer-logo" translate="no">Sycle</span>
          <p>
            Lingkungan, tubuh, dan cerita harianmu.
          </p>
        </div>

        {/* INFORMASI */}
        <div className="footer-info">
          <p className="footer-disclaimer">
            SYCLE tidak memberikan diagnosis. Informasi di sini bersifat
            edukatif dan tidak menggantikan saran tenaga kesehatan.
            {!onHealthcare && (
              <>
                {" "}
                <Link href="/healthcare" className="footer-healthcare-link">
                  Lihat Healthcare →
                </Link>
              </>
            )}
          </p>
        </div>
      </div>

      {/* COPYRIGHT */}
      <div className="footer-bottom">
        <span>© 2026 <span translate="no">Sycle</span></span>
        <span>
          Edukasi kesehatan reproduksi perempuan
        </span>
      </div>
    </footer>
  );
}