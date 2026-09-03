# Typly

> Offline-first typing-exam practice for Indian competitive exams.

Typly helps aspirants for **SSC, Railway, Banking, Court and State** exams build real
typing speed and accuracy under exam-accurate conditions — in the browser or as a
desktop app, and fully offline. Bring any passage (paste, image, PDF or DOCX), practise
against the exact scoring your exam uses, and track your progress over time.

---

## Features

### Exam-accurate practice
- Net & gross **WPM**, **accuracy**, and per-mistake analysis matching real exam scoring.
- Built-in **exam profiles** — SSC (CHSL/CGL), Railway, Banking, Court, State & more.
- **Exam mode** with optional exam lock, backspace/space/enter rules, and fullscreen.
- **Mock exam** flow: an instructions briefing, a reading window before the clock starts, and a
  **cut-off report** showing exactly how far each metric sits from the pass mark.
- An interrupted attempt is **checkpointed** — a reload or crash resumes it instead of losing it.

### Bring your own text
- A **sample paragraph** is in your library from the first launch, so there is a full test to
  run before you import anything.
- **Paste** a paragraph, or import from **image (OCR)**, **PDF**, or **DOCX**.
- On-device OCR (Tesseract) with an optional AI vision pass for tough scans.
- **English, Hindi, Marathi, Bengali, Tamil and Gujarati**, with InScript, phonetic and
  Remington GAIL input for Devanagari.

### Learn & improve
- A **beginner → advanced lessons** curriculum that unlocks as you hit targets.
- **Custom lessons** — author your own drills from any text, with categories and targets.
- **Trainer** with two focuses: *accuracy* (weak keys, confused pairs, missed words) and
  *speed* (per-key latency, slowest transitions, rhythm consistency) — each generating its
  own targeted drill.
- **Practice** drills for rows, numbers, symbols, the numpad and real editor shortcuts.

### Language tools
- On-device **grammar** (Harper) and **spell-check** (nspell / low-memory fuzzy match).
- Optional **AI grammar** for English *and* Hindi.

### Optional AI — bring your own key
- An **AI coach** that turns each result into a personalised, targeted practice plan.
- A single master **Enable AI** switch; with AI off, everything falls back to the
  built-in offline pipeline. Your key is stored locally and only ever sent to the AI
  provider you choose.

### Track your progress
- History, per-minute WPM charts, cross-test progress, **badges**, **streaks**, a
  **daily goal**, and a shareable **certificate**.
- **Replay** any attempt keystroke by keystroke to see where the time actually went.
- **Ghost race** — run against a past attempt of the same paragraph, live, as you type.

### Built for focus
- Text-to-speech, an on-screen **keyboard visualisation**, **blind mode**, and a clean,
  distraction-free UI.

---

## Platforms

| Platform | Format |
| --- | --- |
| **Web / PWA** | Runs in any modern browser; installable, works offline |
| **Windows** | `Typly-<version>-x64.exe` · `-arm64.exe` · universal `.exe` (NSIS installer) |
| **macOS** | `Typly-<version>-arm64.dmg` |
| **Linux** | AppImage · `.deb` |

Desktop builds store your data in a local SQLite database; the web app uses your
browser's local storage. Nothing leaves your device unless you enable AI.

---

## Privacy

Typly is **offline-first**. Your practice text, results and settings stay on your
device. AI features are entirely optional and **bring-your-own-key** — the app works
fully without them.

---

## Tech

React 19 · TypeScript · Vite · Tailwind CSS v4 · Zustand · Electron · better-sqlite3 ·
Harper.js (WASM grammar) · Tesseract.js (OCR) · pdf.js · Bun.

---

## Documentation

- **Setup, development & packaging** → [docs/SETUP.md](docs/SETUP.md)

---

## Made by

Designed and developed by **[enjoys](https://enjoys.in)** — a professional app
development studio.

- Website: https://enjoys.in
- GitHub: https://github.com/enjoys-in

## License

© 2026 enjoys. See the in-app agreement in [build/license.txt](build/license.txt).
For licensing or commercial use, reach out via [enjoys.in](https://enjoys.in).
