#!/bin/bash

cd ..
sudo systemctl stop dryer-backend.service
python3 -m venv venv
python3 -m uvicorn backend.api.main:app --host 0.0.0.0 --port 8000