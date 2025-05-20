import os
import socket
import time
import platform
from simple_pid import PID
import json

# Determina ambiente
IS_LINUX = platform.system() == "Linux"

if IS_LINUX:
    print("[INFO] Ambiente Linux rilevato: modalità PRODUZIONE")
    # import RPi.GPIO as GPIO
    SSR_PIN = 17
    # GPIO.setmode(GPIO.BCM)
    # GPIO.setup(SSR_PIN, GPIO.OUT)
else:
    print("[INFO] Ambiente Windows rilevato: modalità SVILUPPO")

# Simula temperatura


def read_temperature():
    if IS_LINUX:
        return 50.0  # Da sostituire con lettura reale
    else:
        print("[SIMULAZIONE] Lettura temperatura simulata")
        return 50.0


# Inizializza PID
pid = PID(Kp=2.0, Ki=1.0, Kd=0.1, setpoint=60.0)
pid.output_limits = (0, 1)

# Socket UDP
HOST = '127.0.0.1'
PORT = 9999

sock = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
sock.bind((HOST, PORT))
sock.setblocking(False)

dryer_on = True
last_sender = None


def handle_udp_commands():
    global dryer_on, last_sender
    try:
        data, addr = sock.recvfrom(1024)
        message = data.decode().strip()
        last_sender = addr
        print(f"[UDP] Ricevuto: '{message}' da {addr}")

        if message.upper() == "POWER_OFF":
            dryer_on = False
            sock.sendto(b"DRYER_OFF", addr)
        elif message.upper() == "POWER_ON":
            dryer_on = True
            sock.sendto(b"DRYER_ON", addr)
        elif message.upper() == "GET_STATUS":
            status = "ON" if dryer_on else "OFF"
            set_temp = pid.setpoint
            response = {
                "DryerStatus": status,
                "TemperatureSet": round(set_temp, 1),
                "CurrentTemperature": round(read_temperature(), 1)
            }
            sock.sendto(json.dumps(response).encode(), addr)
        else:
            try:
                new_temp = float(message)
                pid.setpoint = new_temp
                print(f"[SOCKET] SetTemperature aggiornato a: {new_temp}°C")
                sock.sendto(f"SetTemperature:{new_temp}".encode(), addr)
            except ValueError:
                print(f"[WARN] Comando sconosciuto: {message}")
                sock.sendto(b"ERROR: Unknown command", addr)
    except BlockingIOError:
        pass
    except ConnectionResetError:
        print("[WARN] Connessione UDP resettata dal client. Ignoro.")


def control_ssr(output):
    if IS_LINUX:
        if output >= 0.5:
            print("SSR ON")
            # GPIO.output(SSR_PIN, GPIO.HIGH)
        else:
            print("SSR OFF")
            # GPIO.output(SSR_PIN, GPIO.LOW)
    else:
        if output >= 0.5:
            print("[SIMULAZIONE] SSR ON (output PID >= 0.5)")
        else:
            print("[SIMULAZIONE] SSR OFF (output PID < 0.5)")


def turn_off_ssr():
    if IS_LINUX:
        print("SSR OFF (manuale)")
        # GPIO.output(SSR_PIN, GPIO.LOW)
    else:
        print("[SIMULAZIONE] SSR OFF (dryer spento)")


try:
    while True:
        handle_udp_commands()
        temp = read_temperature()
        print(f"Temperatura attuale: {temp:.2f}°C")

        if dryer_on:
            output = pid(temp)
            print(
                f"[PID] Output PID: {output:.2f} | SetPoint: {pid.setpoint:.2f}°C")
            control_ssr(output)
        else:
            turn_off_ssr()
            print("[INFO] Dryer OFF - PID sospeso")

        time.sleep(1)

except KeyboardInterrupt:
    print("Interrotto dall'utente")

finally:
    print("Pulizia finale...")
    if IS_LINUX:
        # GPIO.cleanup()
        pass
    sock.close()
