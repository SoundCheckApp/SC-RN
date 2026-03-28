#!/usr/bin/env bash
# Read-only disk overview: Data volume + common large developer folders.
set -euo pipefail

echo "=== Data volume ==="
df -h /System/Volumes/Data

echo ""
echo "=== Developer hotspots (if present) ==="
for p in \
  "$HOME/Library/Developer/Xcode/DerivedData" \
  "$HOME/Library/Developer/Xcode/Archives" \
  "$HOME/Library/Developer/CoreSimulator" \
  "$HOME/Library/Caches" \
  "$HOME/.npm" \
  "$HOME/Library/Caches/Homebrew" \
  "$HOME/Developer"; do
  if [[ -e "$p" ]]; then
    du -sh "$p" 2>/dev/null || true
  fi
done

echo ""
echo "=== Largest top-level entries in ~/Library/Caches ==="
if [[ -d "$HOME/Library/Caches" ]]; then
  du -sh "$HOME/Library/Caches"/* 2>/dev/null | sort -hr | head -20
fi

echo ""
echo "=== npm cache verify (after cleanup may be small) ==="
command -v npm >/dev/null 2>&1 && npm cache verify 2>/dev/null || echo "npm not in PATH"
