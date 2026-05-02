const express = require('express')
const cors = require('cors')
const dotenv = require('dotenv')
const mongoose = require('mongoose')
const { v4: uuidv4 } = require('uuid')

dotenv.config()

const PORT = process.env.PORT || 5050
const CLIENT_ORIGIN = process.env.CLIENT_ORIGIN || 'http://localhost:5173'

const app = express()
const localhostDevOrigin = /^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/i
const lanDevOrigin = /^https?:\/\/(10\.\d{1,3}\.\d{1,3}\.\d{1,3}|192\.168\.\d{1,3}\.\d{1,3}|172\.(1[6-9]|2\d|3[0-1])\.\d{1,3}\.\d{1,3})(:\d+)?$/i
app.use(
  cors({
    origin: (origin, cb) => {
      // Allow same-origin / curl / server-to-server requests
      if (!origin) return cb(null, true)

      // Dev convenience: allow localhost + LAN origins for Vite network URL
      if (origin === CLIENT_ORIGIN || localhostDevOrigin.test(origin) || lanDevOrigin.test(origin)) {
        return cb(null, true)
      }

      return cb(new Error(`CORS blocked for origin: ${origin}`))
    },
  })
)
app.use(express.json({ limit: '1mb' }))

// --- Optional MongoDB (falls back to in-memory if not configured) ---
let MoodLog = null
let mongoReady = false
const memoryMoodLogs = []

async function connectMongo() {
  const uri = process.env.MONGO_URI
  if (!uri) return false
  await mongoose.connect(uri)
  const moodSchema = new mongoose.Schema(
    {
      mood: { type: String, enum: ['happy', 'sad', 'anxious', 'okay'], required: true },
      note: { type: String, default: '' },
      createdAt: { type: Date, default: Date.now },
    },
    { versionKey: false }
  )
  MoodLog = mongoose.models.MoodLog || mongoose.model('MoodLog', moodSchema)
  return true
}

// --- Dialogflow integration (safe fallback to mock responses) ---
let dialogflowSessionClient = null
let dialogflowProjectId = process.env.DIALOGFLOW_PROJECT_ID || ''

function canUseDialogflow() {
  // If GOOGLE_APPLICATION_CREDENTIALS is set to a service account JSON path,
  // @google-cloud/dialogflow can auth automatically.
  return Boolean(process.env.GOOGLE_APPLICATION_CREDENTIALS && dialogflowProjectId)
}

async function getDialogflowClient() {
  if (dialogflowSessionClient) return dialogflowSessionClient
  const dialogflow = require('@google-cloud/dialogflow')
  dialogflowSessionClient = new dialogflow.SessionsClient()
  return dialogflowSessionClient
}

function mockDetectIntent(text, category) {
  const t = (text || '').toLowerCase()
  if (category === 'helplines' || t.includes('helpline') || t.includes('suicide') || t.includes('crisis')) {
    return 'I can share verified helplines. Tell me your country code (e.g., IN, US), or open the Helplines tab for click‑to‑call.'
  }
  if (category === 'sleep' || t.includes('sleep') || t.includes('insomnia')) {
    return 'Try a 10‑minute wind‑down: dim lights, put your phone away, and do 4‑7‑8 breathing (inhale 4, hold 7, exhale 8) for 4 rounds.'
  }
  if (category === 'habits' || t.includes('habit') || t.includes('routine')) {
    return 'A gentle habit to start: a 2‑minute “tiny tidy” after meals. It lowers stress and builds momentum without feeling heavy.'
  }
  // stress default
  return 'Let’s do a quick reset: name 5 things you can see, 4 you can feel, 3 you can hear, 2 you can smell, 1 you can taste. Want a 60‑second breathing option too?'
}

