from functools import lru_cache

from supabase import Client, create_client

from src.config import get_required_env


@lru_cache(maxsize=1)
def get_supabase_client() -> Client:
    """Create and reuse a Supabase client."""
    supabase_url = get_required_env("SUPABASE_URL")
    supabase_key = get_required_env("SUPABASE_SERVICE_ROLE_KEY")

    return create_client(supabase_url, supabase_key)