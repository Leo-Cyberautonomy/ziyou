import { useState } from 'react'
import { motion } from 'framer-motion'
import { Heart, Star, ExternalLink } from 'lucide-react'
import type { Game } from '../types'
import ScoreBadge from './ScoreBadge'

interface GameCardProps {
  game: Game
  onSelect?: (game: Game) => void
  isWishlisted?: boolean
  onToggleWishlist?: (gameId: string) => void
}

export default function GameCard({
  game,
  onSelect,
  isWishlisted = false,
  onToggleWishlist,
}: GameCardProps) {
  const [imgLoaded, setImgLoaded] = useState(false)

  const topScore = Math.max(game.scores.metacritic, game.scores.ign * 10, game.scores.taptap * 10)

  return (
    <motion.div
      whileHover={{ y: -4 }}
      transition={{ type: 'spring', stiffness: 300, damping: 20 }}
      className="glass-card group relative flex cursor-pointer flex-col overflow-hidden rounded-2xl hover:glow-accent"
      onClick={() => onSelect?.(game)}
    >
      <div className="relative aspect-[3/4] w-full overflow-hidden">
        {!imgLoaded && (
          <div className="absolute inset-0 animate-pulse bg-gaming-card" />
        )}
        <img
          src={game.cover}
          alt={game.name}
          className={`h-full w-full object-cover transition-transform duration-500 group-hover:scale-105 ${imgLoaded ? 'opacity-100' : 'opacity-0'}`}
          onLoad={() => setImgLoaded(true)}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-gaming-dark/90 via-transparent to-transparent" />

        <button
          onClick={(e) => {
            e.stopPropagation()
            onToggleWishlist?.(game.id)
          }}
          className="absolute right-3 top-3 flex h-9 w-9 items-center justify-center rounded-full bg-black/40 backdrop-blur-sm transition-colors hover:bg-black/60"
        >
          <Heart
            size={18}
            className={
              isWishlisted
                ? 'fill-gaming-rose text-gaming-rose'
                : 'text-white/70'
            }
          />
        </button>

        <div className="absolute bottom-0 left-0 right-0 p-4">
          <div className="flex items-center gap-1.5 text-gaming-amber">
            <Star size={14} className="fill-gaming-amber" />
            <span className="text-sm font-bold">{(topScore / 10).toFixed(1)}</span>
          </div>
        </div>
      </div>

      <div className="flex flex-1 flex-col gap-2 p-4">
        <div>
          <h3 className="truncate text-base font-bold text-white">{game.name}</h3>
          <p className="truncate text-xs text-gray-400">{game.nameEn}</p>
        </div>

        <div className="flex flex-wrap gap-1.5">
          {game.genres.slice(0, 3).map((genre) => (
            <span
              key={genre}
              className="rounded-md bg-gaming-accent/10 px-2 py-0.5 text-[11px] font-medium text-gaming-accent-light"
            >
              {genre}
            </span>
          ))}
        </div>

        <div className="flex flex-wrap gap-1.5">
          <ScoreBadge platform="MC" score={game.scores.metacritic} />
          <ScoreBadge platform="IGN" score={game.scores.ign} />
        </div>

        <p className="mt-auto line-clamp-2 text-xs leading-relaxed text-gray-400">
          {game.recommendReason}
        </p>

        <div className="mt-1 flex items-center gap-1 text-[11px] text-gaming-accent-light opacity-0 transition-opacity group-hover:opacity-100">
          <span>查看详情</span>
          <ExternalLink size={11} />
        </div>
      </div>
    </motion.div>
  )
}
