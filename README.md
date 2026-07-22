# AskChatAI

Multi-Model Chat-App mit Vite + React, Vercel Deployment, Neon DB und Glassmorphism UI.

## Features

- **Multi-Tab Chats** — mehrere Konversationen gleichzeitig, unabhaengig voneinander
- **Zwei Modelle** — Kimi-K2.6 und MiniMax-M2.7 ueber Dahl Inference API
- **Light/Dark Mode** — Umschalter in der SettingsBar
- **Glassmorphism UI** — modernes Blur-Glass Design
- **Auto-Name** — Chats werden automatisch nach der ersten Nachricht benannt
- **Memory System** — Persistente Erinnerungen die bei jedem AI-Request als System-Prompt injiziert werden
- **Auto-Summarize** — Lange Chats werden alle 20 Nachrichten automatisch zusammengefasst (Sliding Window)
- **Auth** — Email/Password Login mit JWT (30 Tage Token)
- **Neon DB** — Alle Chats und Memories werden server-side gespeichert

## Tech Stack

- **Frontend:** React 19, Vite 8, vanilla CSS
- **Backend:** Vercel Serverless Functions (Node.js)
- **Datenbank:** Neon PostgreSQL mit `@neondatabase/serverless`
- **Auth:** JWT mit `jsonwebtoken` + `bcryptjs`
- **Inference:** Dahl OpenAI-kompatible API
- **Deploy:** Vercel

## Setup (Lokal)

```bash
npm install
cp .env.example .env    # Variablen eintragen
npm run dev
```

## .env (lokal)

```
VITE_API_KEY=dein-dahl-api-key
JWT_SECRET=ein-geheimer-schluessel
DATABASE_URL=postgresql://user:pass@host/dbname
```

## Environment Variables (Vercel)

| Name | Value |
|------|-------|
| `VITE_API_KEY` | Dein Dahl API Key |
| `JWT_SECRET` | Geheimer Schluessel (min 32 Zeichen) |
| `DATABASE_URL` | Neon Connection String |

## Build & Deploy

```bash
npm run build    # Output in dist/
git push         # Auto-Deploy auf Vercel
```

## API Endpoints

| Endpoint | Methode | Beschreibung |
|----------|---------|--------------|
| `/api/register` | POST | Registrieren mit email/password |
| `/api/login` | POST | Login, gibt JWT zurueck |
| `/api/chats` | GET | Alle Chats des Users laden |
| `/api/chats` | POST | Chat speichern/aktualisieren |
| `/api/chats` | DELETE | Chat loeschen |
| `/api/memory` | GET | Alle Memories laden |
| `/api/memory` | POST | Neue Erinnerung speichern |
| `/api/memory` | DELETE | Erinnerung loeschen |
| `/api/health` | GET | Server-Status (DB, JWT) |

## Projekt-Status

Siehe `PROJECT_STATUS.md` fuer aktuellen Entwicklungsstand.
