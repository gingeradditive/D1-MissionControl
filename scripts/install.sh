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

echo "📦 Aggiorno Node..."
sudo apt-get remove nodejs
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs

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

echo "🛜 Aggiungo permessi per gestire le reti"
sudo usermod -aG netdev $USER

POLKIT_FILE="/etc/polkit-1/localauthority/50-local.d/10-nmcli.pkla"

sudo bash -c "cat > $POLKIT_FILE" <<EOF
[Allow NetworkManager all permissions for pi user]
Identity=unix-user:pi
Action=org.freedesktop.NetworkManager.*
ResultAny=yes
ResultInactive=yes
ResultActive=yes
EOF

echo "File $POLKIT_FILE creato con successo."

echo "🔌 ABILITO INTERFACCE HARDWARE (SPI, I2C)"

# Abilita SPI
sudo sed -i 's/^#dtparam=spi=on/dtparam=spi=on/' /boot/config.txt
if ! grep -q '^dtparam=spi=on' /boot/config.txt; then
    echo 'dtparam=spi=on' | sudo tee -a /boot/config.txt
fi

# Abilita I2C
sudo sed -i 's/^#dtparam=i2c_arm=on/dtparam=i2c_arm=on/' /boot/config.txt
if ! grep -q '^dtparam=i2c_arm=on' /boot/config.txt; then
    echo 'dtparam=i2c_arm=on' | sudo tee -a /boot/config.txt
fi

echo "spi-dev" | sudo tee -a /etc/modules
echo "i2c-dev" | sudo tee -a /etc/modules


USER="pi"
echo "🔧 Configurazione permessi sudo per l'utente '$USER'..."
SYSTEMCTL_PATH=$(which systemctl)
if [[ -z "$SYSTEMCTL_PATH" ]]; then
    echo "❌ systemctl non trovato!"
    exit 1
fi
SUDOERS_FILE="/etc/sudoers.d/restart_dryer_services"
cat <<EOF > "$SUDOERS_FILE"
$USER ALL=NOPASSWD: $SYSTEMCTL_PATH restart dryer-frontend.service, $SYSTEMCTL_PATH restart getty@tty1.service, $SYSTEMCTL_PATH restart dryer-backend.service
EOF
chmod 440 "$SUDOERS_FILE"
