import { AnimatePresence, motion } from 'framer-motion'
import { useEffect, useMemo, useRef, useState } from 'react'
import { sendChat } from '../lib/api.js'
import { CornerDownLeft, Sparkles } from 'lucide-react'

const CATEGORIES = [
  { id: 'stress', label: 'Stress Relief' },
  { id: 'sleep', label: 'Sleep Tips' },
  { id: 'habits', label: 'Healthy Habits' },
  { id: 'helplines', label: 'Helpline Directory' },
]

const QUICK_REPLIES = [
  { label: 'Give me a quick grounding exercise', category: 'stress' },
  { label: 'Help me sleep better tonight', category: 'sleep' },
  { label: 'Suggest a healthy habit to start', category: 'habits' },
  { label: 'Show helplines near me', category: 'helplines' },
]

function uid() {
  return Math.random().toString(16).slice(2) + Date.now().toString(16)
}

function bubbleMotion(from) {
  const x = from === 'user' ? 8 : -8
  return {
    initial: { opacity: 0, y: 10, x, scale: 0.98, filter: 'blur(6px)' },
    animate: { opacity: 1, y: 0, x: 0, scale: 1, filter: 'blur(0px)' },
    exit: { opacity: 0, y: -6, filter: 'blur(6px)' },
  }
}

function TypingDots() {
  return (
    <div className="flex items-center gap-1.5">
      {[0, 1, 2].map((i) => (
        <motion.span
          key={i}
          className="h-2 w-2 rounded-full bg-slate-400/70 dark:bg-slate-300/50"
          animate={{ y: [0, -4, 0], opacity: [0.4, 1, 0.4] }}
          transition={{ duration: 0.9, repeat: Infinity, delay: i * 0.15 }}
        />
      ))}
    </div>
  )
}

