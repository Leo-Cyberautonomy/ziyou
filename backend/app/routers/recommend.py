import asyncio
import logging

from fastapi import APIRouter, HTTPException

from app.models import (
    RecommendRequest,
    RecommendResponse,
    EnrichedGame,
    GeminiGameItem,
)
from app.services.gemini import get_recommendations
from app.services.rawg import fetch_full_game
from app.services.cache import get_cached, set_cached

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api", tags=["recommend"])


async def _resolve_game(item: GeminiGameItem) -> EnrichedGame | None:
    """Try cache first, then fetch from RAWG. Returns None on failure."""
    slug = item.name_en.lower().replace(" ", "-").replace(":", "").replace("'", "")

    cached = await get_cached(slug)
    if cached:
        cached.recommend_reason = item.reason
        return cached

    try:
        game = await fetch_full_game(item.name_en, item.name, item.reason)
    except Exception:
        logger.exception("RAWG fetch failed for: %s", item.name_en)
        return None

    if game is None:
        return None

    await set_cached(game)
    game.recommend_reason = item.reason
    return game


@router.post("/recommend", response_model=RecommendResponse)
async def recommend(req: RecommendRequest):
    try:
        gemini_items = await get_recommendations(req)
    except Exception:
        logger.exception("Gemini API call failed")
        raise HTTPException(status_code=502, detail="AI 推荐服务暂时不可用，请稍后重试")

    if not gemini_items:
        raise HTTPException(status_code=500, detail="AI 未返回任何推荐结果")

    tasks = [_resolve_game(item) for item in gemini_items]
    results = await asyncio.gather(*tasks)

    games = [g for g in results if g is not None]

    if not games:
        raise HTTPException(status_code=500, detail="未能获取任何游戏数据，请稍后重试")

    logger.info(
        "Returning %d enriched games (from %d Gemini suggestions)",
        len(games),
        len(gemini_items),
    )
    return RecommendResponse(games=games)
