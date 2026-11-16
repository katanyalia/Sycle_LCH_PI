import hashlib
import json
import logging
import re
from pathlib import Path

import fitz  # PyMuPDF

PROJECT_ROOT = Path(__file__).resolve().parent.parent
DOCUMENTS_DIR = PROJECT_ROOT / "data" / "processed" / "documents"
OUTPUT_DIR = PROJECT_ROOT / "data" / "processed" / "extracted"

# Halaman dengan teks di bawah batas ini ditandai sebagai kandidat OCR.
MIN_TEXT_CHARS = 40

logging.basicConfig(
    level=logging.INFO,
    format="%(levelname)s: %(message)s",
)
logger = logging.getLogger(__name__)


def get_document_id(filename: str) -> str:
    """Ambil ID dari prefix nama file, misalnya SRC-E04_dokumen.pdf."""
    match = re.match(r"^(SRC-[A-Z]\d+)(?:_|$)", filename, re.IGNORECASE)

    if match:
        return match.group(1).upper()

    # Fallback untuk nama file yang tidak memakai format SRC-...
    return Path(filename).stem


def extract_pdf(pdf_path: Path) -> dict:
    """Ekstrak teks setiap halaman dan tandai halaman yang perlu diperiksa."""
    pages = []
    ocr_candidate_pages = []

    with fitz.open(pdf_path) as document:
        for page_index, page in enumerate(document):
            page_number = page_index + 1
            text = page.get_text("text").strip()
            char_count = len(text)

            if char_count == 0:
                status = "empty"
                needs_ocr = True
            elif char_count < MIN_TEXT_CHARS:
                status = "too_little_text"
                needs_ocr = True
            else:
                status = "ok"
                needs_ocr = False

            if needs_ocr:
                ocr_candidate_pages.append(page_number)

            pages.append({
                "page": page_number,
                "text": text,
                "char_count": char_count,
                "status": status,
                "needs_ocr": needs_ocr,
            })

    checksum = hashlib.sha256(pdf_path.read_bytes()).hexdigest()

    return {
        "document_id": get_document_id(pdf_path.name),
        "filename": pdf_path.name,
        "file_path": str(pdf_path.relative_to(PROJECT_ROOT)),
        "file_checksum_sha256": checksum,
        "page_count": len(pages),
        "pages": pages,
        "ocr_candidate_pages": ocr_candidate_pages,
        "extraction_method": "pymupdf",
    }


def main() -> None:
    if not DOCUMENTS_DIR.exists():
        raise FileNotFoundError(
            f"Folder PDF tidak ditemukan: {DOCUMENTS_DIR}"
        )

    OUTPUT_DIR.mkdir(parents=True, exist_ok=True)
    pdf_files = sorted(DOCUMENTS_DIR.glob("*.pdf"))

    if not pdf_files:
        logger.warning("Tidak ada file PDF di %s", DOCUMENTS_DIR)
        return

    total_pages = 0
    total_candidates = 0

    for pdf_path in pdf_files:
        try:
            result = extract_pdf(pdf_path)

            output_path = OUTPUT_DIR / (
                f"{result['document_id']}.json"
            )

            output_path.write_text(
                json.dumps(result, ensure_ascii=False, indent=2),
                encoding="utf-8",
            )

            candidate_count = len(result["ocr_candidate_pages"])
            total_pages += result["page_count"]
            total_candidates += candidate_count

            logger.info(
                "%s: %s halaman, %s kandidat OCR -> %s",
                pdf_path.name,
                result["page_count"],
                candidate_count,
                output_path.name,
            )

        except Exception:
            logger.exception("Gagal mengekstrak %s", pdf_path.name)

    logger.info(
        "Selesai. Total halaman: %s; kandidat OCR: %s",
        total_pages,
        total_candidates,
    )


if __name__ == "__main__":
    main()