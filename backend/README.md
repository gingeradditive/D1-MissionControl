backend/
│
├── api/
│   ├── __init__.py
│   ├── main.py
│   └── routes/
│       ├── __init__.py
│       ├── dryer.py
│       ├── network.py
│       ├── update.py
│       └── config.py
│
├── core/
│   ├── __init__.py
│   ├── background.py     # loop di aggiornamento sensori
│   ├── state.py          # oggetto condiviso (controller instances)
│
├── dryer_control.py
├── network_control.py
├── update_control.py
└── config_control.py
