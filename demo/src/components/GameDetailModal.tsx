import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, ExternalLink, Play, Heart, Clock, Swords, User, Building2 } from 'lucide-react'
import type { Game } from '../types'
import ScoreBadge from './ScoreBadge'
import Button from './Button'

interface GameDetailModalProps {
  game: Game | null
  isOpen: boolean
  onClose: () => void
  isWishlisted?: boolean
  onToggleWishlist?: (gameId: string) => void
}

export default function GameDetailModal({
  game,
  isOpen,
  onClose,
  isWishlisted = false,
  onToggleWishlist,
}: GameDetailModalProps) {
  const [activeScreenshot, setActiveScreenshot] = useState(0)

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => {
      document.body.style.overflow = ''
    }
  }, [isOpen])

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [onClose])

  if (!game) return null

  const difficultyMap: Record<string, { label: string; color: string }> = {
    easy: { label: '简单', color: 'text-gaming-emerald' },
    medium: { label: '中等', color: 'text-gaming-cyan' },
    hard: { label: '困难', color: 'text-gaming-amber' },
    very_hard: { label: '极难', color: 'text-gaming-rose' },
  }

  const diff = difficultyMap[game.difficulty] ?? { label: game.difficulty, color: 'text-gray-400' }

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/70 backdrop-blur-sm p-4 sm:p-8"
          onClick={onClose}
        >
          <motion.div
            initial={{ opacity: 0, y: 40, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 40, scale: 0.97 }}
            transition={{ type: 'spring', stiffness: 300, damping: 25 }}
            className="relative my-4 w-full max-w-3xl rounded-3xl border border-gaming-border bg-gaming-card shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={onClose}
              className="absolute right-4 top-4 z-10 flex h-10 w-10 items-center justify-center rounded-full bg-black/50 text-white/70 backdrop-blur-sm transition-colors hover:bg-black/70 hover:text-white"
            >
              <X size={20} />
            </button>

            <div className="relative aspect-video w-full overflow-hidden rounded-t-3xl">
              <img
                src={game.screenshots[activeScreenshot] ?? game.cover}
                alt={game.name}
                className="h-full w-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-gaming-card via-transparent to-transparent" />

              {game.screenshots.length > 1 && (
                <div className="absolute bottom-4 left-1/2 flex -translate-x-1/2 gap-1.5">
                  {game.screenshots.map((_, i) => (
                    <button
                      key={i}
                      onClick={() => setActiveScreenshot(i)}
                      className={`h-1.5 rounded-full transition-all ${
                        i === activeScreenshot
                          ? 'w-6 bg-gaming-accent'
                          : 'w-1.5 bg-white/30 hover:bg-white/50'
                      }`}
                    />
                  ))}
                </div>
              )}
            </div>

            <div className="space-y-6 p-6 sm:p-8">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                <div className="space-y-1">
                  <h2 className="text-2xl font-bold text-white">{game.name}</h2>
                  <p className="text-sm text-gray-400">{game.nameEn}</p>
                </div>
                <button
                  onClick={() => onToggleWishlist?.(game.id)}
                  className={`flex items-center gap-2 rounded-xl border px-4 py-2 text-sm font-medium transition-colors ${
                    isWishlisted
                      ? 'border-gaming-rose/30 bg-gaming-rose/10 text-gaming-rose'
                      : 'border-gaming-border bg-transparent text-gray-300 hover:bg-white/5'
                  }`}
                >
                  <Heart size={16} className={isWishlisted ? 'fill-gaming-rose' : ''} />
                  {isWishlisted ? '已加入心愿单' : '加入心愿单'}
                </button>
              </div>

              <div className="flex flex-wrap gap-2">
                <ScoreBadge platform="Metacritic" score={game.scores.metacritic} />
                <ScoreBadge platform="IGN" score={game.scores.ign} />
                <ScoreBadge platform="TapTap" score={game.scores.taptap} />
              </div>

              <div className="flex flex-wrap gap-2">
                {game.tags.map((tag) => (
                  <span
                    key={tag}
                    className="rounded-lg bg-gaming-accent/10 px-3 py-1 text-xs font-medium text-gaming-accent-light"
                  >
                    {tag}
                  </span>
                ))}
              </div>

              <div className="rounded-2xl bg-gaming-dark/50 p-5">
                <p className="text-sm leading-relaxed text-gray-300">
                  {game.description}
                </p>
              </div>

              <div className="rounded-2xl border border-gaming-accent/15 bg-gaming-accent/5 p-5">
                <p className="text-sm font-medium text-gaming-accent-light">
                  💡 {game.recommendReason}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
                <InfoItem icon={<User size={14} />} label="开发商" value={game.developer} />
                <InfoItem icon={<Building2 size={14} />} label="发行商" value={game.publisher} />
                <InfoItem icon={<Clock size={14} />} label="游戏时长" value={game.playtime} />
                <InfoItem
                  icon={<Swords size={14} />}
                  label="难度"
                  value={diff.label}
                  valueClassName={diff.color}
                />
              </div>

              {game.videoUrl && (
                <a
                  href={game.videoUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 text-sm text-gaming-cyan transition-colors hover:text-gaming-cyan/80"
                >
                  <Play size={16} />
                  <span>观看游戏视频</span>
                </a>
              )}

              {game.buyLinks.length > 0 && (
                <div className="space-y-3">
                  <h3 className="text-sm font-semibold text-gray-300">购买渠道</h3>
                  <div className="flex flex-wrap gap-3">
                    {game.buyLinks.map((link) => (
                      <a
                        key={link.platform}
                        href={link.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <Button variant="secondary" size="sm">
                          <ExternalLink size={14} />
                          {link.platform}
                          <span className="text-gaming-emerald">{link.price}</span>
                        </Button>
                      </a>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

function InfoItem({
  icon,
  label,
  value,
  valueClassName = 'text-white',
}: {
  icon: React.ReactNode
  label: string
  value: string
  valueClassName?: string
}) {
  return (
    <div className="space-y-1">
      <div className="flex items-center gap-1.5 text-xs text-gray-500">
        {icon}
        {label}
      </div>
      <p className={`text-sm font-medium ${valueClassName}`}>{value}</p>
    </div>
  )
}
