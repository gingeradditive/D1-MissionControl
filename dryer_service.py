import os
import socket
import time
import platform
from simple_pid import PID
import json
import modules.consoleEnhancer as console

IS_LINUX = platform.system() == "Linux"
HOST = '127.0.0.1'
PORT = 9999
CICLE_DURETION = 60 * 1  # sec*mmin
REGENERATION_TEMP = 80.0

if IS_LINUX:
    console.log_info("Ambiente Linux rilevato: modalità PRODUZIONE")
    SSR_PIN = 17
    REGNERATIONFLOWPATH_PIN = 27
    # GPIO.setmode(GPIO.BCM)
    # GPIO.setup(SSR_PIN, GPIO.OUT)
    # GPIO.setup(REGNERATIONFLOWPATH_PIN, GPIO.OUT)
else:
    console.log_info("Ambiente Windows rilevato: modalità SVILUPPO")


def read_temperature():
    if IS_LINUX:
        return 50.0  # TODO:Da sostituire con lettura reale
    else:
        console.log_demo("Lettura temperatura simulata")
        return 50.0 + (os.urandom(1)[0] % 10)


pid = PID(Kp=2.0, Ki=1.0, Kd=0.1, setpoint=60.0)
pid.output_limits = (0, 1)

sock = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
sock.bind((HOST, PORT))
sock.setblocking(False)

dryer_on = True
last_sender = None
dryer_active_cycle = "DRYING"
dryer_start_cycle = time.time()
saved_temp = 0.0


def handle_udp_commands():
    global dryer_on, last_sender
    try:
        data, addr = sock.recvfrom(1024)
        message = data.decode().strip()
        last_sender = addr
        console.log_message(f"UDP Ricevuto: '{message}' da {addr}")

        if message.upper() == "POWER_OFF":
            dryer_on = False
            sock.sendto(b"DRYER_OFF", addr)

        elif message.upper() == "POWER_ON":
            dryer_on = True
            sock.sendto(b"DRYER_ON", addr)

        elif message.upper() == "GET_STATUS":
            set_temp = pid.setpoint if dryer_on else 0
            response = {
                "DryerStatus": dryer_on,
                "TemperatureSet": round(set_temp, 1),
                "CurrentTemperature": round(read_temperature(), 1),
                "CycleStatus": dryer_active_cycle,
                "CycleTimeLeftSec": int(CICLE_DURETION - (time.time() - dryer_start_cycle)) if dryer_on else 0,
            }
            sock.sendto(json.dumps(response).encode(), addr)

        else:
            try:
                new_temp = float(message)
                pid.setpoint = new_temp
                console.log_info(f"SetTemperature aggiornato a: {new_temp}°C")
                sock.sendto(f"SetTemperature:{new_temp}".encode(), addr)
            except ValueError:
                console.log_warn(f"Comando sconosciuto: {message}")
                sock.sendto(b"ERROR: Unknown command", addr)
    except BlockingIOError:
        pass
    except ConnectionResetError:
        console.log_warn("Connessione UDP resettata dal client. Ignoro.")


def control_ssr(output):
    if IS_LINUX:
        if output >= 0.5:
            console.log_message("SSR ON")
            # GPIO.output(SSR_PIN, GPIO.HIGH)
        else:
            console.log_message("SSR OFF")
            # GPIO.output(SSR_PIN, GPIO.LOW)
    else:
        if output >= 0.5:
            console.log_demo("SSR ON (simulazione)")
        else:
            console.log_demo("SSR OFF (simulazione)")


def turn_off_ssr():
    if IS_LINUX:
        console.log_message("SSR OFF (manuale)")
        # GPIO.output(SSR_PIN, GPIO.LOW)
    else:
        console.log_demo("SSR OFF (simulazione)")


def update_cycle_status():
    global dryer_active_cycle, dryer_start_cycle, saved_temp

    if time.time() - dryer_start_cycle > CICLE_DURETION:
        if dryer_active_cycle == "DRYING":
            console.log_info("Ciclo di asciugatura completato")
            dryer_active_cycle = "REGENERATION"
            dryer_start_cycle = time.time()
            console.log_info("Inizio ciclo di rigenerazione")
            saved_temp = pid.setpoint
            pid.setpoint = REGENERATION_TEMP
            console.log_message("REGNERATION AIR PATH ON")
            # GPIO.output(REGNERATIONFLOWPATH_PIN, GPIO.HIGH)
        elif dryer_active_cycle == "REGENERATION":
            console.log_info("Ciclo di rigenerazione completato")
            dryer_active_cycle = "DRYING"
            dryer_start_cycle = time.time()
            console.log_info("Inizio ciclo di asciugatura")
            pid.setpoint = saved_temp
            console.log_message("REGNERATION AIR PATH OFF")
            # GPIO.output(REGNERATIONFLOWPATH_PIN, GPIO.LOW)


try:
    while True:
        handle_udp_commands()
        temp = read_temperature()
        console.log_info(f"Temperatura attuale: {temp:.2f}°C")

        # check cycle end
        if dryer_on:
            update_cycle_status()

            console.log_info(f"Ciclo attivo: {dryer_active_cycle}")
            console.log_info(
                f"ETA: {int((CICLE_DURETION - (time.time() - dryer_start_cycle)) / 60)} min {int((CICLE_DURETION - (time.time() - dryer_start_cycle)) % 60)} sec")

            output = pid(temp)
            console.log_info(f"Output PID: {output:.2f}")
            console.log_info(f"SetPoint: {pid.setpoint:.2f}°C")
            control_ssr(output)
        else:
            turn_off_ssr()
            console.log_info("Asciugatrice spenta - PID sospeso")

        time.sleep(1)
        print("")

except KeyboardInterrupt:
    console.log_error("Interrotto dall'utente")

finally:
    console.log_info("Pulizia finale...")
    if IS_LINUX:
        # GPIO.cleanup()
        pass
    sock.close()
