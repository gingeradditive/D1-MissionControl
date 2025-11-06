from fastapi import APIRouter, Query
from backend.core.state import controllers

router = APIRouter()
dryer = controllers["dryer"]

@router.get("/status")
def get_status():
    latest = dryer.get_status_data()
    timestamp, max6675_temp, sht40_temp, dew_point, ssr_heater, ssr_fan, status, valve, hum_abs = latest
    return {
        "setpoint": dryer.set_temp,
        "current_temp": round(max6675_temp),
        "current_humidity": round(hum_abs),
        "dew_point": round(dew_point),
        "heater": ssr_heater,
        "fan": ssr_fan,
        "status": status,
        "valve": valve,
        "errors": dryer.errors,
    }

@router.post("/status/{status}")
def set_status(status: bool):
    dryer.start() if status else dryer.stop()
    return {"status": "running" if status else "stopped"}

@router.get("/history")
def get_history(mode: str = Query(default="1h", enum=["1m", "1h", "12h"])):
    history = dryer.get_history_data(mode)
    return {
        "mode": mode,
        "history": [
            {
                "timestamp": t.strftime("%Y-%m-%d %H:%M:%S"),
                "temperature": round(temp, 2),
                "humidity": round(hum, 2),
                "heater_ratio": round(hr, 2),
                "fan_ratio": round(fr, 2),
                "valve": round(valve, 2),
            }
            for t, temp, hum, hr, fr, *_ , valve in history
        ]
    }

@router.post("/setpoint/{value}")
def set_setpoint(value: float):
    dryer.update_setpoint(value)
    return {"setpoint": dryer.set_temp}
