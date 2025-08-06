#!/bin/bash

# Uscita immediata in caso di errore
set -e

echo "🔧 Spostamento nella cartella superiore..."
cd ..

echo "🛑 Arresto del servizio dryer-backend..."
sudo systemctl stop dryer-backend.service

echo "🐍 Attivazione ambiente virtuale..."
source venv/bin/activate

echo "🚀 Avvio del server FastAPI in modalità debug..."
python -m uvicorn backend.api.main:app --host 0.0.0.0 --port 8000