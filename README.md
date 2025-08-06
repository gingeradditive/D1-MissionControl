# GingerDryer
GingerDryer è un progetto open source per la gestione di asciugatrici intelligenti, con un'architettura modulare che include un backend Python, un'interfaccia web e un'interfaccia touch embedded. Il sistema è progettato per essere facilmente estendibile e personalizzabile.

## Struttura del Progetto
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

## Pinout GPIO
https://learn.microsoft.com/it-it/dotnet/iot/media/gpio-pinout-diagram.png

|                     |                      |                        |                     |
|--------------------:|---------------------:|------------------------|---------------------|
| MAX6675 (3V3)       | **+3V3**             | **+5V**                | VALVE (+5V)         |
| SHT4X (SDA)         | **GPIO 2 (SDA)**     | **+5V**                | SHT4X (+3V3/+5V)    |
| SHT4X (SCL)         | **GPIO 3 (SCL)**     | **GND**                | SHT4X (GND)         |
|                     | **GPIO 4 (GPCLK0)**  | **GPIO 14 (TXD**)      |                     |
| MAX6675 (GND)       | **GND**              | **GPIO 15 (RXD**)      |                     |
| VALVE (SIGNAL)      | **GPIO 17**          | **GPIO 18 (PCM_CLK**)  |                     |
|                     | **GPIO 27**          | **GND**                | SSR_HEATER (GND)    |
|                     | **GPIO 22**          | **GPIO 23**            | SSR_HEATER (SIGNAL) |
|                     | **+3V3**             | **GPIO 24**            | SSR_FAN (SIGNAL)    |
|                     | **GPIO 10 (MOSI)**   | **GND**                | SSR_FAN (GND)       |
| MAX6675 (SO)        | **GPIO 9 (MISO)**    | **GPIO 25**            |                     |
| MAX6675 (SCK)       | **GPIO 11 (SCLK)**   | **GPIO 8 (CE0**)       | MAX6675 (CS)        |
|                     | **GND**              | **GPIO 7 (CE1**)       |                     |
|                     | **GPIO 0 (ID_SD)**   | **GPIO 1 (ID_SC**)     |                     |
|                     | **GPIO 5**           | **GND**                | VALVE (GND)         |
|                     | **GPIO 6**           | **GPIO 12 (PWM0**)     |                     |
|                     | **GPIO 13 (PWM1)**   | **GND**                |                     |
|                     | **GPIO 19 (PCM_FS)** | **GPIO 16**            |                     |
|                     | **GPIO 26**          | **GPIO 20 (PCM_DIN**)  |                     |
|                     | **GND**              | **GPIO 21 (PCM_DOUT**) |                     |
