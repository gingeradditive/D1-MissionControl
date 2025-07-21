#!/bin/bash

set -e

echo "=== 🛠️ INSTALLAZIONE SISTEMA KIOSK ==="

PROJECT_DIR=$(pwd)
USERNAME=$(whoami)

echo "📦 Aggiorno sistema e installo pacchetti base..."
sudo apt update && sudo apt upgrade -y
sudo apt install --no-install-recommends -y \
    xserver-xorg \
    x11-xserver-utils \
    xinit \
    openbox \
    chromium-browser \
    python3-venv \
    python3-pip \
    npm \
    git

echo "🐍 Creo ambiente virtuale Python..."
python3 -m venv venv
source venv/bin/activate

echo "📦 Installo dipendenze Python da requirements.txt..."
pip install --upgrade pip
pip install -r requirements.txt

echo "📦 Installo dipendenze npm per il frontend..."
cd "$PROJECT_DIR/frontend"
npm install
npm run build

echo "📦 Installo globalmente il server statico serve..."
sudo npm install -g serve
cd "$PROJECT_DIR"

echo "🧹 Disabilito screen blanking..."
cat <<EOF > ~/.xsessionrc
xset s off
xset -dpms
xset s noblank
EOF

echo "🧠 Creo ~/.xinitrc per Chromium in modalità kiosk..."
cat <<EOF > ~/.xinitrc
#!/bin/sh
source ~/.xsessionrc
chromium-browser --noerrdialogs --disable-infobars --kiosk http://localhost:3000
EOF
chmod +x ~/.xinitrc

echo "⚙️ Imposto Openbox come window manager..."
echo "exec openbox-session" >> ~/.xinitrc

echo "🚀 Creo servizio systemd per avvio automatico di X (startx)..."

STARTX_SERVICE_PATH="/etc/systemd/system/startx.service"

sudo tee $STARTX_SERVICE_PATH > /dev/null <<EOF
[Unit]
Description=Avvio automatico GUI con startx
After=network.target

[Service]
User=$USERNAME
WorkingDirectory=/home/$USERNAME
Environment=DISPLAY=:0
ExecStart=/usr/bin/startx
Restart=on-failure

[Install]
WantedBy=graphical.target
EOF

sudo systemctl daemon-reload
sudo systemctl enable startx.service

echo "✅ Avvio grafico configurato con systemd (startx.service)"

echo "=== ⚙️ CONFIGURO SERVIZI SYSTEMD ==="

# Backend FastAPI service
cat <<EOF | sudo tee /etc/systemd/system/dryer-backend.service
[Unit]
Description=Dryer Backend (FastAPI)
After=network.target

[Service]
User=$USERNAME
WorkingDirectory=$PROJECT_DIR
ExecStart=$PROJECT_DIR/venv/bin/python3 -m uvicorn backend.api.main:app --host 0.0.0.0 --port 8000
Restart=always

[Install]
WantedBy=multi-user.target
EOF

# Frontend serve service
cat <<EOF | sudo tee /etc/systemd/system/dryer-frontend.service
[Unit]
Description=Dryer Frontend (React static build with serve)
After=network.target

[Service]
User=$USERNAME
WorkingDirectory=$PROJECT_DIR/frontend
ExecStart=/usr/local/bin/serve -s dist -l 3000
Restart=always

[Install]
WantedBy=multi-user.target
EOF

echo "🔁 Abilito i servizi all'avvio..."
sudo systemctl daemon-reexec
sudo systemctl daemon-reload
sudo systemctl enable dryer-backend.service
sudo systemctl enable dryer-frontend.service

echo "📂 Creo cartella per i log dell'applicazione..."
mkdir -p "$PROJECT_DIR/logs"

echo "✅ Tutto pronto!"

echo "🔄 Riavvio il sistema per applicare le modifiche..."
sudo reboot
