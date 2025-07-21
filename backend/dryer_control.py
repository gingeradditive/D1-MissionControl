import time
import random
import sys
from datetime import datetime, timedelta
from collections import deque

try:
    import board
    import adafruit_sht4x
    import RPi.GPIO as GPIO
    IS_RASPBERRY = True
except (ImportError, NotImplementedError):
    IS_RASPBERRY = False


class DryerController:
    def __init__(self, set_temp):
        self.set_temp = set_temp
        self.tolerance = set_temp * 0.01
        self.heater_status = False
        self.temp_history = deque(maxlen=43200)  # 12h a 1Hz
        self.log_timer = time.time()

        self.log_file = f"logs/temperature_log_{datetime.now().strftime('%Y%m%d_%H%M%S')}.csv"
        with open(self.log_file, "w") as f:
            f.write("timestamp,temperature,humidity,heater_on,setpoint\n")

        if IS_RASPBERRY:
            self.SSR_GPIO = 17
            GPIO.setmode(GPIO.BCM)
            GPIO.setup(self.SSR_GPIO, GPIO.OUT)
            GPIO.output(self.SSR_GPIO, GPIO.LOW)

            self.i2c = board.I2C()
            self.sht = adafruit_sht4x.SHT4x(self.i2c)
            self.sht.mode = adafruit_sht4x.Mode.NOHEAT_HIGHPRECISION

    def read_sensor(self):
        if IS_RASPBERRY:
            temp, hum = self.sht.measurements
        else:
            temp = random.uniform(20, 60)
            hum = random.uniform(20, 80)

        now = datetime.now()
        self.temp_history.append((now, temp, hum, self.heater_status))
        return now, temp, hum

    def update_heater(self, temp):
        if temp < self.set_temp - self.tolerance:
            if IS_RASPBERRY:
                GPIO.output(self.SSR_GPIO, GPIO.HIGH)
            self.heater_status = True
        elif temp > self.set_temp + self.tolerance:
            if IS_RASPBERRY:
                GPIO.output(self.SSR_GPIO, GPIO.LOW)
            self.heater_status = False

    def log(self, timestamp, temp, hum):
        with open(self.log_file, "a") as f:
            f.write(f"{timestamp},{temp:.2f},{hum:.2f},{self.heater_status},{self.set_temp:.2f}\n")

    def shutdown(self):
        if IS_RASPBERRY:
            GPIO.output(self.SSR_GPIO, GPIO.LOW)
            GPIO.cleanup()

    def get_history_data(self, mode='1h'):
        now = datetime.now()
        data = list(self.temp_history)  # (timestamp, temp, heater)
        if not data:
            return []

        # Calcoliamo intervallo e aggregazione
        if mode == '1m':  # ultimi 60 secondi, valori grezzi
            filtered = [x for x in data if (now - x[0]).total_seconds() <= 60]
            # Qui i valori sono singoli, ma possiamo fare anche min/max identici a temp stesso
            results = []
            for ts, temp, hum, heater in filtered:
                heater_ratio = 1.0 if heater else 0.0
                results.append((ts, temp, hum, heater_ratio, temp, temp, hum, hum))
            return results

        elif mode == '1h':
            # ultimi 60 minuti, media ogni minuto
            start = now - timedelta(hours=1)
            filtered = [x for x in data if x[0] >= start]

            results = []
            for i in range(60):
                window_start = start + timedelta(minutes=i)
                window_end = window_start + timedelta(minutes=1)
                window_data = [x for x in filtered if window_start <= x[0] < window_end]
                if not window_data:
                    continue
                temps = [x[1] for x in window_data]
                hums = [x[2] for x in window_data]
                heaters = [1 if x[3] else 0 for x in window_data]
                ts = window_start + timedelta(seconds=30)  # metà intervallo

                temp_avg = sum(temps) / len(temps)
                hum_avg = sum(hums) / len(hums)
                heater_ratio = sum(heaters) / len(heaters)

                results.append((
                    ts,
                    temp_avg,
                    hum_avg,
                    heater_ratio,
                    min(temps),
                    max(temps),
                    min(hums),
                    max(hums)
                ))
            return results

        elif mode == '12h':
            # ultimi 12h, media ogni 30 minuti (24 valori)
            start = now - timedelta(hours=12)
            filtered = [x for x in data if x[0] >= start]

            results = []
            for i in range(24):
                window_start = start + timedelta(minutes=30*i)
                window_end = window_start + timedelta(minutes=30)
                window_data = [x for x in filtered if window_start <= x[0] < window_end]
                if not window_data:
                    continue
                temps = [x[1] for x in window_data]
                hums = [x[2] for x in window_data]
                heaters = [1 if x[3] else 0 for x in window_data]
                ts = window_start + timedelta(minutes=15)  # metà intervallo

                temp_avg = sum(temps) / len(temps)
                hum_avg = sum(hums) / len(hums)
                heater_ratio = sum(heaters) / len(heaters)

                results.append((
                    ts,
                    temp_avg,
                    hum_avg,
                    heater_ratio,
                    min(temps),
                    max(temps),
                    min(hums),
                    max(hums)
                ))
            return results

        else:
            raise ValueError("Invalid mode")
    
    def get_status_data(self):
        return self.temp_history[-1]

    def aggregate_data(self, data, now, interval_seconds, window_seconds):
        buckets = {}

        for (t, temp, hum, status) in data:
            delta = (now - t).total_seconds()
            if delta <= window_seconds:
                bucket_key = int(delta // interval_seconds)
                if bucket_key not in buckets:
                    buckets[bucket_key] = []
                buckets[bucket_key].append((temp, hum, status))

        result = []
        for key in sorted(buckets.keys()):
            bucket = buckets[key]
            if bucket:
                avg_temp = sum(t for t, _, _ in bucket) / len(bucket)
                avg_hum = sum(h for _, h, _ in bucket) / len(bucket)
                heater_ratio = sum(1 for _, _, s in bucket if s) / len(bucket)
                bucket_time = now - timedelta(seconds=key * interval_seconds)
                result.append((bucket_time, avg_temp, avg_hum, heater_ratio))

        return result


# --- Esempio di utilizzo in un loop principale ---
if __name__ == "__main__":
    controller = DryerController(set_temp=45.0)

    try:
        while True:
            now, temp, hum = controller.read_sensor()
            controller.update_heater(temp)
            controller.log(now, temp, hum)
            time.sleep(1)

    except KeyboardInterrupt:
        print("Arresto del controller.")
        controller.shutdown()
