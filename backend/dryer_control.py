import time
import random
from datetime import datetime, timedelta
from collections import deque

try:
    import spidev
    import time
    import RPi.GPIO as GPIO
    IS_RASPBERRY = True
except (ImportError, NotImplementedError):
    IS_RASPBERRY = False

SETPOINT_FILE = "setpoint.txt"


class DryerController:

    def __init__(self):
        self.last_heater_action = time.time()
        self.heater_pulse_duration = 10  # secondi
        self.Kp = 5.0      # quanto più l’errore è alto, tanto meno attende
        self.Ki = 0.1      # accumulo dell’errore nel tempo
        self.min_pause = 5   # attesa minima tra impulsi
        self.max_pause = 60  # attesa massima tra impulsi
        
        self.integral_error = 0.0
        self.prev_error = 0.0
        set_temp = self.load_setpoint()
        self.set_temp = set_temp
        self.tolerance = set_temp * 0.01
        self.heater_status = False
        self.fan_status = False
        self.temp_history = deque(maxlen=43200)  # 12h a 1Hz
        self.log_timer = time.time()
        self.dryer_status = False

        # DEMO VALUES
        self.prev_temp = random.uniform(20, 30)
        self.prev_hum = random.uniform(30, 50)

        self.log_file = f"logs/temperature_log_{datetime.now().strftime('%Y%m%d_%H%M%S')}.csv"
        with open(self.log_file, "w") as f:
            f.write(
                "timestamp;temperature;humidity;heater_status;fan_status;setpoint\n")

        if IS_RASPBERRY:
            self.SSR_HEATER_GPIO = 23
            self.SSR_FAN_GPIO = 24
            self.MAX6675BUS = 0
            self.MAX6675DEVICE = 0
            GPIO.setmode(GPIO.BCM)

            GPIO.setup(self.SSR_HEATER_GPIO, GPIO.OUT)
            GPIO.setup(self.SSR_FAN_GPIO, GPIO.OUT)

            GPIO.output(self.SSR_HEATER_GPIO, GPIO.LOW)
            GPIO.output(self.SSR_FAN_GPIO, GPIO.LOW)

            self.spi = spidev.SpiDev()
            self.spi.open(self.MAX6675BUS, self.MAX6675DEVICE)
            self.spi.max_speed_hz = 5000000
            self.spi.mode = 0b00

    def start(self):
        if not self.dryer_status:
            self.dryer_status = True
            if IS_RASPBERRY:
                GPIO.output(self.SSR_FAN_GPIO, GPIO.HIGH)
            self.fan_status = True
            print("Heater started.")

    def stop(self):
        if self.dryer_status:
            self.dryer_status = False
            if IS_RASPBERRY:
                GPIO.output(self.SSR_FAN_GPIO, GPIO.LOW)
            self.fan_status = False
            print("Heater stopped.")

    def read_sensor(self):
        if IS_RASPBERRY:
            raw = self.spi.readbytes(2)
            if len(raw) != 2:
                return None
            value = (raw[0] << 8) | raw[1]
            if value & 0x4:
                return None
            temp = (value >> 3) * 0.25
            hum = 0.0
        else:
            # Variazione lenta
            self.prev_temp += random.uniform(-0.5, 0.5)
            # Limita l'intervallo
            self.prev_temp = max(15, min(70, self.prev_temp))

            self.prev_hum += random.uniform(-1, 1)
            self.prev_hum = max(10, min(90, self.prev_hum))

            temp = self.prev_temp
            hum = self.prev_hum

        now = datetime.now()
        self.temp_history.append(
            (now, temp, hum, self.heater_status, self.fan_status))
        return now, temp, hum

    def update_heater_pid_discrete(self, temp):
        if not self.dryer_status:
            if IS_RASPBERRY:
                GPIO.output(self.SSR_HEATER_GPIO, GPIO.LOW)
            self.heater_status = False
            return

        now = time.time()
        error = self.set_temp - temp

        # Calcolo integrale (area sotto l'errore nel tempo)
        self.integral_error += error * 1.0  # tempo tra campioni: 1s

        # Calcolo tempo di attesa proporzionale all’errore
        raw_pause = self.max_pause - (self.Kp * error + self.Ki * self.integral_error)
        pause_duration = max(self.min_pause, min(self.max_pause, raw_pause))

        # Accendi solo se spento da abbastanza tempo e serve calore
        if error > self.tolerance and not self.heater_status:
            if now - self.last_heater_action >= pause_duration:
                if IS_RASPBERRY:
                    GPIO.output(self.SSR_HEATER_GPIO, GPIO.HIGH)
                self.heater_status = True
                self.last_heater_action = now
                print(f"[+{error:.2f}°C] Heater ON per {self.heater_pulse_duration}s (pause: {pause_duration:.1f}s)")

        # Spegni dopo X secondi
        elif self.heater_status and now - self.last_heater_action >= self.heater_pulse_duration:
            if IS_RASPBERRY:
                GPIO.output(self.SSR_HEATER_GPIO, GPIO.LOW)
            self.heater_status = False
            self.last_heater_action = now
            print("Heater OFF")

    def log(self, timestamp, temp, hum):
        with open(self.log_file, "a") as f:
            f.write(
                f"{timestamp};{temp:.2f};{hum:.2f};{self.heater_status};{self.fan_status};{self.set_temp:.2f}\n")

    def shutdown(self):
        if IS_RASPBERRY:
            GPIO.output(self.SSR_HEATER_GPIO, GPIO.LOW)
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
            for ts, temp, hum, heater, fan in filtered:
                heater_ratio = 1.0 if heater else 0.0
                fan_ratio = 1.0 if fan else 0.0
                results.append((ts, temp, hum, heater_ratio,
                               fan_ratio, temp, temp, hum, hum))
            return results

        elif mode == '1h':
            # ultimi 60 minuti, media ogni minuto
            start = now - timedelta(hours=1)
            filtered = [x for x in data if x[0] >= start]

            results = []
            for i in range(60):
                window_start = start + timedelta(minutes=i)
                window_end = window_start + timedelta(minutes=1)
                window_data = [
                    x for x in filtered if window_start <= x[0] < window_end]
                if not window_data:
                    continue
                temps = [x[1] for x in window_data]
                hums = [x[2] for x in window_data]
                heaters = [1 if x[3] else 0 for x in window_data]
                fans = [1 if x[4] else 0 for x in window_data]
                ts = window_start + timedelta(seconds=30)  # metà intervallo

                temp_avg = sum(temps) / len(temps)
                hum_avg = sum(hums) / len(hums)
                heater_ratio = sum(heaters) / len(heaters)
                fan_ratio = sum(fans) / len(fans)
                results.append((
                    ts,
                    temp_avg,
                    hum_avg,
                    heater_ratio,
                    fan_ratio,
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
                window_data = [
                    x for x in filtered if window_start <= x[0] < window_end]
                if not window_data:
                    continue
                temps = [x[1] for x in window_data]
                hums = [x[2] for x in window_data]
                heaters = [1 if x[3] else 0 for x in window_data]
                fans = [1 if x[3] else 0 for x in window_data]
                ts = window_start + timedelta(minutes=15)  # metà intervallo

                temp_avg = sum(temps) / len(temps)
                hum_avg = sum(hums) / len(hums)
                heater_ratio = sum(heaters) / len(heaters)
                fan_ratio = sum(fans) / len(fans)

                results.append((
                    ts,
                    temp_avg,
                    hum_avg,
                    heater_ratio,
                    fan_ratio,
                    min(temps),
                    max(temps),
                    min(hums),
                    max(hums)
                ))
            return results

        else:
            raise ValueError("Invalid mode")

    def get_status_data(self):
        if not self.temp_history:
            data = datetime.now(), 0.0, 0.0, 0.0, False
        else:
            data = self.temp_history[-1] + (self.dryer_status,)
        return data

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

    def save_setpoint(self, value):
        try:
            with open(SETPOINT_FILE, "w") as f:
                f.write(f"{value}")
        except Exception as e:
            print(f"Errore nel salvataggio del setpoint: {e}")

    def load_setpoint(self):
        try:
            with open(SETPOINT_FILE, "r") as f:
                return float(f.read().strip())
        except (FileNotFoundError, ValueError):
            print("Setpoint non trovato, uso valore di default 45.0°C")
            return 45.0

    def update_setpoint(self, new_temp):
        self.set_temp = new_temp
        self.tolerance = new_temp * 0.01
        self.save_setpoint(new_temp)
        print(f"Setpoint aggiornato a {new_temp}°C")


# --- Esempio di utilizzo in un loop principale ---
if __name__ == "__main__":
    controller = DryerController()

    try:
        while True:
            now, temp, hum = controller.read_sensor()
            controller.update_heater_pid_discrete(temp)
            controller.log(now, temp, hum)
            time.sleep(1)

    except KeyboardInterrupt:
        print("Arresto del controller.")
        controller.shutdown()
