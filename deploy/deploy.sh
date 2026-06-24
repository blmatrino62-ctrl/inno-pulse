#!/usr/bin/env bash
# deploy.sh — run on EC2 (15.237.137.224) as ubuntu user
# Usage: bash /tmp/deploy.sh
set -euo pipefail

APP_DIR=/opt/inno-pulse
BACKEND_DIR=$APP_DIR/backend
FRONTEND_DIR=$APP_DIR/frontend
NGINX_CONF=/etc/nginx/sites-available/inno-pulse
SYSTEMD_UNIT=/etc/systemd/system/inno-pulse-api.service
WEBROOT=/var/www/inno-pulse

echo "=== 1. Installing system packages ==="
sudo apt-get update -q
sudo apt-get install -y python3 python3-venv python3-pip nginx

echo "=== 2. Creating directories ==="
sudo mkdir -p $BACKEND_DIR
sudo mkdir -p $WEBROOT
sudo chown -R ubuntu:ubuntu $APP_DIR

echo "=== 3. Syncing backend code ==="
# Files were already uploaded to /tmp/inno-pulse by scp
rsync -a --delete /tmp/inno-pulse/backend/ $BACKEND_DIR/

echo "=== 4. Python virtual env + deps ==="
cd $BACKEND_DIR
python3 -m venv .venv
.venv/bin/pip install --quiet --upgrade pip
.venv/bin/pip install --quiet -r requirements.txt

echo "=== 5. Writing .env ==="
cp /tmp/inno-pulse/backend/.env.production $BACKEND_DIR/.env

echo "=== 6. Nginx ==="
sudo cp /tmp/inno-pulse/nginx/inno-pulse.conf $NGINX_CONF
sudo ln -sf $NGINX_CONF /etc/nginx/sites-enabled/inno-pulse
# Remove the default nginx site if present
sudo rm -f /etc/nginx/sites-enabled/default
sudo nginx -t
sudo systemctl reload nginx

echo "=== 7. Deploy frontend (static files) ==="
sudo rsync -a --delete /tmp/inno-pulse/frontend/dist/ $WEBROOT/
sudo chown -R www-data:www-data $WEBROOT

echo "=== 8. Systemd service ==="
sudo cp /tmp/inno-pulse/deploy/inno-pulse-api.service $SYSTEMD_UNIT
sudo systemctl daemon-reload
sudo systemctl enable inno-pulse-api
sudo systemctl restart inno-pulse-api

echo ""
echo "=== Done! Checking service status ==="
sudo systemctl status inno-pulse-api --no-pager -l
echo ""
echo "API health check:"
curl -s http://localhost:8000/api/health | python3 -m json.tool || true
echo ""
echo "  Dashboard: http://15.237.137.224"
