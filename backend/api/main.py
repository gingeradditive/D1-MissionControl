from fastapi import FastAPI, Query, HTTPException, Form
from fastapi.middleware.cors import CORSMiddleware
from backend.dryer_control import DryerController
from backend.network_control import NetworkController
from backend.update_control import UpdateController
from backend.config_control import ConfigController
from threading import Thread
from datetime import datetime
import time

app = FastAPI()
dryer = DryerController()  # default value
network = NetworkController()
update = UpdateController(".")
config = ConfigController()
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
        dryer.update_fan_cooldown()
        dryer.update_valve()
        now, max6675_temp, sht40_hum, sht40_temp = dryer.read_sensor()
        dryer.update_heater_pid_discrete(max6675_temp)
        if time.time() - dryer.log_timer >= 10:
            dryer.log_timer = time.time()
            dryer.log(now.strftime('%Y-%m-%d %H:%M:%S'),
                      max6675_temp, sht40_hum, sht40_temp)
        time.sleep(1)


thread = Thread(target=background_loop)
thread.start()


@app.get("/status")
def get_status():
    latest = dryer.get_status_data()
    timestamp, max6675_temp, sht40_temp, sht40_hum, ssr_heater, ssr_fan, status, valve = latest

    return {
        "setpoint": dryer.set_temp,
        "current_temp": round(max6675_temp, 2),
        "current_humidity": round(sht40_hum, 2),
        "heater": ssr_heater,
        "fan": ssr_fan,
        "status": status,
        "valve": valve,
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
                "timestamp": timestamp.strftime("%Y-%m-%d %H:%M:%S"),
                "temperature": round(max6675_temp, 2),
                "humidity": round(sht40_hum, 2),
                "heater_ratio": round(heater_ratio, 2),
                "fan_ratio": round(fan_ratio, 2),
                "temp_min": round(max6675_temp_min, 2),
                "temp_max": round(max6675_temp_max, 2),
                "hum_min": round(sht40_hum_min, 2),
                "hum_max": round(sht40_hum_max, 2),
                "valve": round(valve, 2),
            } for timestamp, max6675_temp, sht40_hum, heater_ratio, fan_ratio, max6675_temp_min, max6675_temp_max, sht40_hum_min, sht40_hum_max, valve in history
        ]
    }


@app.post("/setpoint/{value}")
def set_setpoint(value: float):
    dryer.update_setpoint(value)
    return {"setpoint": dryer.set_temp}


@app.get("/connection")
def get_networks():
    return network.get_networks()


@app.post("/connection/{ssid}/{password}")
def connect_to_network(ssid: str, password: str):
    if not ssid or not password:
        return {"error": "SSID and password must be provided"}

    result = network.connect_to_network(ssid, password)
    if result:
        return {"status": "Success", "message": "Connected successfully"}
    else:
        return {"status": "Error", "message": "Failed to connect to the network"}


@app.get("/connection/status")
def get_connection_status():
    return network.get_connection_status()


@app.get("/connection/g1os")
def check_g1os():
    return {"status": network.network_has_g1os()}


@app.post("/connection/forget")
def set_connection_forget():
    result = network.forget_current_connection()
    if result:
        return {"status": "Success", "message": "Connection forgotten successfully"}
    else:
        return {"status": "Error", "message": "Failed to forget the connection"}


@app.get("/update/version")
def get_version():
    try:
        return update.get_current_version()
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/update/check")
def check_updates():
    try:
        is_available = update.is_update_available()
        return {"updateAvailable": is_available}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/update/apply")
def apply_update():
    try:
        update_applied = update.full_update()
        return {"updateApplied": update_applied}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))



@app.get("/config")
def get_config():
    return config.get_all_config()


@app.post("/config/set")
def set_config(key: str = Form(...), value: str = Form(...)):
    config.set_config_param(key, value)
    return {"status": "Success", "message": "Updated configuration"}


@app.get("/config/{key}")
def get_config_by_key(key: str):
    return config.get_config_param(key, None)


@app.on_event("shutdown")
def on_shutdown():
    global running
    running = False
    thread.join()
    dryer.shutdown()
