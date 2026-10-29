from dotenv import load_dotenv
from supabase import create_client
import os

from pathlib import Path

PROJECT_ROOT = Path(__file__).resolve().parent.parent
load_dotenv(PROJECT_ROOT / ".env")


def main():
    url = os.getenv("SUPABASE_URL")
    key = os.getenv("SUPABASE_SERVICE_ROLE_KEY")

    if not url or not key:
        print("Gagal: konfigurasi Supabase belum lengkap.")
        return

    try:
        client = create_client(url, key)

        # Membaca maksimal satu record tanpa mencetak isi datanya.
        client.table("evidence_registry").select("source_code").limit(1).execute()

        print("Berhasil: koneksi ke Supabase berjalan.")
        print("Tabel evidence_registry dapat diakses.")

    except Exception as error:
        print("Koneksi Supabase gagal.")
        print("Jenis error:", type(error).__name__)
        print("Kode error:", getattr(error, "code", "Tidak tersedia"))
        print("Pesan error:", getattr(error, "message", "Tidak tersedia"))
        print("Detail:", getattr(error, "details", None))
        print("Hint:", getattr(error, "hint", None))
        raise SystemExit(1)


if __name__ == "__main__":
    main()