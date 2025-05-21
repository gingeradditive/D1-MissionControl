# RUN WITH: python -m uvicorn dryer_web:app --reload
from fastapi import FastAPI, Query, Request
from pydantic import BaseModel
import socket
from fastapi.staticfiles import StaticFiles
from fastapi.templating import Jinja2Templates
from fastapi.responses import HTMLResponse, JSONResponse
import requests
import json
import subprocess
import os
import platform

app = FastAPI(title="Dryer API", version="1.0")

UDP_IP = "127.0.0.1"
UDP_PORT = 9999
BUFFER_SIZE = 1024  # dimensione buffer di risposta UDP
IS_LINUX = platform.system() == "Linux"

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

@app.get("/api/g1-check")
def check_g1():
    try:
        response = requests.get("http://g1os.local/", timeout=2)
        if response.status_code == 200:
            return JSONResponse(content={"reachable": True})
    except requests.RequestException:
        pass
    return JSONResponse(content={"reachable": False})

@app.post("/api/setTemperature")
def set_temperature(data: SetTemperatureRequest):
    response = send_udp_message(str(data.value))
    if response == "ok":
        return {"status": "ok", "setTemperature": data.value}
    return {"status": "error", "message": response}

@app.post("/api/power")
def power_dryer(data: PowerRequest):
    command = "POWER_ON" if data.on else "POWER_OFF"
    response = send_udp_message(command)
    if response == "ok":
        return {"status": "ok", "power": "on" if data.on else "off"}
    return {"status": "error", "message": response}

@app.get("/api/status")
def get_status():
    response = send_udp_message("GET_STATUS", expect_response=True)
    if response.startswith("error:"):
        return {"status": "error", "message": response}
    return json.loads(response)

@app.get("/api/updates/check", response_class=JSONResponse)
def check_updates():
    try:
        # Check Git updates
        git_fetch = subprocess.run(["git", "fetch"], capture_output=True, text=True)
        git_status = subprocess.run(["git", "status", "-uno"], capture_output=True, text=True)
        git_tag = subprocess.run(["git", "describe", "--tags", "--always"], capture_output=True, text=True).stdout.strip()
        git_updates = "Your branch is behind" in git_status.stdout

        # Check system updates (Debian/Ubuntu based) only on linux 
        if IS_LINUX:
            apt_check = subprocess.run(["apt", "list", "--upgradable"], capture_output=True, text=True)
            system_updates = [line for line in apt_check.stdout.split("\n")[1:] if line.strip()]
        else:
            system_updates = []
        
        return {
            "git_updates_available": git_updates,
            "git_updates_tag": git_tag,
            "system_updates_available": len(system_updates) > 0,
            "system_updates_list": system_updates
        }
    except Exception as e:
        return JSONResponse(status_code=500, content={"error": str(e)})


@app.post("/api/updates/git", response_class=JSONResponse)
def update_git():
    try:
        result = subprocess.run(["git", "pull"], capture_output=True, text=True)

        if IS_LINUX:
            #restart the services DryerLogic, DryerWeb
            subprocess.run(["systemctl", "restart", "DryerLogic"])
            subprocess.run(["systemctl", "restart", "DryerWeb"])
        
        return {
            "success": result.returncode == 0,
            "stdout": result.stdout,
            "stderr": result.stderr
        }
    except Exception as e:
        return JSONResponse(status_code=500, content={"error": str(e)})


@app.post("/api/updates/system", response_class=JSONResponse)
def update_system():
    try:
        # Update and upgrade system (Debian/Ubuntu only!)
        update = subprocess.run(["apt", "update"], capture_output=True, text=True)
        upgrade = subprocess.run(["apt", "upgrade", "-y"], capture_output=True, text=True)
        return {
            "update_stdout": update.stdout,
            "upgrade_stdout": upgrade.stdout,
            "upgrade_stderr": upgrade.stderr,
            "success": upgrade.returncode == 0
        }
    except Exception as e:
        return JSONResponse(status_code=500, content={"error": str(e)})