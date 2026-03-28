#!/usr/bin/env bash
# Safe developer-focused cleanup (caches, unavailable simulators, Homebrew).
# Re-run from repo root: bash scripts/disk-cleanup.sh
set -euo pipefail

echo "Before:"
df -h /System/Volumes/Data | tail -1

echo ""
echo "→ npm cache clean --force"
if command -v npm >/dev/null 2>&1; then
  npm cache clean --force
fi

echo "→ xcrun simctl delete unavailable"
xcrun simctl delete unavailable 2>/dev/null || true

echo "→ brew cleanup -s"
if command -v brew >/dev/null 2>&1; then
  brew cleanup -s 2>/dev/null || true
fi

echo "→ pip cache purge"
if command -v pip3 >/dev/null 2>&1; then
  pip3 cache purge 2>/dev/null || true
fi

echo "→ Remove selected app ShipIt / toolchain caches"
rm -rf "$HOME/Library/Caches/com.todesktop."*.ShipIt 2>/dev/null || true
rm -rf "$HOME/Library/Caches/com.mongodb.compass.ShipIt" 2>/dev/null || true
rm -rf "$HOME/Library/Caches/com.postmanlabs.agent.mac.ShipIt" 2>/dev/null || true
rm -rf "$HOME/Library/Caches/typescript" 2>/dev/null || true
rm -rf "$HOME/Library/Caches/node-gyp" 2>/dev/null || true
rm -rf "$HOME/Library/Caches/JetBrains" 2>/dev/null || true

echo "→ Chrome disk cache (browser will rebuild)"
rm -rf "$HOME/Library/Caches/Google/Chrome" 2>/dev/null || true

echo "→ Apple e5rt bundle cache (can regrow)"
rm -rf "$HOME/Library/Caches/com.apple.e5rt.e5bundlecache" 2>/dev/null || true

echo ""
echo "After:"
df -h /System/Volumes/Data | tail -1
echo "Done. Run: bash scripts/disk-check.sh for a full breakdown."
