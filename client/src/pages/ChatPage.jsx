import { useState } from 'react'
import ChatWindow from '../components/ChatWindow.jsx'
import MoodTracker from '../components/MoodTracker.jsx'

export default function ChatPage() {
  const [seedSuggestion, setSeedSuggestion] = useState('')

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <div className="grid gap-6 lg:grid-cols-[1fr_380px]">
        <ChatWindow seedSuggestion={seedSuggestion} />
        <div className="space-y-6">
          <MoodTracker
            onSuggestion={(s) => {
              if (!s) return
              setSeedSuggestion(s)
            }}
          />
          <div className="glass rounded-3xl p-6">
            <div className="text-sm font-semibold tracking-tight">Tip</div>
            <div className="mt-2 text-sm leading-relaxed text-slate-600 dark:text-slate-300">
              Try short prompts like “I feel tense right now 😟” or “Give me a 2-minute wind-down
              routine.”
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

