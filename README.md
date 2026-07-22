# AskChatAI

Multi-Model Chat-App mit Vite + React. Unterstuetzt mehrere KI-Modelle parallel in unabhaengigen Tabs.

## Features

- **Multi-Tab Chats** — mehrere Konversationen gleichzeitig, unabhaengig voneinander
- **Zwei Modelle** — Kimi-K2.6 und MiniMax-M2.7 ueber Dahl Inference API
- **Light/Dark Mode** — Umschalter oben rechts
- **Vollbild-Layout** — passt sich dem Bildschirm an
- **CLI-Tool** — `ask-dahl.py` fuer Terminal-Chat mit Tool-Zugriff

## Setup

```bash
npm install
cp .env.example .env    # VITE_API_KEY eintragen
npm run dev
```

## .env

```
VITE_API_KEY=dein-api-key
```

## Build & Deploy

```bash
npm run build    # Output in dist/
```

Zum Deployen auf Vercel: Repo importieren, `VITE_API_KEY` als Environment Variable setzen.

## CLI-Tool

```bash
python ask-dahl.py                    # Interaktiver Chat
Get-Content datei.txt | python ask-dahl.py "Erklaere das"   # Pipe-Modus
```

## Tech

- React 19
- Vite 8
- Dahl Inference API (OpenAI-kompatibel)
