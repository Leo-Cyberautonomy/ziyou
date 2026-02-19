interface ScoreBadgeProps {
  platform: string
  score: number
}

export default function ScoreBadge({ platform, score }: ScoreBadgeProps) {
  const color =
    score >= 90 || score >= 9.5
      ? 'text-gaming-emerald bg-gaming-emerald/10 border-gaming-emerald/20'
      : score >= 75 || score >= 7.5
        ? 'text-gaming-cyan bg-gaming-cyan/10 border-gaming-cyan/20'
        : 'text-gaming-amber bg-gaming-amber/10 border-gaming-amber/20'

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-md border px-2 py-0.5 text-xs font-semibold ${color}`}
    >
      <span className="opacity-70">{platform}</span>
      <span>{score}</span>
    </span>
  )
}
