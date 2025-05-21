#!/bin/bash

set -e

echo "🔧 Installing system packages..."
sudo apt-get update
sudo apt-get install -y python3 python3-pip

# Install dependencies via pip (apt non ha pacchetti FastAPI o uvicorn)
echo "🐍 Installing FastAPI and Uvicorn with pip..."
sudo pip3 install fastapi uvicorn simple_pid

APP_DIR=$(pwd)
PYTHON_PATH=$(which python3)

echo "📁 Creating systemd service files..."

# DryerLogic.service
cat <<EOF | sudo tee /etc/systemd/system/DryerLogic.service > /dev/null
[Unit]
Description=Dryer Logic Service
After=network.target

[Service]
ExecStart=${PYTHON_PATH} ${APP_DIR}/dryer_logic.py
WorkingDirectory=${APP_DIR}
Restart=always
User=$(whoami)
StandardOutput=journal
StandardError=journal
Environment=PYTHONUNBUFFERED=1

[Install]
WantedBy=multi-user.target
EOF

# DryerWeb.service (FastAPI with uvicorn)
cat <<EOF | sudo tee /etc/systemd/system/DryerWeb.service > /dev/null
[Unit]
Description=Dryer Web (FastAPI) Service
After=network.target

[Service]
ExecStart=${PYTHON_PATH} -m uvicorn dryer_web:app --host 0.0.0.0 --port 8000
WorkingDirectory=${APP_DIR}
Restart=always
User=$(whoami)
StandardOutput=journal
StandardError=journal
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
