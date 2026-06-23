#!/bin/bash
# Mac par chalao — poora project ZIP banata hai VPS upload ke liye
set -e
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
OUT="$ROOT/thedenimforge-full.zip"

cd "$ROOT/.."
zip -r "$OUT" thedenimforge \
  -x "thedenimforge/node_modules/*" \
  -x "thedenimforge/client/node_modules/*" \
  -x "thedenimforge/server/node_modules/*" \
  -x "thedenimforge/client/dist/*" \
  -x "thedenimforge/server/.env" \
  -x "thedenimforge/client/.env" \
  -x "thedenimforge/.git/*"

echo ""
echo "ZIP ready: $OUT"
echo ""
echo "VPS par upload:"
echo "  scp $OUT user@YOUR_VPS_IP:/var/www/"
echo "  ssh user@YOUR_VPS_IP"
echo "  cd /var/www && unzip -o thedenimforge-full.zip"
echo "  cd thedenimforge && ls server client deploy   # teeno dikhne chahiye"
echo "  cp server/.env.example server/.env && nano server/.env"
echo "  bash deploy/deploy.sh"
