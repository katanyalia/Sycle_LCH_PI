from pathlib import Path

from dotenv import load_dotenv
from google.oauth2 import service_account
from googleapiclient.discovery import build

from src.config import PROJECT_ROOT, get_required_env
from src.logging_utils import setup_logging


logger = setup_logging(__name__)

SCOPES = ["https://www.googleapis.com/auth/drive.readonly"]
CREDENTIALS_PATH = PROJECT_ROOT / "credentials" / "service-account.json"


def main():
    load_dotenv(PROJECT_ROOT / ".env")

    if not CREDENTIALS_PATH.is_file():
        raise FileNotFoundError(
            f"File kredensial tidak ditemukan: {CREDENTIALS_PATH}"
        )

    folder_id = get_required_env("GOOGLE_DRIVE_FOLDER_ID")

    credentials = service_account.Credentials.from_service_account_file(
        str(CREDENTIALS_PATH),
        scopes=SCOPES,
    )

    drive = build(
        "drive",
        "v3",
        credentials=credentials,
        cache_discovery=False,
    )

    result = drive.files().list(
        q=f"'{folder_id}' in parents and trashed = false",
        fields="files(id,name,mimeType,size)",
        pageSize=100,
        orderBy="name",
    ).execute()

    files = result.get("files", [])

    print(f"Jumlah file ditemukan: {len(files)}")

    for file in files:
        print(
            f"- {file['name']} | "
            f"ID: {file['id']} | "
            f"Tipe: {file['mimeType']}"
        )

    pdfs = [
        file for file in files
        if file["mimeType"] == "application/pdf"
    ]
    print(f"\nJumlah PDF langsung di folder: {len(pdfs)}")


if __name__ == "__main__":
    main()