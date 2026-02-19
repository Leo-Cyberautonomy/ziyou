import { useMemo } from 'react'
import { useSearchParams, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Trophy, Clock, Gamepad2, ArrowRight, Star, Monitor, Layers } from 'lucide-react'
import { getGameById } from '../data/games'
import { GENRE_LABELS, DEVICE_LABELS, PLATFORM_LABELS } from '../types'
import type { Game, GenreType, DeviceType, PlatformType } from '../types'

const DIFFICULTY_LABELS: Record<string, string> = {
  easy: '简单',
  medium: '中等',
  hard: '困难',
  very_hard: '非常困难',
}

const DIFFICULTY_RANK: Record<string, number> = {
  easy: 1,
  medium: 2,
  hard: 3,
  very_hard: 4,
}

function loadWishlist(): string[] {
  try {
    const saved = localStorage.getItem('ziyou-wishlist')
    return saved ? JSON.parse(saved) : []
  } catch {
    return []
  }
}

function priceToNumber(price: string): number {
  const match = price.match(/[\d.]+/)
  return match ? parseFloat(match[0]) : Infinity
}

function getPriceRange(game: Game): string {
  if (!game.buyLinks.length) return '-'
  const prices = game.buyLinks.map((l) => l.price)
  if (prices.some((p) => p === '免费')) return '免费'
  const nums = prices.map(priceToNumber).filter((n) => isFinite(n))
  if (!nums.length) return prices[0]
  const min = Math.min(...nums)
  const max = Math.max(...nums)
  return min === max ? `¥${min}` : `¥${min} - ¥${max}`
}

interface CompareRowProps {
  label: string
  icon: React.ReactNode
  values: string[]
  highlightIndex?: number | null
}

function CompareRow({ label, icon, values, highlightIndex }: CompareRowProps) {
  return (
    <div className="grid items-center gap-4 border-b border-gaming-border/40 py-4" style={{ gridTemplateColumns: `160px repeat(${values.length}, 1fr)` }}>
      <div className="flex items-center gap-2 text-sm font-medium text-gray-400">
        {icon}
        {label}
      </div>
      {values.map((val, i) => (
        <div
          key={i}
          className={`text-sm font-medium ${
            highlightIndex === i ? 'text-gaming-cyan' : 'text-gray-300'
          }`}
        >
          {val}
        </div>
      ))}
    </div>
  )
}

function findMaxIndex(nums: number[]): number | null {
  if (nums.length === 0) return null
  let maxIdx = 0
  let allSame = true
  for (let i = 1; i < nums.length; i++) {
    if (nums[i] !== nums[0]) allSame = false
    if (nums[i] > nums[maxIdx]) maxIdx = i
  }
  return allSame ? null : maxIdx
}

function findMinIndex(nums: number[]): number | null {
  if (nums.length === 0) return null
  let minIdx = 0
  let allSame = true
  for (let i = 1; i < nums.length; i++) {
    if (nums[i] !== nums[0]) allSame = false
    if (nums[i] < nums[minIdx]) minIdx = i
  }
  return allSame ? null : minIdx
}