async function detectIntent({ text, sessionId, languageCode = 'en', category }) {
  if (!canUseDialogflow()) {
    return { reply: mockDetectIntent(text, category), engine: 'mock' }
  }

  const client = await getDialogflowClient()
  const sessionPath = client.projectAgentSessionPath(dialogflowProjectId, sessionId)

  const request = {
    session: sessionPath,
    queryInput: {
      text: { text, languageCode },
    },
    queryParams: {
      payload: {
        fields: {
          category: { stringValue: category || '' },
        },
      },
    },
  }

  const [response] = await client.detectIntent(request)
  const result = response.queryResult
  const reply =
    result?.fulfillmentText ||
    result?.fulfillmentMessages?.[0]?.text?.text?.[0] ||
    mockDetectIntent(text, category)
  return { reply, engine: 'dialogflow' }
}

// --- Data: helplines + resources + tips ---
const HELPLINES = {
  IN: [
    {
      id: 'in-1',
      name: 'AASRA',
      phones: ['+91-22-27546669'],
      notes: '24/7 emotional support (India)',
      url: 'https://aasra.info/',
    },
    {
      id: 'in-2',
      name: 'KIRAN (Govt. of India)',
      phones: ['1800-599-0019'],
      notes: 'National mental health rehabilitation helpline',
      url: 'https://www.mohfw.gov.in/',
    },
  ],
  US: [
    {
      id: 'us-1',
      name: '988 Suicide & Crisis Lifeline',
      phones: ['988'],
      notes: 'Call or text 988 (US)',
      url: 'https://988lifeline.org/',
    },
  ],
  GB: [
    {
      id: 'gb-1',
      name: 'Samaritans',
      phones: ['116 123'],
      notes: '24/7 listening support (UK & ROI)',
      url: 'https://www.samaritans.org/',
    },
  ],
  AU: [
    {
      id: 'au-1',
      name: 'Lifeline Australia',
      phones: ['13 11 14'],
      notes: '24/7 crisis support (Australia)',
      url: 'https://www.lifeline.org.au/',
    },
  ],
  CA: [
    {
      id: 'ca-1',
      name: 'Talk Suicide Canada',
      phones: ['988'],
      notes: 'Call or text 988 (Canada)',
      url: 'https://talksuicide.ca/',
    },
  ],
}

const RESOURCES = [
  {
    id: 'r-1',
    type: 'article',
    category: 'Mindfulness',
    title: 'A 2-minute grounding practice',
    description: 'A quick sensory reset you can do anywhere.',
    url: 'https://www.mindful.org/mindfulness-how-to-do-it/',
  },
  {
    id: 'r-2',
    type: 'video',
    category: 'Breathing',
    title: 'Box breathing (guided)',
    description: 'A calming 4-4-4-4 breathing pattern.',
    url: 'https://www.youtube.com/results?search_query=box+breathing+guided',
  },
  {
    id: 'r-3',
    type: 'article',
    category: 'Sleep',
    title: 'Healthy sleep basics',
    description: 'Simple changes that improve sleep quality over time.',
    url: 'https://www.sleepfoundation.org/sleep-hygiene',
  },
]

const DAILY_TIPS = [
  { title: 'Breathe out longer', text: 'Exhale slowly for 6 seconds, inhale for 4 seconds. Repeat for 2 minutes.' },
  { title: 'Tiny walk, big shift', text: 'A 5-minute walk can reduce stress and reset your attention—no perfection needed.' },
  { title: 'Kind inner voice', text: 'Ask: “What would I say to a friend feeling this?” Then say it to yourself.' },
]

function tipOfDay() {
  const d = new Date()
  const idx = (d.getFullYear() + d.getMonth() + d.getDate()) % DAILY_TIPS.length
  return DAILY_TIPS[idx]
}

function moodSuggestion(mood) {
  if (mood === 'anxious') return 'Thanks for sharing. Want a 60‑second grounding exercise right now?'
  if (mood === 'sad') return 'I’m here with you. Would a small self‑kindness prompt or a gentle routine help today?'
  if (mood === 'happy') return 'Love that. Want a habit to help you keep this steady—like a 2‑minute gratitude note?'
  return 'Thanks. Want a small “today plan” with one calming step and one practical step?'
}

