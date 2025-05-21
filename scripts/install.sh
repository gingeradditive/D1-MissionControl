#!/bin/bash

set -e

echo "🔧 Installing system packages..."
sudo apt-get update
sudo apt-get install -y python3 python3-venv python3-pip

echo "🐍 Creating Python virtual environment..."
cd "$(dirname "$0")"
python3 -m venv venv

echo "📦 Activating environment and installing Python packages..."
./venv/bin/pip install --upgrade pip
./venv/bin/pip install fastapi uvicorn simple_pid

APP_DIR=$(pwd)/..
PYTHON=${APP_DIR}/venv/bin/python
UVICORN=${APP_DIR}/venv/bin/uvicorn

echo "📁 Creating systemd service files..."

# DryerLogic.service
cat <<EOF | sudo tee /etc/systemd/system/DryerLogic.service > /dev/null
[Unit]
Description=Dryer Logic Service
After=network.target

[Service]
ExecStart=${PYTHON} ${APP_DIR}/dryer_logic.py
WorkingDirectory=${APP_DIR}
Restart=always
User=$(whoami)
Environment=PYTHONUNBUFFERED=1

[Install]
WantedBy=multi-user.target
EOF

# DryerWeb.service
cat <<EOF | sudo tee /etc/systemd/system/DryerWeb.service > /dev/null
[Unit]
Description=Dryer Web FastAPI Service
After=network.target

[Service]
ExecStart=${UVICORN} dryer_web:app --host 0.0.0.0 --port 8000
WorkingDirectory=${APP_DIR}
Restart=always
User=$(whoami)
Environment=PYTHONUNBUFFERED=1

[Install]
WantedBy=multi-user.target
EOF

echo "🔄 Reloading and enabling services..."
sudo systemctl daemon-reexec
sudo systemctl daemon-reload
sudo systemctl enable DryerLogic.service
sudo systemctl enable DryerWeb.service

echo "✅ Setup complete! Start services with:"
echo "   sudo systemctl start DryerLogic"
echo "   sudo systemctl start DryerWeb"
