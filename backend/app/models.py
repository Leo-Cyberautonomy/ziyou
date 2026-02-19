from pydantic import BaseModel, Field


# ── Request models ──

class RecommendRequest(BaseModel):
    experience_level: str = Field(description="beginner / casual / moderate / hardcore")
    weekly_hours: int = Field(ge=1, le=60)
    purposes: list[str] = Field(min_length=1)
    genre_preferences: list[str] = Field(min_length=1)
    devices: list[str] = Field(min_length=1)
    platform_preferences: list[str] = Field(default_factory=list)
    age_preference: str = Field(default="both")
    favorite_games: list[str] = Field(default_factory=list)


# ── Gemini structured output schema ──

class GeminiGameItem(BaseModel):
    name: str = Field(description="游戏中文名")
    name_en: str = Field(description="游戏英文名，用于 RAWG API 搜索")
    reason: str = Field(description="针对该玩家的一句话推荐理由")


class GeminiRecommendation(BaseModel):
    games: list[GeminiGameItem] = Field(description="推荐的游戏列表")


# ── RAWG enriched data ──

class StoreLink(BaseModel):
    name: str
    url: str


class EnrichedGame(BaseModel):
    slug: str
    name: str
    name_en: str
    cover: str = ""
    screenshots: list[str] = Field(default_factory=list)
    genres: list[str] = Field(default_factory=list)
    platforms: list[str] = Field(default_factory=list)
    metacritic: int | None = None
    rating: float | None = None
    description: str = ""
    recommend_reason: str = ""
    stores: list[StoreLink] = Field(default_factory=list)
    release_year: int | None = None
    playtime: str = ""
    tags: list[str] = Field(default_factory=list)
    developer: str = ""
    publisher: str = ""


# ── Response models ──

class RecommendResponse(BaseModel):
    games: list[EnrichedGame]


class HealthResponse(BaseModel):
    status: str = "ok"
    version: str = "0.1.0"
