#!/bin/sh
set -e

APP_PORT="${PORT:-5173}"

if [ "${APP_ENV:-development}" = "production" ]; then
  npm run build
  npm run preview -- --host 0.0.0.0 --port "$APP_PORT"
else
  npm run dev -- --host 0.0.0.0 --port "$APP_PORT"
fi
