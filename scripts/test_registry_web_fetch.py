from src.supabase_client import get_supabase_client
from src.web_fetcher import fetch_webpage

supabase = get_supabase_client()

response = (
    supabase.table("evidence_registry")
    .select(
        "source_code, title, source_url, access_license, "
        "status_v21, verification_scope, interpretation_limit"
    )
    .eq("source_code", "SRC-P01")
    .limit(1)
    .execute()
)

sources = response.data or []

if not sources:
    raise ValueError("SRC-P01 tidak ditemukan di evidence_registry.")

source = sources[0]

print("Kode sumber:", source["source_code"])
print("Judul:", source["title"])
print("URL:", source["source_url"])
print("Cakupan verifikasi:", source["verification_scope"])
print("Status review:", source["status_v21"])

result = fetch_webpage({
    "source_code": source["source_code"],
    "title": source["title"],
    "url": source["source_url"],
})

print("\nStatus fetch: BERHASIL")
print("Panjang teks:", len(result.get("text", "")))
print("Waktu pengambilan:", result.get("retrieved_at"))
print("\nCuplikan teks:")
print(result.get("text", "")[:500])