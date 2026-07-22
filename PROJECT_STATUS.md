# PROJECT_STATUS

**Stand:** 23.07.2026
**Version:** 1.0.2

## Aktuelle Funktionalitaet

### Funktioniert
- [x] User Registration / Login / Logout (JWT, 30 Tage)
- [x] Chat erstellen, wechseln, loeschen
- [x] Nachrichten senden und AI-Antworten empfangen
- [x] Chat-Historie in Neon DB speichern
- [x] Auto-Name (erste Nachricht wird Chat-Name)
- [x] Light/Dark Mode Toggle
- [x] Glassmorphism UI Design
- [x] Model-Wechsel (Kimi-K2.6 / MiniMax-M2.7)
- [x] Memory System (Erinnerungen die bei jedem Request injiziert werden)
- [x] Auto-Summarize (alle 20 Nachrichten, Sliding Window mit letzten 10)
- [x] Chat laden nach Re-Login
- [x] Mobile responsive Design (Slide-out Sidebar, iOS Safe Area, viewport-fit)

### Bekannte Limitationen
- [ ] Chats werden in der Sidebar nicht korrekt nach Datum sortiert angezeigt
- [ ] Keine Chat-Umbennenung via UI (nur Auto-Name)
- [ ] Keine Message-Editierung / Loeschung einzelner Nachrichten
- [ ] Keine Export/Import Funktion
- [ ] Keine Multi-Language UI (nur Deutsch)

## Architektur

```
Frontend (React)                 Backend (Vercel Functions)
─────────────────               ─────────────────────────
useChat.js          ──────►    /api/chats      ──► Neon DB
ChatMessages.jsx     ◄──────    /api/memory     ──► Neon DB
Sidebar.jsx          ◄──────    /api/login      ──► Neon DB
MemoriesPanel.jsx    ◄──────    /api/register   ──► Neon DB
                                  /api/chat*     ──► Dahl API

* = Chat-Proxy der Memories als System-Prompt injiziert
```

## Memory System

**Konzept:** Erinnerungen werden als System-Prompt bei jedem AI-Request vorangestellt.

**Beispiel:**
```
System: Du bist ein hilfreicher Assistent. Hier sind wichtige Fakten ueber den Nutzer:
        - Ich heisse Max
        - Ich spreche Deutsch
User: Wie heisse ich?
```

**Speicherort:** `memories` Tabelle in Neon DB

## Auto-Summarize

**Trigger:** Alle 20 Nachrichten (nach dem Senden einer Antwort)

**Ablauf:**
1. Alle 20 Nachrichten werden an die AI geschickt mit: "Fasse zusammen"
2. Die Zusammenfassung wird in der `chats.summary` Spalte gespeichert
3. Ab dann: Nur letzte 10 Nachrichten + Zusammenfassung werden geschickt

**Vorteil:** ~60% Tokens gespart bei langen Chats

## Offene Tasks

- [ ] Performance: API Response-Caching
- [ ] UX: Loading-Indicator beim Senden
- [ ] UX: Toast-Notifications fuer Erfolg/Fehler
- [ ] Feature: Chat durchsuchen
- [ ] Feature: Chat teilen (export als Link)
- [ ] Feature: Chat als PDF exportieren

## Deployment

**Live URL:** https://askchatai.vercel.app

**Letzter Deploy:** 23.07.2026 (iOS Mobile Fixes + Safe Area + Viewport)

## Technische Schulden

1. `api/chat.js` hat noch Debug-Logs (`console.log`) — vor Production entfernen
2. Keine Input-Validation auf API-Seite
3. Keine Rate-Limiting
4. JWT Secret ist gehashed in DB, aber Password-Hashing mit niedriger Salt-Rounds (10)
