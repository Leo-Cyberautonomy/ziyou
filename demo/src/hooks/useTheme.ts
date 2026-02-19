import { useState, useEffect, useCallback } from 'react'

export type ThemeName = 'cyber' | 'dopamine'

export function useTheme() {
  const [theme, setThemeState] = useState<ThemeName>(() => {
    if (typeof window === 'undefined') return 'cyber'
    return (localStorage.getItem('ziyou-theme') as ThemeName) || 'cyber'
  })

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme)
    localStorage.setItem('ziyou-theme', theme)
  }, [theme])

  const toggle = useCallback(() => {
    setThemeState((t) => (t === 'cyber' ? 'dopamine' : 'cyber'))
  }, [])

  return { theme, toggle }
}
