from pydantic_settings import BaseSettings
from functools import lru_cache


class Settings(BaseSettings):
    gemini_api_key: str = ""
    rawg_api_key: str = ""
    cache_ttl_seconds: int = 604800  # 7 days
    gemini_model: str = "gemini-2.5-flash"
    db_path: str = "data/game_cache.db"

    model_config = {"env_file": ".env", "env_file_encoding": "utf-8"}


@lru_cache
def get_settings() -> Settings:
    return Settings()
