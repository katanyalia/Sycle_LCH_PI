import json
import re
from pathlib import Path

PROJECT_ROOT = Path(__file__).resolve().parent.parent

INPUT_DIR = PROJECT_ROOT / "data" / "processed" / "merged"
OUTPUT_FILE = PROJECT_ROOT / "data" / "processed" / "chunks.jsonl"

CHUNK_SIZE = 900
CHUNK_OVERLAP = 150

EXCLUDED_URL_SOURCES = {
    "SRC-E07",
    "SRC-M03",
    "SRC-MN01",
    "SRC-P05",
}


def clean_text(text: str) -> str:
    """Membersihkan whitespace tanpa mengubah isi substantif."""
    text = text.replace("\x00", " ")
    text = re.sub(r"[ \t]+", " ", text)
    text = re.sub(r"\n[ \t]+", "\n", text)
    text = re.sub(r"\n{3,}", "\n\n", text)
    return text.strip()


def split_into_chunks(text: str) -> list[str]:
    """
    Membagi teks menjadi chunk maksimal 900 karakter,
    dengan overlap 150 karakter.
    """
    text = clean_text(text)

    if not text:
        return []

    chunks = []
    start = 0
    step = CHUNK_SIZE - CHUNK_OVERLAP

    while start < len(text):
        end = min(start + CHUNK_SIZE, len(text))

        # Utamakan batas kalimat atau spasi jika memungkinkan.
        if end < len(text):
            minimum_end = start + int(CHUNK_SIZE * 0.7)
            candidates = [
                text.rfind(". ", minimum_end, end),
                text.rfind("? ", minimum_end, end),
                text.rfind("! ", minimum_end, end),
                text.rfind("\n", minimum_end, end),
                text.rfind(" ", minimum_end, end),
            ]
            best_end = max(candidates)

            if best_end > start:
                end = best_end + 1

        chunk = text[start:end].strip()

        if chunk:
            chunks.append(chunk)

        if end >= len(text):
            break

        # Pastikan selalu bergerak maju, termasuk jika pemisahan
        # kalimat mengubah posisi akhir chunk.
        next_start = end - CHUNK_OVERLAP
        start = max(start + 1, next_start)

    return chunks


def make_metadata(record: dict, page_number=None) -> dict:
    return {
        "document_id": record.get("document_id"),
        "source_code": record.get("source_code"),
        "record_id": record.get("record_id"),
        "source_type": record.get("source_type"),
        "title": record.get("title"),
        "publisher": record.get("publisher"),
        "publication_year": record.get("publication_year"),
        "source_url": record.get("source_url"),
        "page_number": page_number,
    }


def main():
    if not INPUT_DIR.exists():
        raise FileNotFoundError(
            f"Folder input tidak ditemukan: {INPUT_DIR}"
        )

    files = sorted(INPUT_DIR.glob("*.json"))

    if not files:
        raise FileNotFoundError(
            f"Tidak ada file JSON di {INPUT_DIR}"
        )

    OUTPUT_FILE.parent.mkdir(parents=True, exist_ok=True)

    total_documents = 0
    total_chunks = 0
    skipped_pages = 0
    skipped_urls = 0
    chunk_id = 0

    with OUTPUT_FILE.open("w", encoding="utf-8") as output:
        for path in files:
            try:
                with path.open("r", encoding="utf-8") as file:
                    record = json.load(file)
            except (OSError, json.JSONDecodeError) as error:
                print(f"[GAGAL] {path.name}: {error}")
                continue

            source_code = record.get(
                "source_code",
                record.get("document_id", path.stem),
            )
            source_type = record.get("source_type")

            if (
                source_type == "URL"
                and source_code in EXCLUDED_URL_SOURCES
            ):
                skipped_urls += 1
                print(f"[LEWATI URL] {source_code}")
                continue

            record_chunks = 0

            if source_type == "PDF":
                for page in record.get("pages", []):
                    page_number = page.get("page_number")

                    if page_number is None:
                        page_number = page.get("page")

                    text = clean_text(page.get("text", ""))

                    if not text:
                        skipped_pages += 1
                        continue

                    metadata = make_metadata(
                        record,
                        page_number=page_number,
                    )

                    for index, chunk_text in enumerate(
                        split_into_chunks(text)
                    ):
                        item = {
                            "chunk_id": f"chunk_{chunk_id:06d}",
                            "chunk_index": index,
                            "text": chunk_text,
                            "metadata": metadata,
                        }

                        output.write(
                            json.dumps(item, ensure_ascii=False) + "\n"
                        )
                        chunk_id += 1
                        total_chunks += 1
                        record_chunks += 1

            elif source_type == "URL":
                text = clean_text(record.get("text", ""))

                if not text:
                    print(f"[LEWATI URL KOSONG] {source_code}")
                    continue

                metadata = make_metadata(record)

                for index, chunk_text in enumerate(
                    split_into_chunks(text)
                ):
                    item = {
                        "chunk_id": f"chunk_{chunk_id:06d}",
                        "chunk_index": index,
                        "text": chunk_text,
                        "metadata": metadata,
                    }

                    output.write(
                        json.dumps(item, ensure_ascii=False) + "\n"
                    )
                    chunk_id += 1
                    total_chunks += 1
                    record_chunks += 1

            else:
                print(
                    f"[LEWATI] {path.name}: "
                    f"source_type tidak dikenal ({source_type})"
                )
                continue

            total_documents += 1
            print(
                f"[OK] {path.name}: "
                f"{record_chunks} chunk"
            )

    print("\n=== RINGKASAN CHUNKING ===")
    print(f"File sumber diproses : {total_documents}")
    print(f"Total chunk          : {total_chunks}")
    print(f"Halaman kosong dilewati: {skipped_pages}")
    print(f"URL dikecualikan     : {skipped_urls}")
    print(f"Ukuran chunk         : {CHUNK_SIZE}")
    print(f"Overlap              : {CHUNK_OVERLAP}")
    print(f"Output               : {OUTPUT_FILE}")


if __name__ == "__main__":
    main()