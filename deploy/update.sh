#!/bin/bash
# Safe production update — no reseed (keeps live products/orders)
# Usage on VPS: bash deploy/update.sh

set -e

APP_DIR="$(cd "$(dirname "$0")/.." && pwd)"
cd "$APP_DIR"

echo "==> The Denim Forge update"
echo "    Directory: $APP_DIR"

if [ ! -f server/.env ]; then
  echo "ERROR: server/.env missing!"
  exit 1
fi

echo "==> Pulling latest from GitHub..."
git fetch origin
git checkout main
git pull origin main

echo "==> Installing dependencies..."
npm run install:all

echo "==> Running migrations only (no seed)..."
npm run db:migrate --prefix server

echo "==> Building frontend..."
npm run build

mkdir -p "$APP_DIR/logs"

# Nginx serves /var/www/thedenimforge — sync dist if deploy dir differs
NGINX_ROOT="/var/www/thedenimforge"
mkdir -p "$NGINX_ROOT/uploads/products" "$APP_DIR/server/uploads/products"
if [ -d "$NGINX_ROOT/client" ] && [ "$APP_DIR" != "$NGINX_ROOT" ]; then
  echo "==> Syncing build to Nginx root ($NGINX_ROOT)..."
  mkdir -p "$NGINX_ROOT/client"
  rsync -a --delete "$APP_DIR/client/dist/" "$NGINX_ROOT/client/dist/"
fi
# Keep product photos in the nginx-served uploads folder
if [ -d "$APP_DIR/server/uploads" ]; then
  rsync -a "$APP_DIR/server/uploads/" "$NGINX_ROOT/uploads/"
fi
if [ -d "$NGINX_ROOT/server/uploads" ]; then
  rsync -a "$NGINX_ROOT/server/uploads/" "$NGINX_ROOT/uploads/"
fi

echo "==> Restarting API..."
if command -v pm2 &>/dev/null; then
  pm2 delete thedenimforge-api 2>/dev/null || true
  pm2 start "$APP_DIR/deploy/ecosystem.config.cjs" --update-env
  pm2 save
  sleep 2
  curl -sS --max-time 8 http://127.0.0.1:4000/api/health >/dev/null || {
    echo "WARNING: API health check failed — run: bash deploy/diagnose.sh"
  }
else
  echo "    PM2 not found — start API manually"
fi

echo ""
echo "==> Update complete!"
echo "    Site: https://thedenimforge.com"
echo "    Admin: https://thedenimforge.com/admin"
echo "    If site drops again: bash deploy/ensure-running.sh"
