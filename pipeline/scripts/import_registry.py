import pandas as pd

from src.config import PROJECT_ROOT
from src.logging_utils import setup_logging
from src.supabase_client import get_supabase_client


logger = setup_logging(__name__)

REGISTRY_PATH = (
    PROJECT_ROOT
    / "data"
    / "processed"
    / "SYCLE_Evidence_Registry_V2.1.xlsx"
)

TABLE_NAME = "evidence_registry"
UPSERT_BATCH_SIZE = 100

COLUMN_MAPPING = {
    "Kode": "source_code",
    "UUID sumber": "source_uuid",
    "Judul sumber": "title",
    "Organisasi / penulis": "publisher",
    "Tahun": "publication_year",
    "Pemakaian usulan": "proposed_use",
    "Cakupan verifikasi": "verification_scope",
    "Link pdf": "pdf_url",
    "Akses / lisensi": "access_license",
    "source_role": "source_role",
    "source_type": "source_type",
    "Topik usulan": "proposed_topic",
    "URL sumber": "source_url",
    "DOI": "doi",
    "Batas interpretasi": "interpretation_limit",
    "Catatan verifikasi": "verification_notes",
    "Review tim": "team_review_status",
    "Reviewer UUID": "reviewer_uuid",
    "Waktu review": "reviewed_at",
    "Peran SYCLE V2.1": "sycle_role",
    "Status V2.1": "status_v21",
}


def load_registry() -> list[dict]:
    """Baca dan validasi Excel evidence registry."""
    if not REGISTRY_PATH.is_file():
        raise FileNotFoundError(
            f"File registry tidak ditemukan: {REGISTRY_PATH}"
        )

    df = pd.read_excel(
        REGISTRY_PATH,
        sheet_name="Registry",
        header=5,
    )
    df.columns = [str(column).strip() for column in df.columns]

    for column in ("Kode", "Judul sumber"):
        if column not in df.columns:
            raise ValueError(f"Kolom wajib tidak ditemukan: {column}")

    df = df.dropna(subset=["Kode"]).copy()
    df["Kode"] = df["Kode"].astype(str).str.strip()

    if df["Kode"].eq("").any():
        raise ValueError("Ditemukan Kode sumber kosong.")

    if df["Kode"].duplicated().any():
        duplicates = df.loc[
            df["Kode"].duplicated(keep=False), "Kode"
        ].unique().tolist()
        raise ValueError(f"Kode sumber duplikat: {duplicates}")

    available = [
        column for column in COLUMN_MAPPING
        if column in df.columns
    ]
    df = df[available].rename(columns=COLUMN_MAPPING)

    records = []

    for record in df.to_dict(orient="records"):
        clean_record = {}

        for key, value in record.items():
            if pd.isna(value):
                value = None
            elif isinstance(value, pd.Timestamp):
                value = value.isoformat()
            elif hasattr(value, "item"):
                value = value.item()

            if isinstance(value, str):
                value = value.strip()
                if value in ("", "-"):
                    value = None

            if key == "publication_year" and value is not None:
                year = float(value)
                if not year.is_integer():
                    raise ValueError(
                        f"Tahun publikasi tidak valid: {value}"
                    )
                value = int(year)

            clean_record[key] = value

        records.append(clean_record)

    logger.info("Validated %s evidence sources", len(records))
    return records


def upsert_registry(records: list[dict]) -> None:
    """Masukkan atau perbarui sumber berdasarkan source_code."""
    if not records:
        logger.warning("Tidak ada sumber untuk diimpor.")
        return

    client = get_supabase_client()

    for start in range(0, len(records), UPSERT_BATCH_SIZE):
        batch = records[start:start + UPSERT_BATCH_SIZE]

        (
            client.table(TABLE_NAME)
            .upsert(batch, on_conflict="source_code")
            .execute()
        )

        logger.info(
            "Upsert berhasil: %s-%s dari %s sumber",
            start + 1,
            start + len(batch),
            len(records),
        )


def main() -> None:
    records = load_registry()

    print(f"File: {REGISTRY_PATH.name}")
    print(f"Jumlah sumber: {len(records)}")
    print(f"Tabel tujuan: {TABLE_NAME}")

    confirm = input(
        "Lanjutkan impor ke Supabase? Ketik YA untuk melanjutkan: "
    ).strip()

    if confirm != "YA":
        print("Impor dibatalkan.")
        return

    upsert_registry(records)
    logger.info("Evidence registry import completed.")


if __name__ == "__main__":
    main()