from app.models import RecommendRequest

EXPERIENCE_MAP = {
    "beginner": "纯新手（很少或从未玩过游戏）",
    "casual": "轻度玩家（偶尔玩玩，不太深入）",
    "moderate": "中度玩家（有一定经验，会主动找游戏玩）",
    "hardcore": "硬核玩家（游戏老手，追求挑战和深度）",
}

PURPOSE_MAP = {
    "competitive": "竞技对抗",
    "relaxing": "休闲放松",
    "story": "剧情沉浸",
    "social": "社交互动",
    "creative": "创意建造",
}

GENRE_MAP = {
    "action": "动作",
    "rpg": "RPG",
    "shooter": "射击",
    "strategy": "策略",
    "simulation": "模拟",
    "adventure": "冒险",
    "sports": "体育",
    "puzzle": "解谜",
    "racing": "竞速",
    "horror": "恐怖",
    "rhythm": "音游",
    "roguelike": "Roguelike",
}

DEVICE_MAP = {
    "phone": "手机",
    "tablet": "平板",
    "pc": "PC",
    "handheld": "掌机（如 Nintendo Switch）",
    "console": "主机（如 PS5 / Xbox）",
}

AGE_MAP = {
    "classic": "偏好经典老游戏",
    "new": "只玩近几年的新作",
    "both": "新旧都可以",
}


def build_prompt(req: RecommendRequest) -> str:
    experience = EXPERIENCE_MAP.get(req.experience_level, req.experience_level)
    purposes = "、".join(PURPOSE_MAP.get(p, p) for p in req.purposes)
    genres = "、".join(GENRE_MAP.get(g, g) for g in req.genre_preferences)
    devices = "、".join(DEVICE_MAP.get(d, d) for d in req.devices)
    age_pref = AGE_MAP.get(req.age_preference, req.age_preference)
    fav = "、".join(req.favorite_games) if req.favorite_games else "未提供"

    return f"""你是一位资深游戏推荐专家，熟悉全球各平台的游戏。根据以下玩家画像，推荐 8 款最适合的游戏。

【玩家画像】
- 游戏经验：{experience}
- 每周游戏时间：约 {req.weekly_hours} 小时
- 游戏目的：{purposes}
- 偏好类型：{genres}
- 可用设备：{devices}
- 新旧偏好：{age_pref}
- 喜欢的游戏：{fav}

【要求】
1. 推荐的游戏必须是真实存在、已发售的游戏，绝不能编造
2. 必须能在玩家的设备上运行
3. 难度和游戏深度应与玩家经验匹配
4. 优先推荐符合玩家游戏目的的作品
5. 如果玩家每周游戏时间少于 5 小时，避免推荐需要大量时间投入的 MMO 或超长 RPG
6. 如果玩家列出了喜欢的游戏，推荐风格相似但不同的作品（不要重复推荐玩家已经玩过的）
7. 推荐理由必须针对该玩家个性化，说明为什么这款游戏适合 TA
8. name_en 必须是游戏的准确英文名（用于搜索游戏数据库），注意拼写正确"""
