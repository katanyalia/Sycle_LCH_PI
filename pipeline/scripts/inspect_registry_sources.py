from src.supabase_client import get_supabase_client

supabase = get_supabase_client()

response = (
    supabase.table("evidence_registry")
    .select("source_code, title, verification_scope, source_url")
    .execute()
)

rows = response.data or []

source_pdf = [
    row for row in rows
    if "PDF" in (row.get("verification_scope") or "").upper()
]

source_web = [
    row for row in rows
    if "PDF" not in (row.get("verification_scope") or "").upper()
]

print("Total sumber:", len(rows))
print("Jumlah data PDF:", len(source_pdf))
print("Jumlah data bukan PDF:", len(source_web))

print("\n--- Contoh sumber PDF ---")
for row in source_pdf[:3]:
    print(
        row.get("source_code"),
        "|", row.get("verification_scope"),
        "|", row.get("source_url")
    )

print("\n--- Contoh sumber bukan PDF ---")
for row in source_web[:3]:
    print(
        row.get("source_code"),
        "|", row.get("verification_scope"),
        "|", row.get("source_url")
    )