# GingerDryer



```
📦 dryer-controller/
│
├── backend/                 <-- Logica Python + API REST
│   ├── dryer_control.py     # Logica gestione temperature, timer, ventole, ecc.
│   ├── config.py            # Configurazione salvata/caricata
│   └── api/                 # FastAPI o Flask
│       └── main.py          # REST API (es: GET status, POST config)
│
├── frontend/                <-- Interfaccia Web (utente via browser)
│   ├── public/
│   ├── src/
│   │   ├── App.jsx          # UI Vue/React/Svelte
│   │   └── components/
│   └── vite.config.js       # Build + dev
│
├── touch-ui/               <-- Interfaccia Touch embedded (Python)
│   ├── main.py              # UI in PyQt / Kivy
│   └── screens/             # Schermate (status, config, rete, log)
│
├── systemd/                <-- Servizi systemd per l'avvio automatico
│   ├── dryer-backend.service
│   ├── dryer-touch.service
│   └── dryer-wifi-setup.service
│
├── updater/                <-- Gestione aggiornamenti
│   └── update.sh            # Script per pull Git + restart servizi
│
├── docs/
│
└── README.md
```