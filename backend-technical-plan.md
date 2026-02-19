# 自游 — 后端技术路线

## 整体架构

```
┌─────────────┐     POST /api/recommend      ┌──────────────┐
│   Frontend   │ ──────────────────────────→  │   FastAPI     │
│  (React)     │ ←──────────────────────────  │   Backend     │
└─────────────┘    enriched game list         └──────┬───────┘
                                                     │
                                        ┌────────────┼────────────┐
                                        ▼            ▼            ▼
                                  ┌──────────┐ ┌──────────┐ ┌──────────┐
                                  │  Gemini   │ │  RAWG    │ │  Cache   │
                                  │  API      │ │  API     │ │ (SQLite) │
                                  └──────────┘ └──────────┘ └──────────┘
```

**核心流程：**

1. 前端把用户问卷数据 POST 到后端
2. 后端用问卷数据构造 Prompt → 发给 Gemini → 拿到推荐的游戏名单（结构化 JSON）
3. 对每款推荐游戏，先查本地缓存 → 缓存未命中则调 RAWG API 获取真实数据
4. 把 Gemini 的推荐理由 + RAWG 的真实游戏信息合并，返回给前端

---

## 技术选型

| 组件 | 选型 | 理由 |
|------|------|------|
| Web 框架 | **FastAPI** | 异步、自带 OpenAPI 文档、Pydantic 集成 |
| AI 推荐 | **Gemini 2.5 Flash** | 快、便宜、支持结构化输出（JSON Schema） |
| 游戏数据 | **RAWG API** | 50 万+ 游戏、免费 20k 请求/月、有封面/截图/评分/商店链接 |
| 数据缓存 | **SQLite**（开发）/ **Redis**（生产） | SQLite 零依赖开箱即用；Redis 适合高并发场景 |
| Python SDK | `google-genai`（Gemini）、`httpx`（HTTP 客户端） | 官方推荐的新 SDK |

---

## 1. Gemini 推荐引擎

### 1.1 Prompt 设计

把用户问卷转成自然语言描述，让 Gemini 扮演游戏推荐专家：

```
你是一位资深游戏推荐专家。根据以下玩家画像，推荐 8 款最适合的游戏。

【玩家画像】
- 游戏经验：{experience_level}
- 每周游戏时间：{weekly_hours} 小时
- 游戏目的：{purposes}
- 偏好类型：{genre_preferences}
- 可用设备：{devices}
- 平台偏好：{platform_preferences}
- 新旧偏好：{age_preference}
- 喜欢的游戏：{favorite_games}

【要求】
1. 推荐的游戏必须真实存在，不要编造
2. 必须适配玩家的设备和平台
3. 难度与玩家经验匹配
4. 游戏时长与玩家可用时间匹配
5. 返回 JSON 数组，每项包含：游戏名、英文名、推荐理由（一句话，针对该玩家个性化）
```

### 1.2 结构化输出

利用 Gemini 的 Structured Output 功能，强制返回 JSON：

```python
from pydantic import BaseModel, Field
from google import genai

class GameRecommendation(BaseModel):
    name: str = Field(description="游戏中文名")
    name_en: str = Field(description="游戏英文名，用于 RAWG API 搜索")
    reason: str = Field(description="针对该玩家的一句话推荐理由")

class RecommendationResult(BaseModel):
    games: list[GameRecommendation] = Field(description="推荐的游戏列表，8 款")

client = genai.Client(api_key=GEMINI_API_KEY)
response = client.models.generate_content(
    model="gemini-2.5-flash",
    contents=prompt,
    config={
        "response_mime_type": "application/json",
        "response_json_schema": RecommendationResult.model_json_schema(),
    },
)
```

**为什么用结构化输出而不是自由文本？**
- 100% 保证返回可解析的 JSON，不需要正则提取
- 字段名和类型由 Schema 约束，前后端接口稳定
- `name_en` 字段可以直接用来搜索 RAWG API

---

## 2. RAWG 游戏数据 API

### 2.1 为什么选 RAWG

| 对比项 | RAWG | IGDB (Twitch) |
|--------|------|---------------|
| 注册门槛 | 简单，填邮箱拿 API Key | 需要 Twitch 账号 + 2FA + OAuth2 |
| 免费额度 | 20,000 请求/月 | 无月度限制，但 4 QPS 限流 |
| 数据丰富度 | 50 万+ 游戏，210 万截图，110 万评分 | 更全，但查询语法复杂 (Apicalypse) |
| 封面/截图 | ✅ 直接返回 URL | ✅ 需要拼 URL |
| 商店链接 | ✅ 免费版有（Steam/Epic/PSN 等） | ❌ 需要额外查询 |
| Metacritic 分 | ✅ 直接返回 | ❌ 无 |
| 集成难度 | 简单 REST API | 需要学 Apicalypse 查询语言 |

