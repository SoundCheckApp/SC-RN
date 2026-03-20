#!/usr/bin/env bash
# Compare git status timing. Usage: bash scripts/git-status-benchmark.sh [label]
set -euo pipefail
cd "$(dirname "$0")/.."
LABEL="${1:-unknown}"
echo "=========================================="
echo "git status benchmark — $LABEL"
echo "time: $(date '+%Y-%m-%d %H:%M:%S')"
echo "cwd: $(pwd)"
echo "TERM=${TERM:-}  CI=${CI:-}"
echo "=========================================="
export GIT_BENCH_START
GIT_BENCH_START=$(python3 -c 'import time; print(time.perf_counter())')
git status
export GIT_BENCH_END
GIT_BENCH_END=$(python3 -c 'import time; print(time.perf_counter())')
python3 -c "import os; a=float(os.environ['GIT_BENCH_START']); b=float(os.environ['GIT_BENCH_END']); print(f'elapsed_sec: {b-a:.3f}')"
echo "=========================================="
