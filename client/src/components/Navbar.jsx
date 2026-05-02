import { Link, NavLink, useLocation } from 'react-router-dom'
import { Moon, Sun, Sparkles } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'

function useTheme() {
  const [theme, setTheme] = useState(() => {
    const saved = localStorage.getItem('mindease_theme')
    if (saved === 'dark' || saved === 'light') return saved
    return window.matchMedia?.('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
  })

  useEffect(() => {
    const root = document.documentElement
    if (theme === 'dark') root.classList.add('dark')
    else root.classList.remove('dark')
    localStorage.setItem('mindease_theme', theme)
  }, [theme])

  return { theme, setTheme }
}

const navLinkClass = ({ isActive }) =>
  [
    'rounded-full px-4 py-2 text-sm transition-all',
    isActive
      ? 'bg-white/70 dark:bg-white/10 border border-white/30 dark:border-white/10 shadow-sm'
      : 'text-slate-600 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white hover:bg-white/50 dark:hover:bg-white/5',
  ].join(' ')

export default function Navbar() {
  const { theme, setTheme } = useTheme()
  const loc = useLocation()

  const cta = useMemo(() => {
    if (loc.pathname === '/chat') return null
    return (
      <Link
        to="/chat"
        className="group inline-flex items-center gap-2 rounded-full bg-slate-900 px-4 py-2 text-sm font-medium text-white shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md active:translate-y-0 dark:bg-white dark:text-slate-900"
      >
        <Sparkles className="h-4 w-4 opacity-90 transition-transform group-hover:rotate-6" />
        Start Chatting
      </Link>
    )
  }, [loc.pathname])

  return (
    <header className="sticky top-0 z-30 border-b border-white/30 bg-white/30 backdrop-blur-xl dark:border-white/10 dark:bg-black/10">
      <div className="mx-auto flex h-[72px] max-w-6xl items-center justify-between px-4">
        <Link to="/" className="flex items-center gap-2">
          <div className="relative grid h-10 w-10 place-items-center rounded-2xl bg-gradient-to-br from-sky-200 via-purple-200 to-emerald-200 dark:from-sky-500/30 dark:via-purple-500/30 dark:to-emerald-500/25 soft-shadow">
            <div className="h-5 w-5 rounded-full bg-white/70 dark:bg-white/10" />
          </div>
          <div className="leading-tight">
            <div className="text-sm font-semibold tracking-tight">MindEase</div>
            <div className="text-xs text-slate-500 dark:text-slate-400">Wellness companion</div>
          </div>
        </Link>

        <nav className="hidden items-center gap-2 md:flex">
          <NavLink to="/" className={navLinkClass} end>
            Home
          </NavLink>
          <NavLink to="/chat" className={navLinkClass}>
            Chat
          </NavLink>
          <NavLink to="/resources" className={navLinkClass}>
            Resources
          </NavLink>
          <NavLink to="/helplines" className={navLinkClass}>
            Helplines
          </NavLink>
        </nav>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            className="inline-flex items-center justify-center rounded-full border border-white/30 bg-white/60 p-2 text-slate-700 shadow-sm transition-all hover:-translate-y-0.5 hover:bg-white/70 dark:border-white/10 dark:bg-white/5 dark:text-slate-200 dark:hover:bg-white/10"
            aria-label="Toggle theme"
          >
            {theme === 'dark' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
          </button>
          {cta}
        </div>
      </div>
    </header>
  )
}

