import json
import logging

from google import genai

from app.config import get_settings
from app.models import RecommendRequest, GeminiRecommendation, GeminiGameItem
from app.utils.prompt import build_prompt

logger = logging.getLogger(__name__)


async def get_recommendations(req: RecommendRequest) -> list[GeminiGameItem]:
    settings = get_settings()
    prompt = build_prompt(req)

    client = genai.Client(api_key=settings.gemini_api_key)

    logger.info("Calling Gemini %s for recommendations", settings.gemini_model)

    response = client.models.generate_content(
        model=settings.gemini_model,
        contents=prompt,
        config={
            "response_mime_type": "application/json",
            "response_schema": GeminiRecommendation,
        },
    )

    parsed = json.loads(response.text)
    result = GeminiRecommendation.model_validate(parsed)

    logger.info("Gemini returned %d game recommendations", len(result.games))
    return result.games
