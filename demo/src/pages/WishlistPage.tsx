import { useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Heart, Trash2, ArrowRight, Gamepad2 } from 'lucide-react'
import { getGameById } from '../data/games'
import { GENRE_LABELS } from '../types'
import type { Game, GenreType } from '../types'
import ScoreBadge from '../components/ScoreBadge'

function loadWishlist(): string[] {
  try {
    const saved = localStorage.getItem('ziyou-wishlist')
    return saved ? JSON.parse(saved) : []
  } catch {
    return []
  }
}

function saveWishlist(ids: string[]) {
  localStorage.setItem('ziyou-wishlist', JSON.stringify(ids))
}

export default function WishlistPage() {
  const navigate = useNavigate()
  const [wishlistIds, setWishlistIds] = useState<string[]>(loadWishlist)

  useEffect(() => {
    saveWishlist(wishlistIds)
  }, [wishlistIds])

  const removeFromWishlist = useCallback((id: string) => {
    setWishlistIds((prev) => prev.filter((x) => x !== id))
  }, [])

  const wishlistGames = wishlistIds
    .map((id) => getGameById(id))
    .filter((g): g is Game => g !== undefined)

  return (
    <div className="min-h-screen bg-gaming-dark px-4 py-12 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-5xl">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-10"
        >
          <h1 className="gradient-text mb-3 text-4xl font-bold tracking-tight sm:text-5xl">
            我的心愿单
          </h1>
          {wishlistGames.length > 0 && (
            <p className="text-gray-400">
              已收藏 {wishlistGames.length} 款游戏
            </p>
          )}
        </motion.div>

        {wishlistGames.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.4 }}
            className="flex flex-col items-center justify-center py-32 text-center"
          >
            <div className="mb-6 rounded-full bg-gaming-card p-6">
              <Heart className="h-12 w-12 text-gray-600" />
            </div>
            <p className="mb-2 text-xl font-semibold text-gray-300">
              还没有收藏游戏
            </p>
            <p className="mb-6 text-sm text-gray-500">
              去推荐页面看看，找到你感兴趣的游戏吧
            </p>
            <motion.button
              whileTap={{ scale: 0.97 }}
              onClick={() => navigate('/results')}
              className="inline-flex cursor-pointer items-center gap-2 rounded-xl bg-gaming-accent px-6 py-3 text-sm font-medium text-white transition-colors hover:bg-gaming-accent-light hover:shadow-[0_0_24px_rgba(99,102,241,0.35)]"
            >
              去看看推荐
              <ArrowRight className="h-4 w-4" />
            </motion.button>
          </motion.div>
        ) : (
          <>
            <div className="space-y-4">
              <AnimatePresence mode="popLayout">
                {wishlistGames.map((game, i) => (
                  <motion.div
                    key={game.id}
                    layout
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 40, scale: 0.95 }}
                    transition={{
                      delay: i * 0.06,
                      duration: 0.35,
                      ease: [0.25, 0.46, 0.45, 0.94],
                    }}
                    className="glass-card group flex overflow-hidden rounded-2xl transition-shadow duration-300 hover:shadow-[0_0_24px_rgba(99,102,241,0.12)]"
                  >
                    <div className="relative h-auto w-32 flex-shrink-0 sm:w-40">
                      <img
                        src={game.cover}
                        alt={game.name}
                        className="h-full w-full object-cover"
                      />
                    </div>

                    <div className="flex flex-1 flex-col justify-between p-4 sm:p-5">
                      <div>
                        <div className="mb-1 flex items-start justify-between gap-3">
                          <div>
                            <h3 className="text-lg font-bold text-white">
                              {game.name}
                            </h3>
                            <p className="text-xs text-gray-500">{game.nameEn}</p>
                          </div>
                          <motion.button
                            whileTap={{ scale: 0.9 }}
                            onClick={() => removeFromWishlist(game.id)}
                            className="flex-shrink-0 cursor-pointer rounded-lg p-2 text-gray-500 transition-colors hover:bg-gaming-rose/10 hover:text-gaming-rose"
                          >
                            <Trash2 className="h-4 w-4" />
                          </motion.button>
                        </div>

                        <div className="mb-2 flex flex-wrap gap-1.5">
                          {game.genres.slice(0, 3).map((g) => (
                            <span
                              key={g}
                              className="rounded-md bg-gaming-accent/15 px-2 py-0.5 text-[10px] font-medium text-gaming-accent-light"
                            >
                              {GENRE_LABELS[g as GenreType]?.label ?? g}
                            </span>
                          ))}
                        </div>

                        <div className="mb-3 flex flex-wrap items-center gap-2">
                          <ScoreBadge platform="MC" score={game.scores.metacritic} />
                          <ScoreBadge platform="IGN" score={game.scores.ign} />
                          <ScoreBadge platform="TapTap" score={game.scores.taptap} />
                        </div>

                        <p className="line-clamp-2 text-xs leading-relaxed text-gray-400">
                          {game.description}
                        </p>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>

            {wishlistGames.length >= 2 && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="mt-8 flex justify-center"
              >
                <motion.button
                  whileTap={{ scale: 0.97 }}
                  onClick={() =>
                    navigate(
                      `/compare?ids=${wishlistIds.join(',')}`,
                    )
                  }
                  className="inline-flex cursor-pointer items-center gap-2 rounded-xl bg-gaming-accent px-6 py-3 text-sm font-medium text-white transition-colors hover:bg-gaming-accent-light hover:shadow-[0_0_24px_rgba(99,102,241,0.35)]"
                >
                  <Gamepad2 className="h-4 w-4" />
                  对比已选
                  <ArrowRight className="h-4 w-4" />
                </motion.button>
              </motion.div>
            )}
          </>
        )}
      </div>
    </div>
  )
}
