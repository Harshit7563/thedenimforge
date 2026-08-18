#!/bin/bash
# Keep API online after reboot/deploy — run on VPS
set -e

APP_DIR="${APP_DIR:-/root/thedenimforge}"
NGINX_ROOT="${NGINX_ROOT:-/var/www/thedenimforge}"

cd "$APP_DIR"
mkdir -p "$APP_DIR/logs"

echo "==> Ensuring The Denim Forge API is running"
if pm2 describe thedenimforge-api >/dev/null 2>&1; then
  pm2 restart thedenimforge-api --update-env
else
  pm2 start "$APP_DIR/deploy/ecosystem.config.cjs"
fi
pm2 save

if [ -d "$NGINX_ROOT/client" ] && [ "$APP_DIR" != "$NGINX_ROOT" ]; then
  echo "==> Syncing frontend to Nginx root"
  mkdir -p "$NGINX_ROOT/client"
  rsync -a --delete "$APP_DIR/client/dist/" "$NGINX_ROOT/client/dist/"
fi

echo "==> Health check"
sleep 2
curl -sS --max-time 8 http://127.0.0.1:4000/api/health || {
  echo "ERROR: API still not healthy — run: bash deploy/diagnose.sh"
  exit 1
}

echo ""
echo "==> OK — site should be up"
echo "    https://thedenimforge.com"
