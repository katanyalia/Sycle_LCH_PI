import json
from pathlib import Path

PROJECT_ROOT = Path(__file__).resolve().parent.parent
INPUT_DIR = PROJECT_ROOT / "data" / "processed" / "url_extracted"

MIN_REVIEW_CHARS = 500


def main():
    if not INPUT_DIR.exists():
        print(f"Folder tidak ditemukan: {INPUT_DIR}")
        return

    files = sorted(INPUT_DIR.glob("*.json"))

    if not files:
        print("Belum ada file JSON hasil ekstraksi URL.")
        return

    needs_review = []
    valid = 0

    for file_path in files:
        try:
            data = json.loads(file_path.read_text(encoding="utf-8"))
            content = " ".join((data.get("text") or "").split())
            char_count = len(content)

            if char_count < MIN_REVIEW_CHARS:
                needs_review.append(
                    (file_path.name, char_count, data.get("url", ""))
                )
            else:
                valid += 1

        except (json.JSONDecodeError, OSError) as exc:
            print(f"ERROR: {file_path.name}: {exc}")

    print(f"\nTotal file JSON: {len(files)}")
    print(f"Konten >= {MIN_REVIEW_CHARS} karakter: {valid}")
    print(f"Perlu ditinjau: {len(needs_review)}")

    if needs_review:
        print("\nDaftar sumber yang perlu diperiksa:")

        for filename, char_count, url in needs_review:
            print(f"- {filename}: {char_count} karakter")
            print(f"  URL: {url}")


if __name__ == "__main__":
    main()