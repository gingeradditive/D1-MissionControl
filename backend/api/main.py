from fastapi import FastAPI, Query
from fastapi.middleware.cors import CORSMiddleware
from backend.dryer_control import DryerController
from threading import Thread
from datetime import datetime
import time

app = FastAPI()
dryer = DryerController(set_temp=45.0)  # default value

origins = ["*"]
app.add_middleware(
    CORSMiddleware, allow_origins=origins, allow_credentials=True,
    allow_methods=["*"], allow_headers=["*"],
)

running = True

def background_loop():
    global running
    while running:
        now, temp, hum = dryer.read_sensor()
        dryer.update_heater(temp)
        if time.time() - dryer.log_timer >= 10:
            dryer.log_timer = time.time()
            dryer.log(now.strftime('%Y-%m-%d %H:%M:%S'), temp, hum)
        time.sleep(1)

thread = Thread(target=background_loop)
thread.start()

@app.get("/status")
def get_status(mode: str = Query(default="1h", enum=["1m", "1h", "12h"])):
    try:
        history = dryer.get_graph_data(mode)
    except ValueError:
        return {"error": "Invalid mode. Use one of: 1m, 1h, 12h"}

    latest = history[-1] if history else (datetime.now(), 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0)
    timestamp, temp, hum, heater_ratio, temp_min, temp_max, hum_min, hum_max = latest

    return {
        "setpoint": dryer.set_temp,
        "current_temp": round(temp, 2),
        "current_humidity": round(hum, 2),
        "heater_ratio": round(heater_ratio, 2),
        "mode": mode,
        "history": [
            {
                "timestamp": ts.strftime("%Y-%m-%d %H:%M:%S"),
                "temperature": round(t, 2),
                "humidity": round(h, 2),
                "heater_ratio": round(r, 2),
                "temp_min": round(t_min, 2),
                "temp_max": round(t_max, 2),
                "hum_min": round(h_min, 2),
                "hum_max": round(h_max, 2),
            } for ts, t, h, r, t_min, t_max, h_min, h_max in history
        ]
    }

@app.post("/setpoint/{value}")
def set_setpoint(value: float):
    dryer.set_temp = value
    dryer.tolerance = value * 0.01
    return {"setpoint": dryer.set_temp}

@app.on_event("shutdown")
def on_shutdown():
    global running
    running = False
    thread.join()
    dryer.shutdown()

