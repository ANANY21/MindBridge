import { useEffect, useState } from 'react'
import { getDailyTip } from '../lib/api.js'
import { Sparkle, Quote } from 'lucide-react'

export default function DailyTipCard() {
  const [tip, setTip] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let mounted = true
    getDailyTip()
      .then((d) => {
        if (!mounted) return
        setTip(d)
      })
      .catch(() => {
        if (!mounted) return
        setTip({
          title: 'Small steps, gentle pace',
          text: 'Try a 60-second “shoulder drop” reset: inhale, lift shoulders; exhale, release. Repeat 3 times.',
        })
      })
      .finally(() => mounted && setLoading(false))
    return () => {
      mounted = false
    }
  }, [])

  return (
    <div className="glass soft-shadow rounded-3xl p-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 rounded-full bg-white/60 px-3 py-1 text-xs font-medium text-slate-700 dark:bg-white/5 dark:text-slate-200">
            <Sparkle className="h-3.5 w-3.5" />
            Daily Wellness Tip
          </div>
          <div className="mt-3 text-lg font-semibold tracking-tight">
            {loading ? 'Loading…' : tip?.title}
          </div>
          <div className="mt-2 text-sm leading-relaxed text-slate-600 dark:text-slate-300">
            {loading ? 'Fetching your gentle nudge for today.' : tip?.text}
          </div>
        </div>
        <div className="grid h-12 w-12 place-items-center rounded-2xl bg-gradient-to-br from-sky-200 via-purple-200 to-emerald-200 dark:from-sky-500/20 dark:via-purple-500/20 dark:to-emerald-500/15">
          <Quote className="h-5 w-5 text-slate-700 dark:text-slate-200" />
        </div>
      </div>
    </div>
  )
}

