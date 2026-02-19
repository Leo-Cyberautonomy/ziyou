import { Heart } from 'lucide-react'

export default function Footer() {
  return (
    <footer className="border-t border-gaming-border bg-gaming-dark/50 py-6 mt-auto">
      <div className="mx-auto max-w-6xl px-6 flex flex-col sm:flex-row items-center justify-between gap-4">
        <p className="text-sm text-gray-500">
          © 2026 自游 — 你的私人游戏顾问
        </p>
        <p className="text-sm text-gray-500 flex items-center gap-1">
          Made by{' '}
          <span className="text-gray-400">Wenxuan Huang</span>
          {' & '}
          <span className="text-gray-400">Taijun Shen</span>
        </p>
      </div>
    </footer>
  )
}
