#!/bin/bash
# Quick production health check for The Denim Forge
set -e

APP_DIR="${APP_DIR:-/root/thedenimforge}"
NGINX_ROOT="${NGINX_ROOT:-/var/www/thedenimforge}"

echo "==> The Denim Forge diagnose"
echo "    App dir:   $APP_DIR"
echo "    Nginx dir: $NGINX_ROOT"
echo ""

echo "==> PM2 status"
pm2 list 2>/dev/null | grep -E 'thedenimforge|name|online|stopped|errored' || echo "PM2 not running"
echo ""

echo "==> API health (local)"
curl -sS --max-time 5 http://127.0.0.1:4000/api/health || echo "API not reachable on port 4000"
echo ""
echo ""

echo "==> Nginx config test"
sudo nginx -t 2>&1 || true
echo ""

echo "==> PostgreSQL"
if command -v pg_isready >/dev/null 2>&1; then
  pg_isready -h 127.0.0.1 -p 5433 2>/dev/null || pg_isready -h 127.0.0.1 -p 5432 2>/dev/null || echo "PostgreSQL not ready"
else
  echo "pg_isready not installed"
fi
echo ""

echo "==> Recent API errors (last 20 lines)"
if [ -f "$APP_DIR/logs/api-error.log" ]; then
  tail -20 "$APP_DIR/logs/api-error.log"
else
  pm2 logs thedenimforge-api --lines 20 --nostream 2>/dev/null || echo "No logs found"
fi
echo ""

echo "==> Dist bundle"
grep -o 'assets/index-[^"]*\.js' "$NGINX_ROOT/client/dist/index.html" 2>/dev/null || echo "index.html missing in nginx root"
