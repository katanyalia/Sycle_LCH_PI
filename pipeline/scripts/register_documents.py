import hashlib
import re
from pathlib import Path

from src.config import PROJECT_ROOT
from src.logging_utils import setup_logging
from src.supabase_client import get_supabase_client

logger = setup_logging(__name__)

DOCUMENTS_DIR = PROJECT_ROOT / "data" / "processed" / "documents"

# Kode sumber dipetakan dari awalan nama file PDF.
SOURCE_CODES = [
    "SRC-E04",
    "SRC-E06",
    "SRC-M01",
    "SRC-M05",
    "SRC-P03",
    "SRC-P05",
    "SRC-P07",
    "SRC-P08",
]


def sha256_file(path: Path) -> str:
    digest = hashlib.sha256()
    with path.open("rb") as file:
        for block in iter(lambda: file.read(1024 * 1024), b""):
            digest.update(block)
    return digest.hexdigest()


def main():
    if not DOCUMENTS_DIR.is_dir():
        raise FileNotFoundError(
            f"Folder dokumen tidak ditemukan: {DOCUMENTS_DIR}"
        )

    client = get_supabase_client()

    # Ambil metadata sumber dari registry, bukan menebak UUID.
    response = (
        client.table("evidence_registry")
        .select(
            "source_code,source_uuid,title,publisher,"
            "publication_year,source_type,proposed_topic,"
            "source_url"
        )
        .in_("source_code", SOURCE_CODES)
        .execute()
    )

    sources = {
        row["source_code"]: row
        for row in (response.data or [])
    }

    missing_codes = sorted(set(SOURCE_CODES) - set(sources))
    if missing_codes:
        raise ValueError(
            f"Kode sumber tidak ditemukan di evidence_registry: "
            f"{missing_codes}"
        )

    pdf_files = sorted(DOCUMENTS_DIR.glob("*.pdf"))

    if len(pdf_files) != len(SOURCE_CODES):
        raise ValueError(
            f"Ditemukan {len(pdf_files)} PDF, "
            f"sedangkan {len(SOURCE_CODES)} sumber diharapkan."
        )

    records = []

    for pdf_path in pdf_files:
        match = re.match(r"^(SRC-[A-Z]\d+)_", pdf_path.name)
        if not match:
            raise ValueError(
                f"Nama file tidak diawali kode sumber: {pdf_path.name}"
            )

        source_code = match.group(1)
        source = sources.get(source_code)

        if not source:
            raise ValueError(
                f"Tidak ada sumber terdaftar untuk {pdf_path.name}"
            )

        checksum = sha256_file(pdf_path)
        drive_file_id = None

        record = {
            "document_id": source_code,
            "source_uuid": source["source_uuid"],
            "title": source["title"],
            "original_filename": pdf_path.name,
            "publisher": source.get("publisher"),
            "publication_year": source.get("publication_year"),
            "document_type": "pdf",
            "category": source.get("source_type"),
            "subcategory": source.get("proposed_topic"),
            "language": "id",
            "drive_url": source.get("source_url"),
            "processing_status": "pending",
            "checksum_sha256": checksum,
        }

        records.append(record)

    # Tampilkan rencana terlebih dahulu; belum menulis ke database.
    print(f"PDF lokal: {len(pdf_files)}")
    print(f"Metadata siap diperiksa: {len(records)}\n")

    for record in records:
        print(
            f"- {record['document_id']} | "
            f"{record['original_filename']} | "
            f"SHA-256: {record['checksum_sha256'][:16]}..."
        )

    confirmation = input(
        "\nKetik YA untuk mendaftarkan dokumen ke Supabase: "
    ).strip()

    if confirmation != "YA":
        print("Dibatalkan. Tidak ada perubahan ke database.")
        return

    # Upsert membuat skrip dapat dijalankan ulang.
    # drive_file_id akan diisi pada langkah integrasi berikutnya.
    for record in records:
        client.table("document_registry").upsert(
            record,
            on_conflict="document_id",
        ).execute()

    print(
        f"\nBerhasil mendaftarkan {len(records)} dokumen "
        "ke document_registry."
    )


if __name__ == "__main__":
    main()