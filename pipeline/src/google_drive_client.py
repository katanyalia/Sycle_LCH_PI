from pathlib import Path


def validate_local_file(file_path: str | Path) -> Path:
    """Validate that a local document exists before processing."""
    path = Path(file_path).expanduser()

    if not path.exists():
        raise FileNotFoundError(f"Document not found: {path}")

    if not path.is_file():
        raise ValueError(f"Path is not a file: {path}")

    return path