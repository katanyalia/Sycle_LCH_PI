from src.web_fetcher import fetch_webpage

source_web = {
    "source_code": "TEST-WEB-001",
    "title": "Python Official Website",
    "url": "https://www.python.org/",
}

try:
    result = fetch_webpage(source_web)

    print("Status: BERHASIL")
    print("Judul:", result.get("title"))
    print("URL:", result.get("url"))
    print("Waktu pengambilan:", result.get("retrieved_at"))
    print("Panjang teks:", len(result.get("text", "")))
    print("\nCuplikan teks:")
    print(result.get("text", "")[:500])

except Exception as error:
    print("Status: GAGAL")
    print("Jenis error:", type(error).__name__)
    print("Pesan:", error)