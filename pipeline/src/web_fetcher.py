import requests
from bs4 import BeautifulSoup
from datetime import datetime, timezone


def fetch_webpage(source_web, timeout=25):
    url = source_web.get("url")

    if not url:
        raise ValueError("Sumber tidak memiliki URL.")

    headers = {
        "User-Agent": (
            "ClimateChangeRAGPrototype/0.1 "
            "(educational use)"
        )
    }

    response = requests.get(
        url,
        headers=headers,
        timeout=timeout,
    )
    response.raise_for_status()

    content_type = response.headers.get("Content-Type", "").lower()
    if "html" not in content_type:
        raise ValueError(
            f"Konten bukan HTML: {content_type or 'tidak diketahui'}"
        )

    soup = BeautifulSoup(response.text, "html.parser")

    for tag in soup([
        "script", "style", "nav", "footer",
        "header", "noscript", "svg"
    ]):
        tag.decompose()

    main = soup.find("main") or soup.find("article") or soup.body or soup

    extracted_text = "\n".join(
        line.strip()
        for line in main.get_text("\n").splitlines()
        if line.strip()
    )

    return {
        **source_web,
        "text": extracted_text,
        "retrieved_at": datetime.now(timezone.utc).isoformat(),
    }