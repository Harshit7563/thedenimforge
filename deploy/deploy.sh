#!/bin/bash
# The Denim Forge — VPS deploy script
# Usage: bash deploy/deploy.sh

set -e

APP_DIR="$(cd "$(dirname "$0")/.." && pwd)"
cd "$APP_DIR"

echo "==> The Denim Forge deploy"
echo "    Directory: $APP_DIR"

# Check server .env
if [ ! -f server/.env ]; then
  echo "ERROR: server/.env missing!"
  echo "Run: cp server/.env.example server/.env"
  echo "Then edit DATABASE_URL, JWT_SECRET, CLIENT_URL, SITE_URL"
  exit 1
fi

echo "==> Installing dependencies..."
npm run install:all

echo "==> Setting up database..."
npm run db:setup --prefix server 2>/dev/null || true
npm run db:migrate --prefix server
npm run db:seed --prefix server
npm run db:fix-images --prefix server

echo "==> Building frontend..."
npm run build

echo "==> Starting API with PM2..."
if command -v pm2 &>/dev/null; then
  pm2 delete thedenimforge-api 2>/dev/null || true
  pm2 start deploy/ecosystem.config.cjs
  pm2 save
  echo "    API running via PM2"
else
  echo "    PM2 not found. Install: npm i -g pm2"
  echo "    Or run manually: cd server && node src/index.js"
fi

echo ""
echo "==> Deploy complete!"
echo "    Next: configure Nginx (see deploy/nginx.conf)"
echo "    Site: https://thedenimforge.com"
echo "    Admin: https://thedenimforge.com/admin"
