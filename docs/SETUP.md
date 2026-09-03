# Setup, Development & Packaging

Everything you need to run Typly locally and build the web and desktop apps.

## Prerequisites

- **[Bun](https://bun.sh) ≥ 1.2** — the package manager and task runner (this project
  uses Bun, not npm/yarn).
- **Git**.
- For desktop packaging: **macOS** (to build the `.dmg`), plus the ability to run
  `electron-builder`. Windows and Linux installers can be **cross-built from macOS**
  (see [Desktop packaging](#desktop-packaging)).

> Tip: keep the project in a path **without spaces** where possible. Some native
> toolchains dislike spaces in paths.

## Install

```bash
bun install
```

## Develop

```bash
# Web app with hot reload → http://localhost:5173
bun run dev

# Desktop app (Electron) against the dev server
bun run electron:dev
```

## Type-check & build

```bash
# Type-check only
bun run typecheck

# Production web build → dist/
bun run build

# Preview the production build
bun run preview
```

## AI configuration (optional)

AI features are **bring-your-own-key** and off by default in the offline pipeline.

- Users add their own key in **Settings → AI features** (stored locally in the browser).
- For local development you may set a **server fallback key** so AI works without
  entering one in the UI. Create a `.env` file (see `.env.example`):

  ```ini
  NVIDIA_API_KEY=nvapi-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
  ```

  This key is read only by the dev/preview server (and the Electron main process); it is
  never bundled into the client. Missing keys degrade gracefully to the offline pipeline.

## Desktop packaging

The app bundles the Electron main/preload with esbuild, then packages with
`electron-builder`. Use the helper script to pick target platforms:

```bash
# scripts/build-desktop.sh <flags>
bash scripts/build-desktop.sh --all      # Linux + macOS + Windows
bash scripts/build-desktop.sh --m        # macOS   (dmg)
bash scripts/build-desktop.sh --w        # Windows (NSIS installer)
bash scripts/build-desktop.sh --l        # Linux   (AppImage + deb)

# Combine letters:
bash scripts/build-desktop.sh --lm       # Linux + macOS
bash scripts/build-desktop.sh --wm       # Windows + macOS
bash scripts/build-desktop.sh --l --w    # Linux + Windows
```

Or via the package scripts:

```bash
bun run dist            # macOS dmg
bun run dist:universal  # macOS universal (x64 + arm64)
bun run dist:desktop    # same as scripts/build-desktop.sh
```

Artifacts are written to `release/`.

### Icons

Everything is derived from one 1024px source, `build/icon.png`, by
`bun run icons` — the Windows `.ico` files (app, installer, uninstaller), the Linux
icon theme (`build/icons/16x16.png` … `1024x1024.png`), the tray icons, and the
splash mark. The generated files are **committed**, so packaging never depends on
the script having been run; re-run it and commit the result after changing the mark.

The macOS tray icon is a separate file (`tray-template.png`). A menu-bar icon is a
*template* image — the system reads only its alpha channel so it can tint it for a
light or dark menu bar — so the coloured tile is reduced to just the letter. Handing
macOS the full-colour mark renders a solid blob.

### Native module note

Storage on desktop uses `better-sqlite3`. The build sets `npmRebuild: false` and relies
on better-sqlite3's **NAPI prebuilt binaries** (ABI-stable across Electron), which is why
Windows and Linux installers can be produced from macOS without recompiling native code.

### Code signing & notarization

Builds are **unsigned** by default:

- **macOS** — signing is skipped unless a certificate is available. To notarize, set
  `APPLE_ID`, `APPLE_APP_SPECIFIC_PASSWORD`, and `APPLE_TEAM_ID`, then run `bun run dist`.
- **Windows** — the NSIS installer is unsigned, so users see a SmartScreen
  "unknown publisher" prompt (**More info → Run anyway**). Provide a code-signing
  certificate (`CSC_LINK` / `CSC_KEY_PASSWORD`) to remove it.

The Windows installer is an assisted wizard: **Welcome → License → Choose install
location → Install → Finish (Run Typly)**. Uninstalling leaves your practice data in
place (`deleteAppDataOnUninstall: false`).

On Linux the packaged `.desktop` entry is named after `desktopName` in `package.json`
so it matches Electron's `app_id` / `StartupWMClass` — without that, desktop
environments do not associate the running window with the launcher icon.

## Project structure

```
src/            React app (pages, components, stores, UI)
  core/         Pure logic — typing engine, scoring, analysis, lessons, OCR/grammar helpers
  platform/     Ports & adapters (browser + electron), AI transport
  store/        Zustand stores (settings, AI, language tools, exam)
server/         Framework-agnostic AI backend (coach, grammar, OCR) — mounted in dev/Electron
electron/       Desktop shell — main, preload, IPC (data/, ipc/, shell/)
public/         Static assets (dictionaries, service worker, icons)
build/          Packaging resources — source mark, generated icons, entitlements,
                NSIS installer script, license
scripts/        build-desktop.sh, make-icons.mjs (+ lib/ PNG and ICO writers)
```

## Common scripts

| Command | What it does |
| --- | --- |
| `bun run dev` | Vite dev server (web) |
| `bun run build` | Type-check + production web build |
| `bun run typecheck` | TypeScript only, no emit — renderer *and* Electron main |
| `bun run electron:dev` | Build the Electron bundle and launch against the dev server |
| `bun run electron:build` | Bundle Electron main + preload → `dist-electron/` |
| `bun run dist` | Build + package the macOS app |
| `bun run dist:desktop` | Multi-platform packaging via `scripts/build-desktop.sh` |
| `bun run rebuild` | Rebuild native deps for the Electron ABI |
| `bun run icons` | Regenerate every derived icon from `build/icon.png` |
