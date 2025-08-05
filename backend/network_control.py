import subprocess
import socket
import requests

try:
    import board
    import RPi.GPIO as GPIO
    IS_RASPBERRY = True
except (ImportError, NotImplementedError):
    IS_RASPBERRY = False


class NetworkController:
    def __init__(self):
        self.networks = []

    def get_networks(self):
        if IS_RASPBERRY:
            try:
                output = subprocess.check_output(
                    ['nmcli', '-t', '-f', 'SSID,SIGNAL', 'dev', 'wifi'], encoding='utf-8')
                network_map = {}
                for line in output.strip().split('\n'):
                    if line:
                        ssid, signal = line.split(":")
                        signal = int(signal)
                        if ssid:  # Evita SSID vuoti
                            if ssid not in network_map or signal > network_map[ssid]:
                                network_map[ssid] = signal
                # Converte il dizionario in una lista di dizionari
                networks = [{"ssid": ssid, "strength": signal}
                            for ssid, signal in network_map.items()]
                self.networks = networks
                return networks
            except Exception as e:
                print(f"Errore nel recupero delle reti Wi-Fi: {e}")
                return []
        else:
            # Dati di mock
            return [
                {"ssid": "Home_WiFi", "strength": 65},
                {"ssid": "Office_Net", "strength": 80},
                {"ssid": "Cafe_Free_WiFi", "strength": 40}
            ]
        

    def connect_to_network(self, ssid: str, password: str):
        if IS_RASPBERRY:
            try:
                # Comando per connettersi alla rete wifi con nmcli
                result = subprocess.run(
                    ['nmcli', 'device', 'wifi', 'connect', ssid, 'password', password],
                    capture_output=True,
                    text=True
                )

                if result.returncode == 0:
                    print(f"Connesso con successo a {ssid}")
                    print(result.stdout)
                    return True
                else:
                    print(f"Errore durante la connessione a {ssid}:")
                    print(result.stderr)
                    return False

            except Exception as e:
                print("Errore durante l'esecuzione del comando:")
                print(str(e))
                return False
        else: 
            if password == "Success":
                return True
            else:
                return False
                
    def forget_current_connection(self):
        if IS_RASPBERRY:
            try:
                # Trova il nome della connessione attiva
                result = subprocess.run(
                    ['nmcli', '-t', '-f', 'NAME,DEVICE', 'connection', 'show', '--active'],
                    capture_output=True,
                    text=True
                )

                if result.returncode != 0:
                    print("Errore nel recuperare la connessione attiva:")
                    print(result.stderr)
                    return False

                # Estrai il nome della connessione
                active_connections = result.stdout.strip().split('\n')
                wifi_connection = None
                for conn in active_connections:
                    name, device = conn.split(":")
                    if "wlan" in device:
                        wifi_connection = name
                        break

                if not wifi_connection:
                    print("Nessuna connessione Wi-Fi attiva trovata.")
                    return False

                # Elimina la connessione
                del_result = subprocess.run(
                    ['nmcli', 'connection', 'delete', wifi_connection],
                    capture_output=True,
                    text=True
                )

                if del_result.returncode == 0:
                    print(f"Connessione '{wifi_connection}' dimenticata con successo.")
                    return True
                else:
                    print(f"Errore durante la rimozione della connessione '{wifi_connection}':")
                    print(del_result.stderr)
                    return False

            except Exception as e:
                print("Errore durante la rimozione della connessione:")
                print(str(e))
                return False
        else:
            print("Simulazione: connessione dimenticata")
            return True

                
    def network_has_g1os(self):
        try:
            response = requests.get("http://g1os.local", timeout=5)
            return response.status_code == 200
        except requests.RequestException:
            return False

    def get_connection_status(self):               
        if IS_RASPBERRY:
            try:
                output = subprocess.check_output(
                    ['iwconfig'], stderr=subprocess.DEVNULL, encoding='utf-8'
                )

                connected = False
                ssid = None
                strength = 0

                current_interface = None

                for line in output.splitlines():
                    line = line.strip()

                    # Detect the interface line (e.g., wlan0)
                    if line and not line.startswith(' '):
                        current_interface = line.split()[0]

                    if "ESSID" in line:
                        if "off/any" in line or 'ESSID:""' in line:
                            connected = False
                            ssid = None
                        else:
                            connected = True
                            ssid = line.split('ESSID:')[1].strip().strip('"')

                    if "Signal level" in line:
                        parts = line.split()
                        for part in parts:
                            if "level=" in part:
                                try:
                                    level = int(part.split("=")[
                                                1].replace("dBm", ""))
                                    strength = max(
                                        0, min(100, 2 * (level + 100)))
                                except:
                                    pass

                s = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
                s.connect(("8.8.8.8", 80))
                ip = s.getsockname()[0]
                s.close()
                
                return {"connected": connected, "ssid": ssid, "strength": strength, "ip": ip}

            except Exception as e:
                print(f"Errore get_connection_status: {e}")
                return {"connected": False, "ssid": None, "strength": 0, "ip": "--.--.--.--"}
        else:
            return {"connected": True, "ssid": "Office_Net", "strength": 72, "ip": "192.168.1.1"}