import os
import sys

from src.config import PROJECT_ROOT


REQUIRED_VARIABLES = [
    "SUPABASE_URL",
    "SUPABASE_SERVICE_ROLE_KEY",
]


def main() -> int:
    missing = [
        name
        for name in REQUIRED_VARIABLES
        if not os.getenv(name)
    ]

    if missing:
        print("Konfigurasi belum lengkap:")
        for name in missing:
            print(f"- {name}")
        print("Isi variabel tersebut di .env atau GitHub Secrets.")
        return 1

    print("Konfigurasi variabel wajib tersedia.")
    print(f"Project root: {PROJECT_ROOT}")
    return 0


if __name__ == "__main__":
    sys.exit(main())