import { useEffect, useState } from 'react'
import { listResources } from '../lib/api.js'
import { PlayCircle, BookOpen } from 'lucide-react'

export default function ResourcesPage() {
  const [items, setItems] = useState([])
  const [err, setErr] = useState('')

  useEffect(() => {
    listResources()
      .then((d) => setItems(d?.items || []))
      .catch((e) => setErr(e?.message || 'Failed to load resources'))
  }, [])

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <div className="text-2xl font-semibold tracking-tight">Resource Library</div>
          <div className="mt-1 text-sm text-slate-600 dark:text-slate-300">
            Articles and videos on mindfulness, stress management, and self-care.
          </div>
        </div>
      </div>

      {err ? (
        <div className="mt-6 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800 dark:border-red-500/20 dark:bg-red-500/10 dark:text-red-200">
          {err}
        </div>
      ) : null}

      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {items.map((it) => {
          const Icon = it.type === 'video' ? PlayCircle : BookOpen
          return (
            <a
              key={it.id}
              href={it.url}
              target="_blank"
              rel="noreferrer"
              className="group glass soft-shadow rounded-3xl p-6 transition-all hover:-translate-y-1 hover:shadow-lg"
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <div className="text-sm font-semibold tracking-tight">{it.title}</div>
                  <div className="mt-1 text-xs text-slate-600 dark:text-slate-300">
                    {it.category}
                  </div>
                </div>
                <div className="grid h-11 w-11 place-items-center rounded-2xl bg-white/60 dark:bg-white/10">
                  <Icon className="h-5 w-5 text-slate-800 dark:text-slate-100" />
                </div>
              </div>
              <div className="mt-3 text-sm leading-relaxed text-slate-600 dark:text-slate-300">
                {it.description}
              </div>
              <div className="mt-4 text-xs font-medium text-slate-700 underline-offset-4 group-hover:underline dark:text-slate-200">
                Open {it.type}
              </div>
            </a>
          )
        })}
      </div>
    </div>
  )
}