**结论**：RAWG 对这个项目来说是最优选择 —— 简单、数据够用、免费额度足够 Demo 使用。

### 2.2 核心 API 端点

```
GET https://api.rawg.io/api/games?key={API_KEY}&search={game_name}&page_size=1

返回：
- name, slug, background_image（封面）
- released, rating, metacritic
- genres[], platforms[], tags[], stores[]
- screenshots（需要额外请求 /games/{id}/screenshots）
- description（需要额外请求 /games/{id}）
```

### 2.3 数据映射

| 前端字段 | RAWG 来源 |
|---------|----------|
| name | `name`（RAWG 有中文名时用中文，否则用 Gemini 返回的中文名） |
| nameEn | `name`（英文原名） |
| cover | `background_image` |
| screenshots | `/games/{id}/screenshots` → `results[].image` |
| genres | `genres[].name` |
| platforms | `platforms[].platform.name` |
| metacritic | `metacritic` |
| rating | `rating`（RAWG 自身评分，5 分制） |
| description | `/games/{id}` → `description_raw` |
| stores | `stores[].store.name` + `/games/{id}/stores` → 真实链接 |
| releaseYear | `released` 取年份 |
| tags | `tags[].name`（取前 5 个） |

### 2.4 请求节约策略

免费 20,000 请求/月，需要精打细算：

| 操作 | 请求数 | 频率 |
|------|--------|------|
| 搜索游戏 | 1 次/游戏 | 每次推荐 8 次 |
| 获取详情 | 1 次/游戏 | 仅缓存未命中时 |
| 获取截图 | 1 次/游戏 | 仅缓存未命中时 |
| 获取商店 | 1 次/游戏 | 仅缓存未命中时 |

**最坏情况**（全部缓存 miss）：8 × 4 = 32 请求/次推荐
**有缓存时**：8 × 1 = 8 请求/次推荐（仅搜索，匹配后走缓存）
**完全命中**：0 请求（全部走缓存）

20,000 / 32 ≈ 625 次推荐/月（无缓存） → 实际有缓存会高得多，Demo 足够。

---

## 3. 缓存层

### 3.1 缓存策略

```
请求推荐 → Gemini 返回游戏名单
         → 对每款游戏：
            1. 用 name_en 计算缓存 key（slug 化）
            2. 查 cache → 命中？返回缓存数据
            3. 未命中 → 调 RAWG search → 拿到 game_id
            4. 调 RAWG details/screenshots/stores
            5. 组装完整数据 → 写入 cache → 返回
```

### 3.2 SQLite 缓存表

```sql
CREATE TABLE game_cache (
    slug        TEXT PRIMARY KEY,
    rawg_id     INTEGER,
    data        TEXT NOT NULL,     -- JSON 序列化的完整游戏数据
    created_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    expires_at  TIMESTAMP          -- 默认 7 天后过期
);

CREATE INDEX idx_expires ON game_cache(expires_at);
```

**为什么选 SQLite？**
- 零依赖，不需要装 Redis
- Python 标准库内置 `sqlite3`，也可以用 `aiosqlite` 做异步
- 单文件数据库，部署简单
- 对 Demo 级别的并发完全够用

**过期策略**：游戏数据变化不频繁，缓存 7 天。过期后下次请求自动刷新。

### 3.3 生产环境可选 Redis

如果以后需要高并发，切换到 Redis 只需改一个缓存接口的实现：

```python
class CacheBackend(Protocol):
    async def get(self, key: str) -> dict | None: ...
    async def set(self, key: str, data: dict, ttl: int = 604800) -> None: ...

class SQLiteCache(CacheBackend): ...    # 开发环境
class RedisCache(CacheBackend): ...     # 生产环境
```

---

## 4. API 设计

### 4.1 端点列表

| 方法 | 路径 | 说明 |
|------|------|------|
| POST | `/api/recommend` | 核心：提交问卷，获取推荐 |
| GET | `/api/game/{slug}` | 获取单款游戏详情（走缓存） |
| GET | `/api/health` | 健康检查 |

### 4.2 推荐接口

**请求：**

```json
POST /api/recommend
{
  "experience_level": "casual",
  "weekly_hours": 10,
  "purposes": ["relaxing", "story"],
  "genre_preferences": ["rpg", "adventure"],
  "devices": ["pc", "handheld"],
  "platform_preferences": ["steam", "eshop"],
  "age_preference": "both",
  "favorite_games": ["塞尔达传说", "星露谷物语"]
}
```

**响应：**

