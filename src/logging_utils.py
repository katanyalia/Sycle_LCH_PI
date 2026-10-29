import logging
import os


def setup_logging(name: str = "rag_document_pipeline") -> logging.Logger:
    """Configure consistent logging for local runs and GitHub Actions."""
    log_level = os.getenv("LOG_LEVEL", "INFO").upper()

    logging.basicConfig(
        level=getattr(logging, log_level, logging.INFO),
        format="%(asctime)s | %(levelname)s | %(name)s | %(message)s",
        datefmt="%Y-%m-%d %H:%M:%S",
        force=True,
    )

    return logging.getLogger(name)