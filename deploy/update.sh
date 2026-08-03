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

echo "==> Restarting API..."
if command -v pm2 &>/dev/null; then
  pm2 restart thedenimforge-api || pm2 start deploy/ecosystem.config.cjs
  pm2 save
else
  echo "    PM2 not found — start API manually"
fi

echo ""
echo "==> Update complete!"
echo "    Site: https://thedenimforge.com"
echo "    Admin: https://thedenimforge.com/admin"
