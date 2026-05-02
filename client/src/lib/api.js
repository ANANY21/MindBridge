const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:5050'

async function safeJson(res) {
  const text = await res.text()
  try {
    return JSON.parse(text)
  } catch {
    return { ok: res.ok, raw: text }
  }
}

export async function sendChat({ text, sessionId, category }) {
  const res = await fetch(`${API_BASE}/api/chat`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ text, sessionId, category }),
  })
  const data = await safeJson(res)
  if (!res.ok) throw new Error(data?.error || 'Chat request failed')
  return data
}

export async function getDailyTip() {
  const res = await fetch(`${API_BASE}/api/tips/daily`)
  const data = await safeJson(res)
  if (!res.ok) throw new Error(data?.error || 'Failed to fetch tip')
  return data
}

export async function listHelplines(country = 'IN') {
  const res = await fetch(`${API_BASE}/api/helplines?country=${encodeURIComponent(country)}`)
  const data = await safeJson(res)
  if (!res.ok) throw new Error(data?.error || 'Failed to fetch helplines')
  return data
}

export async function listResources() {
  const res = await fetch(`${API_BASE}/api/resources`)
  const data = await safeJson(res)
  if (!res.ok) throw new Error(data?.error || 'Failed to fetch resources')
  return data
}

export async function logMood({ mood, note }) {
  const res = await fetch(`${API_BASE}/api/mood`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ mood, note }),
  })
  const data = await safeJson(res)
  if (!res.ok) throw new Error(data?.error || 'Failed to log mood')
  return data
}

export async function listMood() {
  const res = await fetch(`${API_BASE}/api/mood`)
  const data = await safeJson(res)
  if (!res.ok) throw new Error(data?.error || 'Failed to fetch mood')
  return data
}

