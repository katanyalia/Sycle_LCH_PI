import hashlib
import re
from pathlib import Path

from google.oauth2 import service_account
from googleapiclient.discovery import build
from googleapiclient.http import MediaIoBaseDownload

from src.config import PROJECT_ROOT, get_required_env
from src.logging_utils import setup_logging


logger = setup_logging(__name__)

SCOPES = ["https://www.googleapis.com/auth/drive.readonly"]
CREDENTIALS_PATH = PROJECT_ROOT / "credentials" / "service-account.json"
OUTPUT_DIR = PROJECT_ROOT / "data" / "processed" / "documents"


def sha256_file(path: Path) -> str:
    """Hitung checksum SHA-256 file secara bertahap."""
    digest = hashlib.sha256()

    with path.open("rb") as file:
        for block in iter(lambda: file.read(1024 * 1024), b""):
            digest.update(block)

    return digest.hexdigest()


def safe_filename(filename: str) -> str:
    """Batasi nama file agar aman digunakan di filesystem."""
    return re.sub(r'[<>:"/\\|?*\x00-\x1f]', "_", filename)


def main():
    if not CREDENTIALS_PATH.is_file():
        raise FileNotFoundError(
            f"Kredensial tidak ditemukan: {CREDENTIALS_PATH}"
        )

    folder_id = get_required_env("GOOGLE_DRIVE_FOLDER_ID")

    credentials = (
        service_account.Credentials.from_service_account_file(
            str(CREDENTIALS_PATH),
            scopes=SCOPES,
        )
    )

    drive = build(
        "drive",
        "v3",
        credentials=credentials,
        cache_discovery=False,
    )

    OUTPUT_DIR.mkdir(parents=True, exist_ok=True)

    result = drive.files().list(
        q=f"'{folder_id}' in parents and trashed = false",
        fields="files(id,name,mimeType,size)",
        pageSize=100,
        orderBy="name",
    ).execute()

    files = result.get("files", [])
    pdfs = [
        item for item in files
        if item.get("mimeType") == "application/pdf"
    ]

    if not pdfs:
        print("Tidak ada PDF yang ditemukan.")
        return

    print(f"Jumlah PDF: {len(pdfs)}")
    print(f"Folder output: {OUTPUT_DIR}\n")

    for item in pdfs:
        file_id = item["id"]
        filename = safe_filename(item["name"])
        output_path = OUTPUT_DIR / filename
        temporary_path = output_path.with_suffix(
            output_path.suffix + ".part"
        )

        try:
            # Lewati download jika file lokal sudah identik.
            if output_path.is_file():
                existing_hash = sha256_file(output_path)
                drive_hash = item.get("sha256Checksum")

                if drive_hash and existing_hash == drive_hash:
                    print(f"SKIP: {filename} (tidak berubah)")
                    continue

            request = drive.files().get_media(fileId=file_id)

            with temporary_path.open("wb") as output_file:
                downloader = MediaIoBaseDownload(
                    output_file, request
                )
                done = False

                while not done:
                    _, done = downloader.next_chunk()

            if temporary_path.stat().st_size == 0:
                raise ValueError("File hasil download kosong.")

            temporary_path.replace(output_path)
            checksum = sha256_file(output_path)

            print(f"OK: {filename}")
            print(f"    Ukuran: {output_path.stat().st_size} bytes")
            print(f"    SHA-256: {checksum}")

        except Exception:
            temporary_path.unlink(missing_ok=True)
            logger.exception("Gagal mengunduh %s", filename)
            raise

    print("\nDownload PDF selesai.")


if __name__ == "__main__":
    main()