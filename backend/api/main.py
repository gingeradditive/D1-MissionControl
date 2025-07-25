from fastapi import FastAPI, Query
from fastapi.middleware.cors import CORSMiddleware
from backend.dryer_control import DryerController
from backend.network_control import NetworkController
from threading import Thread
from datetime import datetime
import time

app = FastAPI()
dryer = DryerController()  # default value
network = NetworkController()

origins = ["*"]
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)
running = True


def background_loop():
    global running
    while running:
        now, temp, hum = dryer.read_sensor()
        dryer.update_heater_pid_discrete(temp)
        if time.time() - dryer.log_timer >= 10:
            dryer.log_timer = time.time()
            dryer.log(now.strftime('%Y-%m-%d %H:%M:%S'), temp, hum)
        time.sleep(1)


thread = Thread(target=background_loop)
thread.start()


@app.get("/status")
def get_status():
    latest = dryer.get_status_data()
    network_status = network.get_connection_status()
    ts, temp, hum, heater, fan, status = latest

    return {
        "setpoint": dryer.set_temp,
        "current_temp": round(temp, 2),
        "current_humidity": round(hum, 2),
        "heater": heater,
        "fan": fan,
        "status": status,
        "network": network_status
    }


@app.post("/status/{status}")
def set_status(status: bool):
    if status:
        dryer.start()
        return {"status": "Heater turned on"}
    else:
        dryer.stop()
        return {"status": "Heater turned off"}

    


@app.get("/history")
def get_status(mode: str = Query(default="1h", enum=["1m", "1h", "12h"])):
    try:
        history = dryer.get_history_data(mode)
    except ValueError:
        return {"error": "Invalid mode. Use one of: 1m, 1h, 12h"}

    return {
        "mode": mode,
        "history": [
            {
                "timestamp": ts.strftime("%Y-%m-%d %H:%M:%S"),
                "temperature": round(t, 2),
                "humidity": round(h, 2),
                "heater_ratio": round(r, 2),
                "fan_ratio": round(f, 2),
                "temp_min": round(t_min, 2),
                "temp_max": round(t_max, 2),
                "hum_min": round(h_min, 2),
                "hum_max": round(h_max, 2),
            } for ts, t, h, r, f, t_min, t_max, h_min, h_max in history
        ]
    }


@app.post("/setpoint/{value}")
def set_setpoint(value: float):
    dryer.update_setpoint(value)
    return {"setpoint": dryer.set_temp}


@app.get("/networks")
def get_networks():
    return network.get_networks()


@app.post("/connect/{ssid}/{password}")
def connect_to_network(ssid: str, password: str):
    if not ssid or not password:
        return {"error": "SSID and password must be provided"}

    result = network.connect_to_network(ssid, password)
    if result:
        return {"status": "Connected successfully"}
    else:
        return {"error": "Failed to connect to the network"}


@app.get("/ip")
def get_ip():
    ip = network.get_ip()
    if ip:
        return {"ip": ip}
    else:
        return {"error": "IP address not available"}


@app.get("/g1os")
def check_g1os():
    return {"status": network.network_has_g1os()}
    
    
@app.on_event("shutdown")
def on_shutdown():
    global running
    running = False
    thread.join()
    dryer.shutdown()