```json
{
  "games": [
    {
      "slug": "the-witcher-3-wild-hunt",
      "name": "巫师3：狂猎",
      "name_en": "The Witcher 3: Wild Hunt",
      "cover": "https://media.rawg.io/media/games/xxx.jpg",
      "screenshots": ["url1", "url2", "url3"],
      "genres": ["RPG", "Adventure"],
      "platforms": ["PC", "Nintendo Switch"],
      "metacritic": 92,
      "rating": 4.66,
      "description": "...",
      "recommend_reason": "喜欢塞尔达的你，一定会沉迷于巫师3同样广阔而充满故事的开放世界。",
      "stores": [
        {"name": "Steam", "url": "https://store.steampowered.com/app/292030"},
        {"name": "Nintendo eShop", "url": "..."}
      ],
      "release_year": 2015,
      "playtime": "50-200 小时",
      "tags": ["开放世界", "剧情驱动", "奇幻", "第三人称", "大地图"]
    }
  ]
}
```

### 4.3 请求流程时序

```
Frontend                Backend                  Gemini              RAWG             Cache
   │                       │                       │                  │                │
   │── POST /recommend ──→ │                       │                  │                │
   │                       │── build prompt ──────→ │                  │                │
   │                       │←── 8 games JSON ──────│                  │                │
   │                       │                       │                  │                │
   │                       │   for each game:      │                  │                │
   │                       │──────────────────────────────────────────→│ get(slug)      │
   │                       │←─────────────────────────────────────────│ hit / miss     │
   │                       │                       │                  │                │
   │                       │   if cache miss:      │                  │                │
   │                       │──────────────────────────→ search(name)  │                │
   │                       │←─────────────────────────── game data    │                │
   │                       │──────────────────────────────────────────→│ set(slug,data) │
   │                       │                       │                  │                │
   │←── enriched games ────│                       │                  │                │
```

---

## 5. 项目结构

```
backend/
├── app/
│   ├── __init__.py
│   ├── main.py              # FastAPI 应用入口、路由挂载
│   ├── config.py             # 配置（API keys, 缓存 TTL 等）
│   ├── models.py             # Pydantic 数据模型
│   ├── routers/
│   │   ├── __init__.py
│   │   └── recommend.py      # /api/recommend 路由
│   ├── services/
│   │   ├── __init__.py
│   │   ├── gemini.py         # Gemini AI 调用
│   │   ├── rawg.py           # RAWG API 调用
│   │   └── cache.py          # 缓存层（SQLite / Redis）
│   └── utils/
│       ├── __init__.py
│       └── prompt.py         # Prompt 模板构建
├── data/
│   └── game_cache.db         # SQLite 缓存文件（自动创建）
├── .env                      # 环境变量（GEMINI_API_KEY, RAWG_API_KEY）
├── requirements.txt
└── README.md
```

---

## 6. 依赖清单

```txt
# requirements.txt
fastapi>=0.115
uvicorn[standard]>=0.34
google-genai>=1.0              # Gemini SDK（新版）
httpx>=0.28                    # 异步 HTTP 客户端（调 RAWG）
aiosqlite>=0.20                # 异步 SQLite
pydantic>=2.0
pydantic-settings>=2.0         # 从 .env 读配置
python-dotenv>=1.0
```

---

## 7. 前端适配改动

后端完成后，前端需要做的改动：

| 改动项 | 说明 |
|--------|------|
| 问卷提交 | `SurveyPage` 最后一步改为调 `POST /api/recommend`，不再跳转到写死的 Mock 数据页 |
| 结果页数据源 | `ResultsPage` 从 API 响应拿数据，替换掉 `data/games.ts` |
| Loading 状态 | 推荐接口需要 3-8 秒（Gemini + RAWG），需要加 loading 动画 |
| 游戏详情 | 封面、截图、商店链接都变成真实数据 |
| 错误处理 | 网络错误、AI 返回异常、RAWG 搜不到的情况 |

---

## 8. 环境变量

```env
# .env
GEMINI_API_KEY=your_gemini_api_key_here
RAWG_API_KEY=your_rawg_api_key_here        # 从 https://rawg.io/apidocs 免费申请
CACHE_TTL_SECONDS=604800                    # 7 天
GEMINI_MODEL=gemini-2.5-flash
```

---

## 9. 开发顺序

建议按以下顺序实现，每步完成后可独立验证：

| 阶段 | 内容 | 预计时间 | 验证方式 |
|------|------|----------|----------|
| **Phase 1** | 项目骨架 + 配置 + 健康检查接口 | 10 min | `GET /health` 返回 200 |
| **Phase 2** | Gemini 推荐服务（纯 AI，不查 RAWG） | 20 min | POST 问卷 → 拿到游戏名单 JSON |
| **Phase 3** | RAWG 搜索 + 数据映射 | 30 min | 传入游戏名 → 返回完整游戏信息 |
| **Phase 4** | SQLite 缓存层 | 20 min | 第二次请求同一游戏秒返回 |
| **Phase 5** | 完整推荐流程串联 | 15 min | POST 问卷 → 拿到带真实数据的推荐列表 |
| **Phase 6** | 前端接入 | 30 min | 端到端测试完整流程 |
