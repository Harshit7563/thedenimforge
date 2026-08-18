#!/bin/bash
# Find product photos from old folders and put them where the site can serve them.
set -e

DEST="/var/www/thedenimforge/uploads"
mkdir -p "$DEST/products" /root/thedenimforge/server/uploads/products

echo "==> Searching for uploaded product images..."
mapfile -t FOUND < <(find /root /var/www -type f \
  \( -iname '*.webp' -o -iname '*.jpg' -o -iname '*.jpeg' -o -iname '*.png' -o -iname '*.gif' \) \
  \( -path '*/uploads/products/*' -o -path '*/thedenimforge/*/uploads/*' \) \
  2>/dev/null | grep -v node_modules || true)

if [ ${#FOUND[@]} -eq 0 ]; then
  echo "No upload files found under /root or /var/www"
else
  echo "Found ${#FOUND[@]} files"
  for f in "${FOUND[@]}"; do
    cp -n "$f" "$DEST/products/" 2>/dev/null || true
    cp -n "$f" /root/thedenimforge/server/uploads/products/ 2>/dev/null || true
  done
fi

# Also copy whole known upload trees
for src in \
  /root/thedenimforge/server/uploads \
  /var/www/thedenimforge/server/uploads \
  /root/thedenimforge/uploads
do
  if [ -d "$src" ] && [ "$src" != "$DEST" ]; then
    echo "==> Syncing $src -> $DEST"
    rsync -a "$src/" "$DEST/"
  fi
done

COUNT=$(find "$DEST/products" -type f 2>/dev/null | wc -l | tr -d ' ')
echo "==> Files in $DEST/products: $COUNT"

if command -v pm2 >/dev/null 2>&1; then
  pm2 restart thedenimforge-api --update-env || true
fi

SAMPLE=$(find "$DEST/products" -type f | head -1)
if [ -n "$SAMPLE" ]; then
  NAME=$(basename "$SAMPLE")
  echo "==> Test: curl -I https://thedenimforge.com/uploads/products/$NAME"
fi
