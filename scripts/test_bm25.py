import json
import re
from pathlib import Path

from rank_bm25 import BM25Okapi


PROJECT_ROOT = Path(__file__).resolve().parent.parent
EXTRACTED_DIR = PROJECT_ROOT / "data" / "processed" / "extracted"

# Uji awal menggunakan satu dokumen yang sudah dipilih tim.
SOURCE_CODES = ["SRC-P05"]

# Panjang minimum paragraf agar teks pendek seperti nomor halaman
# atau judul bagian tidak mendominasi hasil pencarian.
MIN_PARAGRAPH_LENGTH = 80


def tokenize(text: str) -> list[str]:
    """Tokenisasi sederhana untuk pencarian BM25."""
    return re.findall(r"\b[a-zA-Z0-9]+\b", text.lower())


def load_passages():
    passages = []

    for source_code in SOURCE_CODES:
        file_path = EXTRACTED_DIR / f"{source_code}.json"

        if not file_path.exists():
            print(f"Peringatan: file tidak ditemukan: {file_path.name}")
            continue

        data = json.loads(file_path.read_text(encoding="utf-8"))

        for page_data in data.get("pages", []):
            page_number = page_data.get("page")
            page_text = page_data.get("text", "")

            # Pisahkan teks halaman berdasarkan baris kosong.
            paragraphs = re.split(r"\n\s*\n", page_text)

            for paragraph in paragraphs:
                text = " ".join(paragraph.split())

                if len(text) < MIN_PARAGRAPH_LENGTH:
                    continue

                tokens = tokenize(text)

                if not tokens:
                    continue

                passages.append({
                    "source_code": source_code,
                    "page": page_number,
                    "text": text,
                    "tokens": tokens,
                })

    return passages


def search(query: str, top_k: int = 5):
    passages = load_passages()

    if not passages:
        print("Tidak ada potongan teks yang dapat dicari.")
        return

    tokenized_corpus = [passage["tokens"] for passage in passages]
    bm25 = BM25Okapi(tokenized_corpus)

    query_tokens = tokenize(query)

    if not query_tokens:
        print("Pertanyaan tidak memiliki kata yang dapat dicari.")
        return

    scores = bm25.get_scores(query_tokens)

    ranked_results = sorted(
        zip(scores, passages),
        key=lambda item: item[0],
        reverse=True,
    )

    print(f"\nPertanyaan: {query}")
    print(f"Jumlah kandidat: {len(passages)}")
    print(f"Menampilkan maksimal {top_k} hasil teratas.\n")

    shown = 0

    for score, passage in ranked_results:
        # Skor nol tidak menunjukkan kecocokan istilah yang ditemukan BM25.
        if score <= 0:
            continue

        shown += 1

        print("=" * 80)
        print(f"Peringkat       : {shown}")
        print(f"Skor BM25       : {score:.4f}")
        print(f"Kode sumber     : {passage['source_code']}")
        print(f"Halaman         : {passage['page']}")
        print(f"Cuplikan teks   : {passage['text'][:700]}")

        if shown >= top_k:
            break

    if shown == 0:
        print("Tidak ditemukan kandidat dengan skor BM25 di atas nol.")


if __name__ == "__main__":
    question = input(
        "Masukkan pertanyaan SYCLE: "
    ).strip()

    if not question:
        print("Pertanyaan tidak boleh kosong.")
    else:
        search(question, top_k=5)