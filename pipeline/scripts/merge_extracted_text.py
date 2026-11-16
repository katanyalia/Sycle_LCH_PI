import json
import re
import sys
from datetime import datetime, timezone
from pathlib import Path

PROJECT_ROOT = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(PROJECT_ROOT))

from src.config import PROJECT_ROOT

EXTRACTED_DIR = PROJECT_ROOT / "data" / "processed" / "extracted"
URL_DIR = PROJECT_ROOT / "data" / "processed" / "url_extracted"
OCR_DIR = PROJECT_ROOT / "data" / "processed" / "ocr"
OUTPUT_DIR = PROJECT_ROOT / "data" / "processed" / "merged"

# Empat URL yang sementara tidak digunakan untuk pemrosesan konten.
EXCLUDED_URL_SOURCES = {
    "SRC-E07",
    "SRC-M03",
    "SRC-MN01",
    "SRC-P05",
}

BLOCKED_TEXT_PATTERNS = [
    r"checking your browser before accessing",
    r"cookies must be enabled",
    r"enable cookies for .* and reload",
]


def read_json(path: Path) -> dict:
    with path.open("r", encoding="utf-8") as file:
        return json.load(file)


def write_json(path: Path, data: dict) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    with path.open("w", encoding="utf-8") as file:
        json.dump(data, file, ensure_ascii=False, indent=2)


def clean_text(text: str) -> str:
    """Normalisasi whitespace tanpa menghapus isi substantif."""
    text = text.replace("\x00", " ")
    text = re.sub(r"[ \t]+", " ", text)
    text = re.sub(r"\n[ \t]+", "\n", text)
    text = re.sub(r"\n{3,}", "\n\n", text)
    return text.strip()


def is_blocked_text(text: str) -> bool:
    normalized = text.lower()
    return any(
        re.search(pattern, normalized)
        for pattern in BLOCKED_TEXT_PATTERNS
    )


def load_ocr_pages(source_code: str) -> dict[int, str]:
    """
    Membaca hasil OCR jika tersedia.

    Format yang didukung:
    {"pages": [{"page": 1, "text": "..."}]}
    atau daftar halaman dengan field page_number.
    """
    candidates = [
        OCR_DIR / f"{source_code}.json",
        OCR_DIR / f"{source_code}_ocr.json",
    ]

    for path in candidates:
        if not path.exists():
            continue

        try:
            data = read_json(path)
        except (json.JSONDecodeError, OSError) as error:
            print(f"  Peringatan OCR {path.name}: {error}")
            continue

        pages = data.get("pages", [])
        result = {}

        if isinstance(pages, list):
            for item in pages:
                if not isinstance(item, dict):
                    continue

                page_number = item.get(
                    "page",
                    item.get("page_number"),
                )
                text = item.get("text", "")

                if page_number is None or not isinstance(text, str):
                    continue

                text = clean_text(text)
                if text:
                    result[int(page_number)] = text

        return result

    return {}


def merge_pdf(path: Path) -> dict:
    data = read_json(path)
    source_code = data.get(
        "document_id",
        path.stem,
    )

    ocr_pages = load_ocr_pages(source_code)
    merged_pages = []
    ocr_selected = 0
    empty_pages = 0

    for page_data in data.get("pages", []):
        page_number = page_data.get("page")
        pdf_text = clean_text(page_data.get("text", ""))
        selected_text = pdf_text
        extraction_method = "pymupdf"

        # OCR dipilih hanya untuk halaman yang ditandai perlu OCR.
        if page_data.get("needs_ocr") and page_number is not None:
            ocr_text = ocr_pages.get(int(page_number), "")

            # Jangan menggandakan teks PDF dan OCR.
            if ocr_text and len(ocr_text) > len(pdf_text):
                selected_text = ocr_text
                extraction_method = "ocr"
                ocr_selected += 1

        if not selected_text:
            empty_pages += 1

        merged_pages.append({
            "page_number": page_number,
            "text": selected_text,
            "char_count": len(selected_text),
            "extraction_method": extraction_method,
            "needs_review": not bool(selected_text),
        })

    return {
        "record_id": f"{source_code}__PDF",
        "document_id": source_code,
        "source_code": source_code,
        "source_type": "PDF",
        "title": data.get("title") or data.get("filename", path.stem),
        "publisher": data.get("publisher"),
        "publication_year": data.get("publication_year"),
        "source_url": data.get("source_url"),
        "filename": data.get("filename"),
        "file_path": data.get("file_path"),
        "file_checksum_sha256": data.get("file_checksum_sha256"),
        "page_count": data.get("page_count", len(merged_pages)),
        "pages": merged_pages,
        "merge_metadata": {
            "merged_at": datetime.now(timezone.utc).isoformat(),
            "ocr_pages_selected": ocr_selected,
            "empty_pages": empty_pages,
        },
    }


