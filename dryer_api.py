# RUN WITH: python -m uvicorn dryer_api:app --reload
from fastapi import FastAPI, Query, Request
from pydantic import BaseModel
import socket
from fastapi.staticfiles import StaticFiles
from fastapi.templating import Jinja2Templates
from fastapi.responses import HTMLResponse

app = FastAPI(title="Dryer API", version="1.0")

UDP_IP = "127.0.0.1"
UDP_PORT = 9999
BUFFER_SIZE = 1024  # dimensione buffer di risposta UDP

def send_udp_message(message: str, expect_response: bool = False):
    try:
        sock = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
        sock.settimeout(2.0)
        sock.sendto(message.encode(), (UDP_IP, UDP_PORT))
        if expect_response:
            response, _ = sock.recvfrom(BUFFER_SIZE)
            return response.decode()
        return "ok"
    except Exception as e:
        return f"error: {str(e)}"
    finally:
        sock.close()

class SetTemperatureRequest(BaseModel):
    value: float = Query(..., gt=0, lt=200, description="Temperatura desiderata in °C")

class PowerRequest(BaseModel):
    on: bool  # true = accendi, false = spegni

app.mount("/static", StaticFiles(directory="static"), name="static")
templates = Jinja2Templates(directory="templates")

# Tua interfaccia web personalizzata
@app.get("/", response_class=HTMLResponse)
def read_root(request: Request):
    return templates.TemplateResponse("index.html", {"request": request})

@app.post("/setTemperature")
def set_temperature(data: SetTemperatureRequest):
    response = send_udp_message(str(data.value))
    if response == "ok":
        return {"status": "ok", "setTemperature": data.value}
    return {"status": "error", "message": response}

@app.get("/getTemperature")
def get_temperature():
    response = send_udp_message("GET_TEMPERATURE", expect_response=True)
    if response.startswith("error:"):
        return {"status": "error", "message": response}
    return {"status": "ok", "temperature": response}

@app.post("/power")
def power_dryer(data: PowerRequest):
    command = "POWER_ON" if data.on else "POWER_OFF"
    response = send_udp_message(command)
    if response == "ok":
        return {"status": "ok", "power": "on" if data.on else "off"}
    return {"status": "error", "message": response}

@app.get("/status")
def get_status():
    response = send_udp_message("GET_STATUS", expect_response=True)
    if response.startswith("error:"):
        return {"status": "error", "message": response}
    return {"status": "ok", "dryer_status": response}