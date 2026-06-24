#!/usr/bin/env bash
# deploy-docker.sh — run on EC2 (15.237.137.224) as the user who runs Docker
# Usage: bash /tmp/deploy-docker.sh
set -euo pipefail

SRC=/tmp/inno-pulse
DEST=/opt/inno-pulse

echo "=== 1. Syncing files to $DEST ==="
sudo mkdir -p $DEST
sudo rsync -a --delete \
    --exclude '.venv' \
    --exclude '__pycache__' \
    --exclude '*.pyc' \
    --exclude 'node_modules' \
    $SRC/ $DEST/

# Fix ownership to current user
sudo chown -R $(whoami):$(whoami) $DEST

echo "=== 2. Stopping old containers (if any) ==="
cd $DEST
docker compose -f docker-compose.prod.yml down 2>/dev/null || true

echo "=== 3. Building and starting ==="
docker compose -f docker-compose.prod.yml up -d --build

echo ""
echo "=== 4. Health checks ==="
sleep 5
docker compose -f docker-compose.prod.yml ps
echo ""
echo "API:"
curl -s http://localhost/api/health | python3 -m json.tool || true
echo ""
echo "  Dashboard: http://15.237.137.224"
