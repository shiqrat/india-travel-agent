# India Travel Agent

A full-stack AI travel agent for planning trips across India, powered by **IBM watsonx AI** (Llama 3.3 70B).

## Project Structure

```
travel-agent/
├── backend/
│   ├── server.js       ← Express API server
│   ├── config.js       ← watsonx credentials
│   └── package.json
├── frontend/
│   └── index.html      ← Single-page chat UI
└── start.ps1           ← One-click startup script
```

## How to Run

### Step 1 — Install & Start the Backend

```powershell
cd travel-agent/backend
npm install
node server.js
```

Backend will run at **http://localhost:3001**

### Step 2 — Open the Frontend

Open `travel-agent/frontend/index.html` directly in your browser.

> The frontend connects to `http://localhost:3001/api/chat` automatically.

---

## Features

- 💬 Conversational AI travel planning (multi-turn chat)
- 🏰 Expert knowledge of all Indian destinations
- 🗺️ Itinerary, budget, transport, food & culture advice
- ⚡ Quick suggestion chips for popular destinations
- 📱 Fully responsive mobile-friendly UI
- 🎨 India-themed design (saffron, navy, green)

## API Endpoints

| Method | Path | Description |
|--------|------|-------------|
| POST | `/api/chat` | Send chat messages, get AI travel advice |
| GET  | `/api/health` | Health check |
