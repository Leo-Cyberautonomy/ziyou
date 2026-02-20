import json
import logging
import os
from datetime import datetime, timedelta, timezone

import aiosqlite

from app.config import get_settings
from app.models import EnrichedGame

logger = logging.getLogger(__name__)

_db_path: str = ""


async def init_cache() -> None:
    global _db_path
    _db_path = get_settings().db_path

    # Ensure the parent directory exists (e.g. data/) before connecting
    db_dir = os.path.dirname(_db_path)
    if db_dir:
        os.makedirs(db_dir, exist_ok=True)

    async with aiosqlite.connect(_db_path) as db:
        await db.execute("""
            CREATE TABLE IF NOT EXISTS game_cache (
                slug        TEXT PRIMARY KEY,
                rawg_id     INTEGER,
                data        TEXT NOT NULL,
                created_at  TEXT DEFAULT (datetime('now')),
                expires_at  TEXT
            )
        """)
        await db.execute(
            "CREATE INDEX IF NOT EXISTS idx_expires ON game_cache(expires_at)"
        )
        await db.commit()
    logger.info("Cache initialized at %s", _db_path)


async def get_cached(slug: str) -> EnrichedGame | None:
    now = datetime.now(timezone.utc).isoformat()
    async with aiosqlite.connect(_db_path) as db:
        db.row_factory = aiosqlite.Row
        cursor = await db.execute(
            "SELECT data FROM game_cache WHERE slug = ? AND expires_at > ?",
            (slug, now),
        )
        row = await cursor.fetchone()
        if row is None:
            return None

    logger.debug("Cache hit: %s", slug)
    return EnrichedGame.model_validate_json(row["data"])


async def set_cached(game: EnrichedGame) -> None:
    ttl = get_settings().cache_ttl_seconds
    expires = (datetime.now(timezone.utc) + timedelta(seconds=ttl)).isoformat()

    async with aiosqlite.connect(_db_path) as db:
        await db.execute(
            """INSERT OR REPLACE INTO game_cache (slug, data, expires_at)
               VALUES (?, ?, ?)""",
            (game.slug, game.model_dump_json(), expires),
        )
        await db.commit()
    logger.debug("Cached: %s (expires %s)", game.slug, expires)


async def cleanup_expired() -> int:
    now = datetime.now(timezone.utc).isoformat()
    async with aiosqlite.connect(_db_path) as db:
        cursor = await db.execute(
            "DELETE FROM game_cache WHERE expires_at <= ?", (now,)
        )
        await db.commit()
        return cursor.rowcount