export default function ComparePage() {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()

  const compareGames = useMemo<Game[]>(() => {
    const idsParam = searchParams.get('ids')
    const ids = idsParam
      ? idsParam.split(',').filter(Boolean)
      : loadWishlist()
    return ids
      .slice(0, 4)
      .map((id) => getGameById(id))
      .filter((g): g is Game => g !== undefined)
  }, [searchParams])

  if (compareGames.length === 0) {
    return (
      <div className="min-h-screen bg-gaming-dark px-4 py-12 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-5xl">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex flex-col items-center justify-center py-32 text-center"
          >
            <div className="mb-6 rounded-full bg-gaming-card p-6">
              <Layers className="h-12 w-12 text-gray-600" />
            </div>
            <p className="mb-2 text-xl font-semibold text-gray-300">
              没有要对比的游戏
            </p>
            <p className="mb-6 text-sm text-gray-500">
              先去心愿单添加至少 2 款游戏，再来对比吧
            </p>
            <motion.button
              whileTap={{ scale: 0.97 }}
              onClick={() => navigate('/wishlist')}
              className="inline-flex cursor-pointer items-center gap-2 rounded-xl bg-gaming-accent px-6 py-3 text-sm font-medium text-white transition-colors hover:bg-gaming-accent-light"
            >
              前往心愿单
              <ArrowRight className="h-4 w-4" />
            </motion.button>
          </motion.div>
        </div>
      </div>
    )
  }

  const mcScores = compareGames.map((g) => g.scores.metacritic)
  const ignScores = compareGames.map((g) => g.scores.ign)
  const taptapScores = compareGames.map((g) => g.scores.taptap)
  const diffRanks = compareGames.map((g) => DIFFICULTY_RANK[g.difficulty] ?? 0)
  const priceNums = compareGames.map((g) => {
    const prices = g.buyLinks.map((l) => l.price)
    if (prices.some((p) => p === '免费')) return 0
    const nums = prices.map(priceToNumber).filter((n) => isFinite(n))
    return nums.length ? Math.min(...nums) : Infinity
  })

  const colCount = compareGames.length

  return (
    <div className="min-h-screen bg-gaming-dark px-4 py-12 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-6xl">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-10"
        >
          <h1 className="gradient-text mb-3 text-4xl font-bold tracking-tight sm:text-5xl">
            游戏对比
          </h1>
          <p className="text-gray-400">
            对比 {compareGames.length} 款游戏的各项指标
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15, duration: 0.5 }}
          className="glass-card overflow-hidden rounded-2xl"
        >
          <div
            className="grid gap-4 border-b border-gaming-border/40 p-6"
            style={{ gridTemplateColumns: `160px repeat(${colCount}, 1fr)` }}
          >
            <div />
            {compareGames.map((game, i) => (
              <motion.div
                key={game.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 + i * 0.1 }}
                className="text-center"
              >
                <div className="mx-auto mb-3 aspect-[3/4] w-28 overflow-hidden rounded-xl sm:w-32">
                  <img
                    src={game.cover}
                    alt={game.name}
                    className="h-full w-full object-cover"
                  />
                </div>
                <h3 className="text-sm font-bold text-white">{game.name}</h3>
                <p className="text-[10px] text-gray-500">{game.nameEn}</p>
              </motion.div>
            ))}
          </div>

          <div className="px-6">
            <CompareRow
              label="类型"
              icon={<Gamepad2 className="h-4 w-4" />}
              values={compareGames.map((g) =>
                g.genres
                  .map((genre) => GENRE_LABELS[genre as GenreType]?.label ?? genre)
                  .join('、'),
              )}
            />

            <CompareRow
              label="Metacritic"
              icon={<Star className="h-4 w-4" />}
              values={mcScores.map(String)}
              highlightIndex={findMaxIndex(mcScores)}
            />

            <CompareRow
              label="IGN"
              icon={<Star className="h-4 w-4" />}
              values={ignScores.map(String)}
              highlightIndex={findMaxIndex(ignScores)}
            />

            <CompareRow
              label="TapTap"
              icon={<Star className="h-4 w-4" />}
              values={taptapScores.map(String)}
              highlightIndex={findMaxIndex(taptapScores)}
            />

            <CompareRow
              label="难度"
              icon={<Trophy className="h-4 w-4" />}
              values={compareGames.map((g) => DIFFICULTY_LABELS[g.difficulty] ?? g.difficulty)}
              highlightIndex={findMinIndex(diffRanks)}
            />

            <CompareRow
              label="游玩时长"
              icon={<Clock className="h-4 w-4" />}
              values={compareGames.map((g) => g.playtime)}
            />

            <CompareRow
              label="平台"
              icon={<Monitor className="h-4 w-4" />}
              values={compareGames.map((g) =>
                g.platforms
                  .map((p) => PLATFORM_LABELS[p as PlatformType]?.label ?? p)
                  .join('、'),
              )}
            />

            <CompareRow
              label="设备"
              icon={<Gamepad2 className="h-4 w-4" />}
              values={compareGames.map((g) =>
                g.devices
                  .map((d) => DEVICE_LABELS[d as DeviceType]?.label ?? d)
                  .join('、'),
              )}
            />

            <CompareRow
              label="价格"
              icon={<Layers className="h-4 w-4" />}
              values={compareGames.map(getPriceRange)}
              highlightIndex={findMinIndex(priceNums)}
            />
          </div>
        </motion.div>
      </div>
    </div>
  )
}
