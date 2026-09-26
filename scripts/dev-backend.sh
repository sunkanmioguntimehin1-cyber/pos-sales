#!/usr/bin/env bash
# Start the backend in the background for local testing.
# Logs to /tmp/pos-backend.log, PID to /tmp/pos-backend.pid
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
LOG=/tmp/pos-backend.log
PIDFILE=/tmp/pos-backend.pid

if [ -f "$PIDFILE" ] && kill -0 "$(cat "$PIDFILE")" 2>/dev/null; then
  echo "already running (pid $(cat "$PIDFILE"))"
  exit 0
fi

: > "$LOG"
cd "$ROOT/backend"
node src/server.js > "$LOG" 2>&1 &
echo $! > "$PIDFILE"

# Wait for the health endpoint to answer.
for _ in $(seq 1 40); do
  if curl -fsS -m 2 http://localhost:"${PORT:-5001}"/api/health >/dev/null 2>&1; then
    echo "backend up (pid $(cat "$PIDFILE"))"
    exit 0
  fi
  if ! kill -0 "$(cat "$PIDFILE")" 2>/dev/null; then
    echo "backend exited during startup:"
    cat "$LOG"
    rm -f "$PIDFILE"
    exit 1
  fi
  sleep 1
done

echo "backend did not become healthy in time:"
cat "$LOG"
exit 1
