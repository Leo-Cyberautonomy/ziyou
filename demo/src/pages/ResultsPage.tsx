import { useState, useMemo, useCallback } from 'react'
import { useLocation } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Heart, Shuffle, Filter, ChevronDown, Star, Gamepad2 } from 'lucide-react'
import { games as mockGames } from '../data/games'
import { GENRE_LABELS, DEVICE_LABELS } from '../types'
import type { Game, GenreType, DeviceType } from '../types'
import ScoreBadge from '../components/ScoreBadge'
import GameDetailModal from '../components/GameDetailModal'

interface ApiGame {
  slug: string
  name: string
  name_en: string
  cover: string
  screenshots: string[]
  genres: string[]
  platforms: string[]
  metacritic: number | null
  rating: number | null
  description: string
  recommend_reason: string
  stores: { name: string; url: string }[]
  release_year: number | null
  playtime: string
  tags: string[]
  developer: string
  publisher: string
}

function apiToGame(api: ApiGame): Game {
  return {
    id: api.slug,
    name: api.name,
    nameEn: api.name_en,
    cover: api.cover,
    screenshots: api.screenshots,
    genres: api.genres,
    platforms: api.stores.map((s) => s.name),
    devices: api.platforms,
    releaseYear: api.release_year ?? 0,
    scores: {
      metacritic: api.metacritic ?? 0,
      ign: api.rating ? Math.round(api.rating * 2 * 10) / 10 : 0,
      taptap: 0,
    },
    description: api.description,
    recommendReason: api.recommend_reason,
    videoUrl: '',
    buyLinks: api.stores.map((s) => ({
      platform: s.name,
      url: s.url,
      price: '',
      icon: s.name.toLowerCase().replace(/\s/g, ''),
    })),
    tags: api.tags,
    developer: api.developer,
    publisher: api.publisher,
    playtime: api.playtime,
    difficulty: 'medium' as const,
  }
}

const DIFFICULTY_LABELS: Record<string, string> = {
  easy: '简单',
  medium: '中等',
  hard: '困难',
  very_hard: '非常困难',
}

const DISPLAY_COUNT = 8

function shuffleArray<T>(arr: T[]): T[] {
  const shuffled = [...arr]
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
  }
  return shuffled
}

