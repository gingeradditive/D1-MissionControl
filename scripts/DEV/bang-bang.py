import time
import board
import adafruit_sht4x
import RPi.GPIO as GPIO
from rich.live import Live
from rich.table import Table
from rich.console import Console
from rich.panel import Panel
from collections import deque
from datetime import datetime

# === Configurazione GPIO ===
SSR_GPIO = 17
GPIO.setmode(GPIO.BCM)
GPIO.setup(SSR_GPIO, GPIO.OUT)
GPIO.output(SSR_GPIO, GPIO.LOW)

# === Sensore ===
i2c = board.I2C()
sht = adafruit_sht4x.SHT4x(i2c)
sht.mode = adafruit_sht4x.Mode.NOHEAT_HIGHPRECISION

# === Input utente ===
set_temp = float(input("Set temperature (°C): "))
tolerance = set_temp * 0.01

# === Timestamp d'avvio per il log ===
start_time = datetime.now()
log_file = f"temperature_log_{start_time.strftime('%Y%m%d_%H%M%S')}.csv"

# === Variabili per lo storico ===
history_len = 12
temp_history = deque(maxlen=history_len)
log_timer = time.time()

console = Console()

def log_to_file(timestamp, temp, hum, ssr_heater):
    with open(log_file, "a") as f:
        f.write(f"{timestamp},{temp:.2f},{hum:.2f},{ssr_heater},{set_temp:.2f}\n")


def create_graph(history):
    if not history:
        return "[dim]No data yet[/dim]"

    max_width = 80
    time_width = 8
    label_width = 8
    separator = " | "
    bar_width = max_width - time_width - len(separator) - label_width

    graph = ""
    for timestamp, temp, heater in history:
        time_str = timestamp.strftime('%H:%M:%S')
        norm = int((temp / 100) * bar_width)
        bar_raw = "█" * norm + " " * (bar_width - norm)
        if heater:
            bar = f"[red]{bar_raw}[/red]"
        else:
            bar = f"[cyan]{bar_raw}[/cyan]"
        graph += f"{time_str} {temp:6.1f}°C{separator}{bar}\n"

    return graph


def make_interface(current_temp, current_hum, ssr_heater):
    table = Table(title="SHT4x Temperature Monitor", expand=True)
    table.add_column("Parameter", justify="right")
    table.add_column("Value", justify="left")

    table.add_row("Setpoint", f"{set_temp:.1f} °C")
    table.add_row("Current Temp", f"{current_temp:.1f} °C")
    table.add_row("Humidity", f"{current_hum:.1f} %")
    table.add_row("Heater SSR", "ON 🔥" if ssr_heater else "OFF ❄️")

    graph = create_graph(temp_history)
    return Panel.fit(table, title="Status"), Panel.fit(graph, title="Temp History")

# === Intestazione file log ===
with open(log_file, "w") as f:
    f.write("timestamp,temperature,humidity,heater_on,setpoint\n")

# === Loop principale ===
try:
    with Live(console=console, refresh_per_second=1) as live:
        while True:
            temp, hum = sht.measurements
            now = datetime.now()
            now_str = now.strftime('%Y-%m-%d %H:%M:%S')

            # Logica SSR
            if temp < set_temp - tolerance:
                GPIO.output(SSR_GPIO, GPIO.HIGH)
                ssr_heater = True
            elif temp > set_temp + tolerance:
                GPIO.output(SSR_GPIO, GPIO.LOW)
                ssr_heater = False

            temp_history.append((now, temp, ssr_heater))

            # Log ogni 10s
            log_to_file(now_str, temp, hum, ssr_heater)
            status_panel, graph_panel = make_interface(temp, hum, ssr_heater)

            layout = Table.grid(expand=True)
            layout.add_row(status_panel)
            layout.add_row(graph_panel)

            live.update(layout)
            time.sleep(5)

except KeyboardInterrupt:
    print("Exiting...")
finally:
    GPIO.output(SSR_GPIO, GPIO.LOW)
    GPIO.cleanup()
