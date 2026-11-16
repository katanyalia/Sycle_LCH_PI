from src.supabase_client import get_supabase_client

supabase = get_supabase_client()

response = (
    supabase.table("evidence_registry")
    .select(
        "source_code, title, source_url, access_license, "
        "status_v21, verification_scope, interpretation_limit"
    )
    .not_.is_("source_url", "null")
    .limit(10)
    .execute()
)

sources = response.data or []

web_sources = [
    source
    for source in sources
    if (source.get("source_url") or "").startswith(("http://", "https://"))
]

print("Jumlah sumber dengan URL HTTP/HTTPS:", len(web_sources))

for source in web_sources:
    print("\nKode:", source.get("source_code"))
    print("Judul:", source.get("title"))
    print("URL:", source.get("source_url"))
    print("Status review:", source.get("status_v21"))