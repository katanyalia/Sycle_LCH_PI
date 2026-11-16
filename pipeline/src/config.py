import os
from pathlib import Path

from dotenv import load_dotenv

# Root directory of the project
PROJECT_ROOT = Path(__file__).resolve().parent.parent

# Load environment variables from the local .env file
load_dotenv(PROJECT_ROOT / ".env")


def get_required_env(name: str) -> str:
    """Return a required environment variable or raise a clear error."""
    value = os.getenv(name)

    if not value:
        raise ValueError(
            f"Environment variable '{name}' is missing. "
            "Check your .env file or GitHub Secrets."
        )

    return value


def get_optional_env(name: str, default: str = "") -> str:
    """Return an environment variable or a default value."""
    return os.getenv(name, default)


# Optional configuration
GEMINI_MODEL = get_optional_env(
    "GEMINI_MODEL",
    "gemini-3.8-flash",
)

LOG_LEVEL = get_optional_env("LOG_LEVEL", "INFO")

REGISTRY_PATH = Path(
    get_optional_env(
        "REGISTRY_PATH",
        "data/processed/evidence_registry.xlsx",
    )
)

# Resolve relative registry paths from the project root
if not REGISTRY_PATH.is_absolute():
    REGISTRY_PATH = PROJECT_ROOT / REGISTRY_PATH