// --- Routes ---
app.get('/', (req, res) => {
  res
    .status(200)
    .type('html')
    .send(
      [
        '<html><head><title>MindEase API</title><meta name="viewport" content="width=device-width, initial-scale=1" /></head>',
        '<body style="font-family: system-ui, Segoe UI, Arial; padding: 24px; line-height: 1.5">',
        '<h2 style="margin:0 0 8px">MindEase backend is running ✅</h2>',
        '<p style="margin:0 0 16px">This is an API server. Try these endpoints:</p>',
        '<ul>',
        '<li><a href="/api/health">/api/health</a></li>',
        '<li><a href="/api/tips/daily">/api/tips/daily</a></li>',
        '<li><a href="/api/resources">/api/resources</a></li>',
        '<li><a href="/api/helplines?country=IN">/api/helplines?country=IN</a></li>',
        '</ul>',
        '<p style="margin-top:16px">The web UI runs separately from Vite (usually <code>http://localhost:5174</code>).</p>',
        '</body></html>',
      ].join('')
    )
})

app.get('/api/health', (req, res) => res.json({ ok: true }))

app.get('/api/tips/daily', (req, res) => {
  res.json(tipOfDay())
})

app.get('/api/resources', (req, res) => {
  res.json({ items: RESOURCES })
})

app.get('/api/helplines', (req, res) => {
  const country = String(req.query.country || 'IN').toUpperCase()
  const items = HELPLINES[country] || HELPLINES.IN
  res.json({ country, items })
})

app.post('/api/chat', async (req, res) => {
  const { text, sessionId, category } = req.body || {}
  if (!text || typeof text !== 'string') return res.status(400).json({ error: 'text is required' })
  const sid = sessionId && typeof sessionId === 'string' ? sessionId : uuidv4()
  try {
    const out = await detectIntent({ text, sessionId: sid, category })
    res.json({ sessionId: sid, reply: out.reply, engine: out.engine })
  } catch (e) {
    res.status(500).json({ error: 'Dialogflow request failed', detail: e?.message })
  }
})

app.get('/api/mood', async (req, res) => {
  try {
    if (mongoReady && MoodLog) {
      const items = await MoodLog.find({}).sort({ createdAt: -1 }).limit(50).lean()
      return res.json({ items })
    }
    res.json({ items: memoryMoodLogs.slice(-50).reverse() })
  } catch (e) {
    res.status(500).json({ error: 'Failed to fetch moods', detail: e?.message })
  }
})

app.post('/api/mood', async (req, res) => {
  const { mood, note = '' } = req.body || {}
  if (!['happy', 'sad', 'anxious', 'okay'].includes(mood)) {
    return res.status(400).json({ error: 'mood must be one of happy|sad|anxious|okay' })
  }
  const doc = { id: uuidv4(), mood, note: String(note || ''), createdAt: new Date().toISOString() }

  try {
    if (mongoReady && MoodLog) {
      const saved = await MoodLog.create({ mood, note: String(note || '') })
      return res.json({ ok: true, item: saved.toObject(), suggestion: moodSuggestion(mood) })
    }
    memoryMoodLogs.push(doc)
    res.json({ ok: true, item: doc, suggestion: moodSuggestion(mood) })
  } catch (e) {
    res.status(500).json({ error: 'Failed to save mood', detail: e?.message })
  }
})

async function start() {
  try {
    mongoReady = await connectMongo()
    if (mongoReady) console.log('MongoDB connected')
    else console.log('MongoDB not configured; using in-memory storage')
  } catch (e) {
    console.log('MongoDB connection failed; using in-memory storage:', e?.message)
  }

  console.log(`Dialogflow: ${canUseDialogflow() ? 'enabled' : 'mock mode'}`)
  app.listen(PORT, () => console.log(`MindEase server running on http://localhost:${PORT}`))
}

start()

