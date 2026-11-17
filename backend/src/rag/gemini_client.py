# Pemanggilan Gemini dengan model cadangan.
# Bila model utama sedang penuh (503) atau dibatasi (429/500), permintaan
# yang sama dicoba ke model cadangan, berurutan.
import os
import time
import logging
import requests

logger = logging.getLogger(__name__)

RETRY_STATUS = {429, 500, 503}
DEFAULT_FALLBACKS = "gemini-3.1-flash-lite,gemini-2.5-flash-lite"


def model_chain():
    primary = os.getenv("GEMINI_MODEL")
    fallbacks = os.getenv("GEMINI_FALLBACK_MODELS", DEFAULT_FALLBACKS)
    chain = [primary] + [m.strip() for m in fallbacks.split(",")]
    seen, result = set(), []
    for model in chain:
        if model and model not in seen:
            seen.add(model)
            result.append(model)
    return result


def post_gemini(payload, api_key, timeout=25):
    last_error = None

    for index, model in enumerate(model_chain()):
        url = f"https://generativelanguage.googleapis.com/v1beta/models/{model}:generateContent"
        try:
            response = requests.post(
                url,
                json=payload,
                timeout=timeout,
                headers={"Content-Type": "application/json", "x-goog-api-key": api_key},
            )
        except requests.Timeout:
            last_error = RuntimeError(f"Gemini {model}: waktu habis")
            print(f"[gemini] {model} waktu habis, coba model berikutnya")
            continue

        if response.status_code == 200:
            if index > 0:
                print(f"[gemini] memakai model cadangan: {model}")
            return response.json()

        last_error = RuntimeError(f"Gemini HTTP {response.status_code}: {response.text[:300]}")
        if response.status_code not in RETRY_STATUS:
            raise last_error

        print(f"[gemini] {model} HTTP {response.status_code}, coba model berikutnya")
        time.sleep(1)

    raise last_error or RuntimeError("Tidak ada model Gemini yang diatur")
