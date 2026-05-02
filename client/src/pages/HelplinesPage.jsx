import { useEffect, useMemo, useState } from 'react'
import { listHelplines } from '../lib/api.js'
import { PhoneCall, MapPin, ShieldCheck } from 'lucide-react'

function detectCountry() {
  const lang = navigator.language || 'en-IN'
  const m = lang.split('-')[1]
  return (m || 'IN').toUpperCase()
}

export default function HelplinesPage() {
  const [country, setCountry] = useState(() => detectCountry())
  const [items, setItems] = useState([])
  const [err, setErr] = useState('')

  const countries = useMemo(
    () => [
      { id: 'IN', label: 'India' },
      { id: 'US', label: 'United States' },
      { id: 'GB', label: 'United Kingdom' },
      { id: 'AU', label: 'Australia' },
      { id: 'CA', label: 'Canada' },
    ],
    []
  )

  useEffect(() => {
    setErr('')
    listHelplines(country)
      .then((d) => setItems(d?.items || []))
      .catch((e) => setErr(e?.message || 'Failed to load helplines'))
  }, [country])

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <div className="text-2xl font-semibold tracking-tight">Verified Helplines</div>
          <div className="mt-1 text-sm text-slate-600 dark:text-slate-300">
            Click-to-call support numbers. If you’re in immediate danger, call your local emergency
            number.
          </div>
        </div>
        <div className="flex items-center gap-2">
          <MapPin className="h-4 w-4 text-slate-600 dark:text-slate-300" />
          <select
            value={country}
            onChange={(e) => setCountry(e.target.value)}
            className="rounded-2xl border border-white/30 bg-white/60 px-3 py-2 text-sm text-slate-800 outline-none transition-all focus:ring-2 focus:ring-sky-200 dark:border-white/10 dark:bg-white/5 dark:text-slate-100 dark:focus:ring-sky-500/30"
          >
            {countries.map((c) => (
              <option key={c.id} value={c.id}>
                {c.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {err ? (
        <div className="mt-6 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800 dark:border-red-500/20 dark:bg-red-500/10 dark:text-red-200">
          {err}
        </div>
      ) : null}

      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {items.map((it) => (
          <div key={it.id} className="glass soft-shadow rounded-3xl p-6">
            <div className="flex items-start justify-between gap-4">
              <div>
                <div className="text-sm font-semibold tracking-tight">{it.name}</div>
                <div className="mt-1 text-xs text-slate-600 dark:text-slate-300">{it.notes}</div>
              </div>
              <div className="grid h-11 w-11 place-items-center rounded-2xl bg-white/60 dark:bg-white/10">
                <ShieldCheck className="h-5 w-5 text-slate-800 dark:text-slate-100" />
              </div>
            </div>

            <div className="mt-4 flex flex-wrap items-center gap-2">
              {it.phones.map((p) => (
                <a
                  key={p}
                  href={`tel:${p}`}
                  className="inline-flex items-center gap-2 rounded-full bg-slate-900 px-4 py-2 text-sm font-medium text-white shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md dark:bg-white dark:text-slate-900"
                >
                  <PhoneCall className="h-4 w-4" />
                  {p}
                </a>
              ))}
            </div>

            {it.url ? (
              <a
                href={it.url}
                target="_blank"
                rel="noreferrer"
                className="mt-3 inline-block text-xs font-medium text-slate-700 underline-offset-4 hover:underline dark:text-slate-200"
              >
                Learn more
              </a>
            ) : null}
          </div>
        ))}
      </div>
    </div>
  )
}

