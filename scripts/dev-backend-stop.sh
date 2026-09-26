#!/usr/bin/env bash
# Stop the background backend started by dev-backend.sh
set -euo pipefail

PIDFILE=/tmp/pos-backend.pid

if [ ! -f "$PIDFILE" ]; then
  echo "not running (no pidfile)"
  exit 0
fi

PID="$(cat "$PIDFILE")"
if kill -0 "$PID" 2>/dev/null; then
  kill "$PID"
  for _ in $(seq 1 20); do
    kill -0 "$PID" 2>/dev/null || break
    sleep 0.5
  done
  kill -9 "$PID" 2>/dev/null || true
  echo "stopped $PID"
else
  echo "not running (stale pidfile)"
fi

rm -f "$PIDFILE"
