#!/usr/bin/env bash
# Build Typly desktop installers for the selected platform(s).
#
#   scripts/build-desktop.sh <flags>
#
#   --l / --linux     Linux   (AppImage + deb)
#   --m / --mac       macOS   (dmg)
#   --w / --win       Windows (NSIS installer)
#   --all             all three
#   combine letters:  --lm, --wm, --lw, --lwm   (e.g. --lm = Linux + Mac)
#   -h / --help       show this help
#
# Examples:
#   scripts/build-desktop.sh --all
#   scripts/build-desktop.sh --m
#   scripts/build-desktop.sh --lm
#   scripts/build-desktop.sh --l --w
set -euo pipefail

# Run from the repo root regardless of where the script is invoked from.
cd "$(dirname "$0")/.."

L=0 # linux
M=0 # mac
W=0 # windows

usage() {
  sed -n '2,17p' "$0" | sed 's/^# \{0,1\}//'
}

[[ $# -eq 0 ]] && {
  echo "No platform selected." >&2
  usage
  exit 1
}

for arg in "$@"; do
  case "$arg" in
    -h | --help)
      usage
      exit 0
      ;;
    --all | all)
      L=1 M=1 W=1
      ;;
    *)
      s="${arg#--}"
      s="${s#-}"
      case "$s" in
        linux) L=1 ;;
        mac | macos | osx) M=1 ;;
        win | windows) W=1 ;;
        *)
          # Any combination of the single letters l / m / w (e.g. lm, wm, lwm).
          [[ "$s" =~ ^[lmw]+$ ]] || {
            echo "Unknown flag: $arg" >&2
            usage
            exit 1
          }
          [[ "$s" == *l* ]] && L=1
          [[ "$s" == *m* ]] && M=1
          [[ "$s" == *w* ]] && W=1
          ;;
      esac
      ;;
  esac
done

targets=()
[[ $M -eq 1 ]] && targets+=(--mac)
[[ $W -eq 1 ]] && targets+=(--win)
[[ $L -eq 1 ]] && targets+=(--linux)

echo "==> Platforms: ${targets[*]}"

if [[ "$(uname)" == "Darwin" && ($W -eq 1 || $L -eq 1) ]]; then
  echo "    Note: cross-building Windows/Linux from macOS may need extra tools (e.g. Docker/wine)."
fi

echo "==> Fetching bundled OCR assets (offline Tesseract)…"
bun run ocr:assets

echo "==> Building web bundle (vite)…"
bun run build

echo "==> Bundling Electron main + preload…"
bun run electron:build

echo "==> Packaging with electron-builder…"
# Produce an unsigned build unless signing is already configured in the env.
export CSC_IDENTITY_AUTO_DISCOVERY="${CSC_IDENTITY_AUTO_DISCOVERY:-false}"
bunx electron-builder "${targets[@]}"

echo ""
echo "==> Done. Artifacts in ./release :"
ls -1 release 2>/dev/null | sed 's/^/    /' || true
