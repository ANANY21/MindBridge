import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import DailyTipCard from '../components/DailyTipCard.jsx'
import MoodTracker from '../components/MoodTracker.jsx'

function Glow() {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      <div className="absolute -top-24 left-1/2 h-72 w-[700px] -translate-x-1/2 rounded-full bg-gradient-to-r from-sky-200/60 via-purple-200/50 to-emerald-200/50 blur-3xl dark:from-sky-500/10 dark:via-purple-500/10 dark:to-emerald-500/10" />
      <div className="absolute bottom-[-140px] right-[-160px] h-80 w-80 rounded-full bg-sky-200/40 blur-3xl dark:bg-sky-500/10" />
      <div className="absolute bottom-[-120px] left-[-120px] h-72 w-72 rounded-full bg-purple-200/40 blur-3xl dark:bg-purple-500/10" />
    </div>
  )
}

export default function LandingPage() {
  return (
    <div className="relative">
      <Glow />
      <section className="mx-auto max-w-6xl px-4 pt-10 pb-8 sm:pt-14">
        <div className="grid items-center gap-8 lg:grid-cols-2">
          <div>
            <motion.div
              initial={{ opacity: 0, y: 14, filter: 'blur(10px)' }}
              animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
              transition={{ duration: 0.6, ease: [0.2, 0.9, 0.2, 1] }}
              className="inline-flex items-center gap-2 rounded-full border border-white/30 bg-white/60 px-3 py-1 text-xs font-medium text-slate-700 dark:border-white/10 dark:bg-white/5 dark:text-slate-200"
            >
              MindEase • Calming, private, simple
            </motion.div>
            <motion.h1
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.65, delay: 0.05, ease: [0.2, 0.9, 0.2, 1] }}
              className="mt-4 text-4xl font-semibold tracking-tight sm:text-5xl"
            >
              Your Digital Companion for Wellness.
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.65, delay: 0.12, ease: [0.2, 0.9, 0.2, 1] }}
              className="mt-4 max-w-xl text-base leading-relaxed text-slate-600 dark:text-slate-300"
            >
              Gentle, practical support for stress, sleep, and healthy habits—plus a directory of
              verified helplines when you need to talk to a real person.
            </motion.p>

            <div className="mt-6 flex flex-wrap items-center gap-3">
              <Link
                to="/chat"
                className="rounded-full bg-slate-900 px-6 py-3 text-sm font-medium text-white shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md active:translate-y-0 dark:bg-white dark:text-slate-900"
              >
                Start Chatting
              </Link>
              <Link
                to="/resources"
                className="rounded-full border border-white/30 bg-white/60 px-6 py-3 text-sm font-medium text-slate-700 transition-all hover:-translate-y-0.5 hover:bg-white/75 dark:border-white/10 dark:bg-white/5 dark:text-slate-200 dark:hover:bg-white/10"
              >
                Explore resources
              </Link>
            </div>

            <div className="mt-6 grid gap-3 sm:grid-cols-3">
              {[
                { k: 'Stress Relief', v: 'Grounding, breathing, reframes' },
                { k: 'Sleep Tips', v: 'Wind-down routines that stick' },
                { k: 'Healthy Habits', v: 'Tiny wins, gentle streaks' },
              ].map((i) => (
                <div
                  key={i.k}
                  className="glass rounded-2xl border border-white/20 px-4 py-3 text-left"
                >
                  <div className="text-sm font-semibold">{i.k}</div>
                  <div className="mt-1 text-xs text-slate-600 dark:text-slate-300">{i.v}</div>
                </div>
              ))}
            </div>
          </div>

          <div className="grid gap-4">
            <DailyTipCard />
            <MoodTracker />
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 pb-14">
        <div className="glass rounded-3xl border border-white/20 p-6">
          <div className="text-sm font-semibold tracking-tight">When to get immediate help</div>
          <div className="mt-2 text-sm leading-relaxed text-slate-600 dark:text-slate-300">
            If you or someone else may be in danger, call your local emergency number right away.
            You can also open the helpline directory for verified support options.
          </div>
          <div className="mt-4">
            <Link
              to="/helplines"
              className="rounded-full bg-slate-900 px-5 py-2.5 text-sm font-medium text-white shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md dark:bg-white dark:text-slate-900"
            >
              View helplines
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}

