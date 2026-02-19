import logging
from urllib.parse import quote

import httpx

from app.config import get_settings
from app.models import EnrichedGame, StoreLink

logger = logging.getLogger(__name__)

BASE_URL = "https://api.rawg.io/api"


def _build_params(**extra: str) -> dict:
    return {"key": get_settings().rawg_api_key, **extra}


async def search_game(name_en: str, client: httpx.AsyncClient) -> dict | None:
    params = _build_params(search=name_en, page_size="1")
    resp = await client.get(f"{BASE_URL}/games", params=params)
    resp.raise_for_status()
    data = resp.json()
    results = data.get("results", [])
    if not results:
        logger.warning("RAWG search returned no results for: %s", name_en)
        return None
    return results[0]


async def get_game_details(game_id: int, client: httpx.AsyncClient) -> dict:
    params = _build_params()
    resp = await client.get(f"{BASE_URL}/games/{game_id}", params=params)
    resp.raise_for_status()
    return resp.json()


async def get_screenshots(game_id: int, client: httpx.AsyncClient) -> list[str]:
    params = _build_params(page_size="6")
    resp = await client.get(f"{BASE_URL}/games/{game_id}/screenshots", params=params)
    resp.raise_for_status()
    data = resp.json()
    return [s["image"] for s in data.get("results", [])]


async def get_store_links(game_id: int, client: httpx.AsyncClient) -> list[StoreLink]:
    params = _build_params()
    resp = await client.get(f"{BASE_URL}/games/{game_id}/stores", params=params)
    resp.raise_for_status()
    data = resp.json()
    links: list[StoreLink] = []
    for item in data.get("results", []):
        url = item.get("url", "")
        store_id = item.get("store_id")
        name = _store_name(store_id)
        if url and name:
            links.append(StoreLink(name=name, url=url))
    return links


STORE_NAMES = {
    1: "Steam",
    2: "Xbox Store",
    3: "PlayStation Store",
    4: "App Store",
    5: "GOG",
    6: "Nintendo eShop",
    7: "Xbox 360 Store",
    8: "Google Play",
    9: "itch.io",
    11: "Epic Games",
}


def _store_name(store_id: int | None) -> str:
    if store_id is None:
        return ""
    return STORE_NAMES.get(store_id, f"Store #{store_id}")


async def fetch_full_game(name_en: str, name_cn: str, reason: str) -> EnrichedGame | None:
    """Fetch complete game data from RAWG: search → details → screenshots → stores."""
    async with httpx.AsyncClient(timeout=15) as client:
        search_result = await search_game(name_en, client)
        if not search_result:
            return None

        game_id: int = search_result["id"]
        slug: str = search_result.get("slug", "")

        details = await get_game_details(game_id, client)
        screenshots = await get_screenshots(game_id, client)
        stores = await get_store_links(game_id, client)

    released = details.get("released") or ""
    release_year = int(released[:4]) if len(released) >= 4 else None

    developers = details.get("developers") or []
    publishers = details.get("publishers") or []

    playtime = details.get("playtime") or 0
    playtime_str = f"约 {playtime} 小时" if playtime else ""

    return EnrichedGame(
        slug=slug,
        name=name_cn,
        name_en=details.get("name", name_en),
        cover=details.get("background_image") or "",
        screenshots=screenshots[:6],
        genres=[g["name"] for g in (details.get("genres") or [])],
        platforms=[
            p["platform"]["name"]
            for p in (details.get("platforms") or [])
            if p.get("platform")
        ],
        metacritic=details.get("metacritic"),
        rating=details.get("rating"),
        description=(details.get("description_raw") or "")[:500],
        recommend_reason=reason,
        stores=stores,
        release_year=release_year,
        playtime=playtime_str,
        tags=[t["name"] for t in (details.get("tags") or [])[:8]],
        developer=developers[0]["name"] if developers else "",
        publisher=publishers[0]["name"] if publishers else "",
    )
