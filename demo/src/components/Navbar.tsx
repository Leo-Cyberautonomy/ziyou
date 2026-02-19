import { Link, useLocation } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Gamepad2, Sun, Moon } from 'lucide-react'
import { useTheme } from '../hooks/useTheme'

const NAV_LINKS = [
  { to: '/', label: '首页' },
  { to: '/survey', label: '开始测试' },
  { to: '/wishlist', label: '心愿单' },
]

export default function Navbar() {
  const { pathname } = useLocation()
  const { theme, toggle } = useTheme()

  return (
    <header className="glass-nav fixed inset-x-0 top-0 z-40 h-16">
      <nav className="mx-auto flex h-full max-w-6xl items-center justify-between px-6">
        <Link to="/" className="flex items-center gap-2">
          <Gamepad2 size={24} className="text-gaming-accent" />
          <span className="gradient-text text-xl font-extrabold tracking-tight">
            自游
          </span>
        </Link>

        <ul className="flex items-center gap-1">
          {NAV_LINKS.map((link) => {
            const isActive =
              link.to === '/'
                ? pathname === '/'
                : pathname.startsWith(link.to)

            return (
              <li key={link.to}>
                <Link
                  to={link.to}
                  className={`relative rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
                    isActive
                      ? 'text-white'
                      : 'text-gray-400 hover:text-gray-200'
                  }`}
                >
                  {link.label}
                  {isActive && (
                    <motion.div
                      layoutId="nav-indicator"
                      className="absolute inset-x-2 -bottom-0.5 h-0.5 rounded-full bg-gaming-accent"
                      transition={{ type: 'spring', stiffness: 380, damping: 28 }}
                    />
                  )}
                </Link>
              </li>
            )
          })}
        </ul>

        <button
          onClick={toggle}
          className="relative flex h-9 w-9 items-center justify-center rounded-xl border border-gaming-border transition-all duration-300 hover:bg-gaming-accent/10 cursor-pointer"
          aria-label="切换主题"
        >
          <AnimatePresence mode="wait">
            {theme === 'cyber' ? (
              <motion.div
                key="sun"
                initial={{ rotate: -90, opacity: 0, scale: 0.5 }}
                animate={{ rotate: 0, opacity: 1, scale: 1 }}
                exit={{ rotate: 90, opacity: 0, scale: 0.5 }}
                transition={{ duration: 0.25 }}
              >
                <Sun size={16} className="text-gaming-amber" />
              </motion.div>
            ) : (
              <motion.div
                key="moon"
                initial={{ rotate: 90, opacity: 0, scale: 0.5 }}
                animate={{ rotate: 0, opacity: 1, scale: 1 }}
                exit={{ rotate: -90, opacity: 0, scale: 0.5 }}
                transition={{ duration: 0.25 }}
              >
                <Moon size={16} className="text-gaming-accent" />
              </motion.div>
            )}
          </AnimatePresence>
        </button>
      </nav>
    </header>
  )
}
