import { useMemo, useState } from 'react'
import { logMood } from '../lib/api.js'
import { BadgeCheck, Flame, Heart, Meh, CloudRain, Zap } from 'lucide-react'

const MOODS = [
  { id: 'happy', label: 'Happy', icon: Heart, bg: 'from-emerald-200 to-sky-200' },
  { id: 'sad', label: 'Sad', icon: CloudRain, bg: 'from-sky-200 to-purple-200' },
  { id: 'anxious', label: 'Anxious', icon: Zap, bg: 'from-purple-200 to-emerald-200' },
  { id: 'okay', label: 'Okay', icon: Meh, bg: 'from-slate-200 to-sky-200' },
]

function todayKey() {
  const d = new Date()
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

function computeStreak(lastDate, streak) {
  if (!lastDate) return { streak: 1, lastDate: todayKey() }
  const last = new Date(lastDate)
  const now = new Date(todayKey())
  const diffDays = Math.round((now - last) / (1000 * 60 * 60 * 24))
  if (diffDays === 0) return { streak, lastDate } // already checked in today
  if (diffDays === 1) return { streak: (streak || 0) + 1, lastDate: todayKey() }
  return { streak: 1, lastDate: todayKey() }
}

function badgeForStreak(streak) {
  if (streak >= 14) return { label: 'Calm Champion', level: 3 }
  if (streak >= 7) return { label: 'Steady Soul', level: 2 }
  if (streak >= 3) return { label: 'Gentle Starter', level: 1 }
  return { label: 'First Step', level: 0 }
}

export default function MoodTracker({ onSuggestion }) {
  const [selected, setSelected] = useState('happy')
  const [note, setNote] = useState('')
  const [saving, setSaving] = useState(false)
  const [msg, setMsg] = useState('')

  const { streak, badge } = useMemo(() => {
    const s = Number(localStorage.getItem('mindease_streak') || 0)
    const last = localStorage.getItem('mindease_last_checkin') || ''
    return { streak: s, badge: badgeForStreak(s) }
  }, [msg])

  async function save() {
    setSaving(true)
    setMsg('')
    try {
      const res = await logMood({ mood: selected, note })

      const prevStreak = Number(localStorage.getItem('mindease_streak') || 0)
      const prevLast = localStorage.getItem('mindease_last_checkin') || ''
      const next = computeStreak(prevLast, prevStreak)
      localStorage.setItem('mindease_streak', String(next.streak))
      localStorage.setItem('mindease_last_checkin', next.lastDate)

      setNote('')
      setMsg('Saved. I can suggest something gentle next.')
      if (typeof onSuggestion === 'function') onSuggestion(res?.suggestion)
    } catch (e) {
      setMsg(e?.message || 'Could not save mood')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="glass soft-shadow rounded-3xl p-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <div className="text-lg font-semibold tracking-tight">Mood tracker</div>
          <div className="mt-1 text-sm text-slate-600 dark:text-slate-300">
            Quick check-ins build helpful patterns—no judgment.
          </div>
        </div>
        <div className="flex items-center gap-2">
          <div className="inline-flex items-center gap-2 rounded-full bg-white/60 px-3 py-1 text-xs font-medium text-slate-700 dark:bg-white/5 dark:text-slate-200">
            <Flame className="h-3.5 w-3.5" /> {streak} day streak
          </div>
          <div className="inline-flex items-center gap-2 rounded-full bg-white/60 px-3 py-1 text-xs font-medium text-slate-700 dark:bg-white/5 dark:text-slate-200">
            <BadgeCheck className="h-3.5 w-3.5" /> {badge.label}
          </div>
        </div>
      </div>

      <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-4">
        {MOODS.map((m) => {
          const Icon = m.icon
          const active = selected === m.id
          return (
            <button
              key={m.id}
              type="button"
              onClick={() => setSelected(m.id)}
              className={[
                'group relative overflow-hidden rounded-2xl border p-4 text-left transition-all',
                active
                  ? 'border-white/40 bg-white/60 dark:border-white/10 dark:bg-white/10'
                  : 'border-white/25 bg-white/40 hover:bg-white/55 dark:border-white/10 dark:bg-white/5 dark:hover:bg-white/10',
              ].join(' ')}
            >
              <div className={`absolute inset-0 opacity-60 bg-gradient-to-br ${m.bg}`} />
              <div className="relative flex items-center justify-between gap-3">
                <div>
                  <div className="text-sm font-semibold">{m.label}</div>
                  <div className="mt-1 text-xs text-slate-600 dark:text-slate-300">
                    Tap to select
                  </div>
                </div>
                <div className="grid h-10 w-10 place-items-center rounded-2xl bg-white/60 dark:bg-white/10">
                  <Icon className="h-5 w-5 text-slate-800 dark:text-slate-100" />
                </div>
              </div>
            </button>
          )
        })}
      </div>

      <div className="mt-4">
        <textarea
          value={note}
          onChange={(e) => setNote(e.target.value)}
          placeholder="Optional note (what’s on your mind?)"
          rows={3}
          className="w-full resize-none rounded-2xl border border-white/30 bg-white/60 p-4 text-sm text-slate-800 outline-none transition-all placeholder:text-slate-500 focus:ring-2 focus:ring-sky-200 dark:border-white/10 dark:bg-white/5 dark:text-slate-100 dark:placeholder:text-slate-400 dark:focus:ring-sky-500/30"
        />
      </div>

      <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
        <div className="text-sm text-slate-600 dark:text-slate-300">{msg}</div>
        <button
          type="button"
          onClick={save}
          disabled={saving}
          className="rounded-full bg-slate-900 px-5 py-2.5 text-sm font-medium text-white shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md disabled:opacity-60 disabled:hover:translate-y-0 dark:bg-white dark:text-slate-900"
        >
          {saving ? 'Saving…' : 'Save mood'}
        </button>
      </div>
    </div>
  )
}

