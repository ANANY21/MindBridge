# MindEase (Web + Mobile-ready)

MindEase is a calming mental wellness platform with a beautiful landing page, a modern chatbot UI, mood tracking + streaks/badges, a resource library, and a verified helpline directory.

## Tech

- **Frontend**: React + Vite + Tailwind CSS + Framer Motion
- **Backend**: Node.js + Express
- **Chat engine**: Dialogflow (optional; mock fallback included)
- **Database**: MongoDB (optional; in-memory fallback included)

## Run locally

### 1) Backend

```bash
cd server
copy .env.example .env
npm install
npm run dev
```

### 2) Frontend

```bash
cd client
copy .env.example .env
npm install
npm run dev
```

Open the app at `http://localhost:5173`.

## Dialogflow setup (optional)

If you want real Dialogflow responses:

- Create a Dialogflow agent in Google Cloud
- Create a service account JSON and set `GOOGLE_APPLICATION_CREDENTIALS` in `server/.env`
- Set `DIALOGFLOW_PROJECT_ID` in `server/.env`

If not configured, the server automatically uses **mock mode** so the app still works end-to-end.

## Mobile

The UI is fully responsive and can be wrapped as a mobile app via Capacitor/React Native WebView if you want (not required to run).

