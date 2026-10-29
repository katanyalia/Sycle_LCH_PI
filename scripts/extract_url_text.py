import json
import logging
import sys
from datetime import datetime, timezone
from pathlib import Path

import pandas as pd

PROJECT_ROOT = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(PROJECT_ROOT))

from src.web_fetcher import fetch_webpage

REGISTRY_FILE = (
    PROJECT_ROOT
    / "data"
    / "processed"
    / "SYCLE_Evidence_Registry_V2.1.xlsx"
)

OUTPUT_DIR = PROJECT_ROOT / "data" / "processed" / "url_extracted"

logging.basicConfig(
    level=logging.INFO,
    format="%(levelname)s: %(message)s",
)

MIN_TEXT_CHARS = 100


def normalize_text(text):
    """Membersihkan spasi tanpa menggabungkan sumber yang berbeda."""
    return " ".join((text or "").split())


def main():
    if not REGISTRY_FILE.exists():
        logging.error("File registry tidak ditemukan: %s", REGISTRY_FILE)
        return

    OUTPUT_DIR.mkdir(parents=True, exist_ok=True)

    # Registry menggunakan header pada baris Excel ke-6.
    df = pd.read_excel(REGISTRY_FILE, sheet_name="Registry", header=5)
    df.columns = [str(col).strip() for col in df.columns]

    # Memetakan nama kolom Excel ke nama standar yang digunakan script.
    COLUMN_MAP = {
        "Kode": "source_code",
        "Judul sumber": "title",
        "Organisasi / penulis": "publisher",
        "Tahun": "publication_year",
        "URL sumber": "source_url",
    }

    missing = set(COLUMN_MAP.keys()) - set(df.columns)

    if missing:
        logging.error("Kolom registry tidak ditemukan: %s", sorted(missing))
        logging.info("Kolom tersedia: %s", list(df.columns))
        return

    df = df.rename(columns=COLUMN_MAP)

    success = 0
    failed = 0
    skipped = 0

    for _, row in df.iterrows():
        source_code = str(row.get("source_code", "")).strip()
        title = str(row.get("title", "")).strip()
        raw_url = row.get("source_url", "")

        if not source_code or source_code.lower() == "nan":
            skipped += 1
            continue

        if pd.isna(raw_url) or not str(raw_url).strip():
            skipped += 1
            continue

        url = str(raw_url).strip()

        # Hindari membaca ulang sumber yang sudah diekstrak.
        output_file = OUTPUT_DIR / f"{source_code}.json"

        try:
            if not url.startswith(("https://", "http://")):
                raise ValueError("URL harus menggunakan HTTP atau HTTPS")

            source = {
                "source_code": source_code,
                "document_id": source_code,
                "title": title,
                "url": url,
                "source_type": "URL",
                "publisher": str(row.get("publisher", "")),
                "publication_year": (
                    None
                    if pd.isna(row.get("publication_year"))
                    else str(row.get("publication_year"))
                ),
            }

            result = fetch_webpage(source, timeout=25)
            text = normalize_text(result.get("text", ""))

            if len(text) < MIN_TEXT_CHARS:
                raise ValueError(
                    f"Teks hasil ekstraksi terlalu pendek: {len(text)} karakter"
                )

            record = {
                **source,
                "text": text,
                "char_count": len(text),
                "retrieved_at": result.get(
                    "retrieved_at",
                    datetime.now(timezone.utc).isoformat(),
                ),
                "extraction_status": "success",
            }

            output_file.write_text(
                json.dumps(record, ensure_ascii=False, indent=2),
                encoding="utf-8",
            )

            success += 1
            logging.info(
                "Berhasil: %s | %s karakter | %s",
                source_code,
                len(text),
                title,
            )

        except Exception as exc:
            failed += 1
            logging.warning(
                "Gagal: %s | %s | %s",
                source_code,
                url,
                exc,
            )

    logging.info(
        "Selesai | berhasil: %s | gagal: %s | dilewati: %s",
        success,
        failed,
        skipped,
    )


if __name__ == "__main__":
    main()