export default function ResultsPage() {
  const location = useLocation()
  const apiGames: ApiGame[] | undefined = (location.state as any)?.games
  const isFromApi = !!apiGames

  const allGames: Game[] = useMemo(() => {
    if (apiGames) return apiGames.map(apiToGame)
    return mockGames
  }, [apiGames])

  const [wishlist, setWishlist] = useState<Set<string>>(() => {
    try {
      const saved = localStorage.getItem('ziyou-wishlist')
      return saved ? new Set(JSON.parse(saved)) : new Set()
    } catch {
      return new Set()
    }
  })
  const [shuffleKey, setShuffleKey] = useState(0)
  const [selectedGame, setSelectedGame] = useState<Game | null>(null)
  const [showFilters, setShowFilters] = useState(false)
  const [genreFilter, setGenreFilter] = useState<GenreType[]>([])
  const [deviceFilter, setDeviceFilter] = useState<DeviceType[]>([])
  const [difficultyFilter, setDifficultyFilter] = useState<string[]>([])

  const filteredGames = useMemo(() => {
    return allGames.filter((game) => {
      if (genreFilter.length && !genreFilter.some((g) => game.genres.includes(g))) return false
      if (deviceFilter.length && !deviceFilter.some((d) => game.devices.includes(d))) return false
      if (difficultyFilter.length && !difficultyFilter.includes(game.difficulty)) return false
      return true
    })
  }, [genreFilter, deviceFilter, difficultyFilter])

  const displayedGames = useMemo(() => {
    return shuffleArray(filteredGames).slice(0, DISPLAY_COUNT)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filteredGames, shuffleKey])

  const toggleWishlist = useCallback((id: string) => {
    setWishlist((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      localStorage.setItem('ziyou-wishlist', JSON.stringify([...next]))
      return next
    })
  }, [])

  const toggleFilter = <T,>(arr: T[], item: T): T[] =>
    arr.includes(item) ? arr.filter((x) => x !== item) : [...arr, item]

  const activeGenres = Object.entries(GENRE_LABELS).filter(([key]) =>
    allGames.some((g) => g.genres.includes(key)),
  )
  const activeDevices = Object.entries(DEVICE_LABELS).filter(([key]) =>
    allGames.some((g) => g.devices.includes(key)),
  )
  const activeDifficulties = ['easy', 'medium', 'hard', 'very_hard'].filter((d) =>
    allGames.some((g) => g.difficulty === d),
  )

  return (
    <div className="min-h-screen bg-gaming-dark px-4 py-12 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-10 text-center"
        >
          <h1 className="gradient-text mb-3 text-4xl font-bold tracking-tight sm:text-5xl">
            为你精选的游戏
          </h1>
          <p className="text-lg text-gray-400">
            {isFromApi
              ? `基于你的游戏偏好，AI 为你精选了 ${allGames.length} 款游戏`
              : '基于你的游戏偏好，AI 为你挑选了以下游戏'}
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mb-8 flex flex-wrap items-center justify-between gap-4"
        >
          <div className="flex items-center gap-3">
            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={() => setShuffleKey((k) => k + 1)}
              className="inline-flex cursor-pointer items-center gap-2 rounded-xl border border-gaming-border bg-gaming-card px-4 py-2.5 text-sm font-medium text-gaming-accent-light transition-colors hover:bg-gaming-accent/10"
            >
              <Shuffle className="h-4 w-4" />
              换一批
            </motion.button>
            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={() => setShowFilters((v) => !v)}
              className="inline-flex cursor-pointer items-center gap-2 rounded-xl border border-gaming-border bg-gaming-card px-4 py-2.5 text-sm font-medium text-gray-300 transition-colors hover:bg-gaming-accent/10"
            >
              <Filter className="h-4 w-4" />
              筛选
              <ChevronDown
                className={`h-3.5 w-3.5 transition-transform ${showFilters ? 'rotate-180' : ''}`}
              />
            </motion.button>
          </div>
          <p className="text-sm text-gray-500">
            共 {filteredGames.length} 款游戏，展示 {displayedGames.length} 款
          </p>
        </motion.div>

        <AnimatePresence>
          {showFilters && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="mb-8 overflow-hidden"
            >
              <div className="glass-card space-y-5 rounded-2xl p-6">
                <div>
                  <h3 className="mb-2.5 text-xs font-semibold uppercase tracking-wider text-gray-500">
                    类型
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {activeGenres.map(([key, { label, icon }]) => (
                      <button
                        key={key}
                        onClick={() => setGenreFilter((f) => toggleFilter(f, key as GenreType))}
                        className={`cursor-pointer rounded-lg px-3 py-1.5 text-xs font-medium transition-colors ${
                          genreFilter.includes(key as GenreType)
                            ? 'bg-gaming-accent text-white'
                            : 'border border-gaming-border text-gray-400 hover:text-white'
                        }`}
                      >
                        {icon} {label}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <h3 className="mb-2.5 text-xs font-semibold uppercase tracking-wider text-gray-500">
                    设备
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {activeDevices.map(([key, { label, icon }]) => (
                      <button
                        key={key}
                        onClick={() => setDeviceFilter((f) => toggleFilter(f, key as DeviceType))}
                        className={`cursor-pointer rounded-lg px-3 py-1.5 text-xs font-medium transition-colors ${
                          deviceFilter.includes(key as DeviceType)
                            ? 'bg-gaming-accent text-white'
                            : 'border border-gaming-border text-gray-400 hover:text-white'
                        }`}
                      >
                        {icon} {label}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <h3 className="mb-2.5 text-xs font-semibold uppercase tracking-wider text-gray-500">
                    难度
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {activeDifficulties.map((d) => (
                      <button
                        key={d}
                        onClick={() => setDifficultyFilter((f) => toggleFilter(f, d))}
                        className={`cursor-pointer rounded-lg px-3 py-1.5 text-xs font-medium transition-colors ${
                          difficultyFilter.includes(d)
                            ? 'bg-gaming-accent text-white'
                            : 'border border-gaming-border text-gray-400 hover:text-white'
                        }`}
                      >
                        {DIFFICULTY_LABELS[d]}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {displayedGames.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex flex-col items-center justify-center py-24 text-center"
          >
            <Gamepad2 className="mb-4 h-16 w-16 text-gray-600" />
            <p className="text-lg text-gray-400">没有符合筛选条件的游戏</p>
            <button
              onClick={() => {
                setGenreFilter([])
                setDeviceFilter([])
                setDifficultyFilter([])
              }}
              className="mt-4 cursor-pointer text-sm text-gaming-accent-light hover:underline"
            >
              清除筛选条件
            </button>
          </motion.div>
        ) : (
          <motion.div
            layout
            className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3"
          >
            <AnimatePresence mode="popLayout">
              {displayedGames.map((game, i) => (
                <motion.div
                  key={game.id}
                  layout
                  initial={{ opacity: 0, y: 30, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{
                    delay: i * 0.08,
                    duration: 0.4,
                    ease: [0.25, 0.46, 0.45, 0.94],
                  }}
                  className="glass-card group cursor-pointer overflow-hidden rounded-2xl transition-shadow duration-300 hover:shadow-[0_0_30px_rgba(99,102,241,0.15)]"
                  onClick={() => setSelectedGame(game)}
                >
                  <div className="relative aspect-[3/4] overflow-hidden">
                    <img
                      src={game.cover}
                      alt={game.name}
                      className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-gaming-dark/90 via-transparent to-transparent" />
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        toggleWishlist(game.id)
                      }}
                      className="absolute right-3 top-3 cursor-pointer rounded-full bg-black/40 p-2 backdrop-blur-sm transition-colors hover:bg-black/60"
                    >
                      <Heart
                        className={`h-5 w-5 transition-colors ${
                          wishlist.has(game.id)
                            ? 'fill-gaming-rose text-gaming-rose'
                            : 'text-white/70'
                        }`}
                      />
                    </button>
                    <div className="absolute bottom-0 left-0 right-0 p-4">
                      <div className="flex items-center gap-2">
                        <span className="flex items-center gap-1 rounded-md bg-gaming-emerald/20 px-2 py-0.5 text-xs font-bold text-gaming-emerald">
                          <Star className="h-3 w-3" />
                          {game.scores.metacritic}
                        </span>
                        <ScoreBadge platform="IGN" score={game.scores.ign} />
                      </div>
                    </div>
                  </div>

                  <div className="p-4">
                    <h3 className="text-lg font-bold text-white">{game.name}</h3>
                    <p className="mb-3 text-xs text-gray-500">{game.nameEn}</p>

                    <div className="mb-3 flex flex-wrap gap-1.5">
                      {game.genres.slice(0, 3).map((g) => (
                        <span
                          key={g}
                          className="rounded-md bg-gaming-accent/15 px-2 py-0.5 text-[10px] font-medium text-gaming-accent-light"
                        >
                          {GENRE_LABELS[g as GenreType]?.label ?? g}
                        </span>
                      ))}
                    </div>

                    <p className="mb-4 line-clamp-2 text-xs leading-relaxed text-gray-400">
                      {game.recommendReason}
                    </p>

                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        setSelectedGame(game)
                      }}
                      className="w-full cursor-pointer rounded-xl border border-gaming-border py-2 text-xs font-medium text-gaming-accent-light transition-colors hover:bg-gaming-accent/10"
                    >
                      查看详情
                    </button>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </motion.div>
        )}
      </div>

      <AnimatePresence>
        {selectedGame && (
          <GameDetailModal
            game={selectedGame}
            isOpen={!!selectedGame}
            onClose={() => setSelectedGame(null)}
          />
        )}
      </AnimatePresence>
    </div>
  )
}
