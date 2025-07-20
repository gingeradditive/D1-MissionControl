sudo apt install python3-pip
pip3 install adafruit-circuitpython-sht4x RPi.GPIO fastapi uvicorn rich

# RUN 
uvicorn backend.api.main:app --host 0.0.0.0 --port 8000