def merge_url(path: Path) -> tuple[dict | None, str]:
    data = read_json(path)
    source_code = data.get("source_code") or data.get(
        "document_id",
        path.stem,
    )
    text = clean_text(data.get("text", ""))

    if source_code in EXCLUDED_URL_SOURCES:
        return None, "dikecualikan sementara"

    if is_blocked_text(text):
        return None, "teks penghalang akses"

    if not text:
        return None, "teks kosong"

    if data.get("extraction_status") != "success":
        return None, "status ekstraksi bukan success"

    record = {
        "record_id": f"{source_code}__URL",
        "document_id": source_code,
        "source_code": source_code,
        "source_type": "URL",
        "title": data.get("title"),
        "publisher": data.get("publisher"),
        "publication_year": data.get("publication_year"),
        "source_url": data.get("url"),
        "retrieved_at": data.get("retrieved_at"),
        "text": text,
        "char_count": len(text),
        "merge_metadata": {
            "merged_at": datetime.now(timezone.utc).isoformat(),
        },
    }

    return record, "berhasil"


def main() -> int:
    OUTPUT_DIR.mkdir(parents=True, exist_ok=True)

    # Bersihkan hanya output JSON hasil merge sebelumnya.
    # File hasil ekstraksi asli tidak disentuh.
    for path in OUTPUT_DIR.glob("*.json"):
        path.unlink()

    pdf_files = sorted(EXTRACTED_DIR.glob("*.json"))
    url_files = sorted(URL_DIR.glob("*.json"))

    pdf_success = 0
    url_success = 0
    url_skipped = 0
    pages_total = 0
    chars_total = 0

    print("=== MERGE PDF ===")

    for path in pdf_files:
        try:
            record = merge_pdf(path)
            output_path = OUTPUT_DIR / f"{record['record_id']}.json"
            write_json(output_path, record)

            pdf_success += 1
            pages_total += len(record["pages"])
            chars_total += sum(
                page["char_count"] for page in record["pages"]
            )

            print(
                f"[OK] {path.name}: "
                f"{len(record['pages'])} halaman"
            )

        except (OSError, json.JSONDecodeError, TypeError, ValueError) as error:
            print(f"[GAGAL] PDF {path.name}: {error}")

    print("\n=== MERGE URL ===")

    for path in url_files:
        try:
            record, status = merge_url(path)

            if record is None:
                url_skipped += 1
                print(f"[LEWATI] {path.name}: {status}")
                continue

            output_path = OUTPUT_DIR / f"{record['record_id']}.json"
            write_json(output_path, record)

            url_success += 1
            chars_total += record["char_count"]

            print(
                f"[OK] {path.name}: "
                f"{record['char_count']} karakter"
            )

        except (OSError, json.JSONDecodeError, TypeError, ValueError) as error:
            url_skipped += 1
            print(f"[GAGAL] URL {path.name}: {error}")

    print("\n=== RINGKASAN MERGE ===")
    print(f"File PDF berhasil : {pdf_success}")
    print(f"File URL berhasil : {url_success}")
    print(f"File URL dilewati : {url_skipped}")
    print(f"Total halaman PDF : {pages_total}")
    print(f"Total karakter    : {chars_total}")
    print(f"Folder output     : {OUTPUT_DIR}")

    return 0


if __name__ == "__main__":
    raise SystemExit(main())