export default function ChatWindow({ seedSuggestion }) {
  const [sessionId] = useState(() => localStorage.getItem('mindease_session') || uid())
  const [category, setCategory] = useState('stress')
  const [input, setInput] = useState('')
  const [sending, setSending] = useState(false)
  const [messages, setMessages] = useState(() => [
    {
      id: uid(),
      from: 'bot',
      text: 'Hi, I’m MindEase. Pick a category or ask me anything about general wellness.',
      ts: Date.now(),
    },
  ])
  const listRef = useRef(null)

  useEffect(() => {
    localStorage.setItem('mindease_session', sessionId)
  }, [sessionId])

  useEffect(() => {
    if (!seedSuggestion) return
    setMessages((m) => [
      ...m,
      { id: uid(), from: 'bot', text: seedSuggestion, ts: Date.now() },
    ])
  }, [seedSuggestion])

  useEffect(() => {
    const el = listRef.current
    if (!el) return
    el.scrollTop = el.scrollHeight
  }, [messages, sending])

  const canSend = useMemo(() => input.trim().length > 0 && !sending, [input, sending])

  async function send(text, nextCategory) {
    const t = (text ?? input).trim()
    if (!t) return

    setInput('')
    setMessages((m) => [...m, { id: uid(), from: 'user', text: t, ts: Date.now() }])
    setSending(true)

    try {
      const res = await sendChat({ text: t, sessionId, category: nextCategory || category })
      const replyText = res?.reply || 'I’m here with you. Want a short breathing reset?'
      setMessages((m) => [...m, { id: uid(), from: 'bot', text: replyText, ts: Date.now() }])
    } catch (e) {
      setMessages((m) => [
        ...m,
        {
          id: uid(),
          from: 'bot',
          text:
            e?.message ||
            'I couldn’t reach the chat service right now. Try again, or pick a quick reply.',
          ts: Date.now(),
        },
      ])
    } finally {
      setSending(false)
    }
  }

  return (
    <div className="glass soft-shadow rounded-3xl overflow-hidden">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/20 bg-white/30 px-5 py-4 dark:border-white/10 dark:bg-white/5">
        <div>
          <div className="text-sm font-semibold tracking-tight">Chat</div>
          <div className="text-xs text-slate-600 dark:text-slate-300">
            General wellness tips • Not medical advice
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {CATEGORIES.map((c) => {
            const active = c.id === category
            return (
              <button
                key={c.id}
                type="button"
                onClick={() => setCategory(c.id)}
                className={[
                  'rounded-full px-3 py-1.5 text-xs font-medium transition-all',
                  active
                    ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900'
                    : 'bg-white/60 text-slate-700 hover:bg-white/75 dark:bg-white/5 dark:text-slate-200 dark:hover:bg-white/10',
                ].join(' ')}
              >
                {c.label}
              </button>
            )
          })}
        </div>
      </div>

      <div className="grid grid-rows-[1fr_auto]">
        <div ref={listRef} className="h-[52vh] min-h-[360px] overflow-y-auto px-4 py-4">
          <div className="mx-auto flex w-full max-w-3xl flex-col gap-3">
            <AnimatePresence initial={false}>
              {messages.map((m) => {
                const isUser = m.from === 'user'
                return (
                  <motion.div
                    key={m.id}
                    variants={bubbleMotion(m.from)}
                    initial="initial"
                    animate="animate"
                    exit="exit"
                    transition={{ duration: 0.25, ease: [0.2, 0.9, 0.2, 1] }}
                    className={[
                      'flex',
                      isUser ? 'justify-end' : 'justify-start',
                    ].join(' ')}
                  >
                    <div
                      className={[
                        'max-w-[82%] rounded-3xl px-4 py-3 text-sm leading-relaxed',
                        isUser
                          ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900'
                          : 'bg-white/70 text-slate-800 dark:bg-white/5 dark:text-slate-100 border border-white/20 dark:border-white/10',
                      ].join(' ')}
                    >
                      {m.text}
                    </div>
                  </motion.div>
                )
              })}
            </AnimatePresence>

            {sending ? (
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex justify-start"
              >
                <div className="flex items-center gap-2 rounded-3xl border border-white/20 bg-white/70 px-4 py-3 text-sm text-slate-700 dark:border-white/10 dark:bg-white/5 dark:text-slate-200">
                  <Sparkles className="h-4 w-4 opacity-80" />
                  <TypingDots />
                </div>
              </motion.div>
            ) : null}
          </div>
        </div>

        <div className="border-t border-white/20 bg-white/30 px-4 py-4 dark:border-white/10 dark:bg-white/5">
          <div className="mx-auto w-full max-w-3xl">
            <div className="flex flex-wrap gap-2">
              {QUICK_REPLIES.map((q) => (
                <button
                  key={q.label}
                  type="button"
                  onClick={() => {
                    setCategory(q.category)
                    send(q.label, q.category)
                  }}
                  className="rounded-full border border-white/25 bg-white/60 px-3 py-1.5 text-xs font-medium text-slate-700 transition-all hover:-translate-y-0.5 hover:bg-white/75 dark:border-white/10 dark:bg-white/5 dark:text-slate-200 dark:hover:bg-white/10"
                >
                  {q.label}
                </button>
              ))}
            </div>

            <div className="mt-3 flex items-end gap-2">
              <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault()
                    if (canSend) send()
                  }
                }}
                placeholder="Type a message… (emoji supported)"
                rows={1}
                className="min-h-[48px] flex-1 resize-none rounded-2xl border border-white/30 bg-white/70 px-4 py-3 text-sm text-slate-900 outline-none transition-all placeholder:text-slate-500 focus:ring-2 focus:ring-sky-200 dark:border-white/10 dark:bg-white/5 dark:text-white dark:placeholder:text-slate-400 dark:focus:ring-sky-500/30"
              />
              <button
                type="button"
                onClick={() => send()}
                disabled={!canSend}
                className="inline-flex h-12 items-center gap-2 rounded-2xl bg-slate-900 px-4 text-sm font-medium text-white shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md disabled:opacity-50 disabled:hover:translate-y-0 dark:bg-white dark:text-slate-900"
              >
                Send <CornerDownLeft className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

