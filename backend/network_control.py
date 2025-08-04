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

    def connect_to_network(self, ssid: str, password: str) -> bool:
        conf = f"""
network={{
    ssid="{ssid}"
    psk="{password}"
}}
"""
        try:
            with open('/etc/wpa_supplicant/wpa_supplicant.conf', 'a') as f:
                f.write(conf)
            result = subprocess.run(['wpa_cli', '-i', 'wlan0', 'reconfigure'], check=True, stdout=subprocess.PIPE, stderr=subprocess.PIPE)
            return result.returncode == 0
        except Exception:
            return False


    def get_ip(self):
        if IS_RASPBERRY:
            try:
                s = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
                s.connect(("8.8.8.8", 80))
                ip = s.getsockname()[0]
                s.close()
                return ip
            except Exception as e:
                print(f"Errore nel recupero IP: {e}")
                return "127.0.0.1"
        else:
            return "192.168.1.100"

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

                return {"connected": connected, "ssid": ssid, "strength": strength}

            except Exception as e:
                print(f"Errore get_connection_status: {e}")
                return {"connected": False, "ssid": None, "strength": 0}
        else:
            # Mock per ambiente non-Raspberry
            return {"connected": True, "ssid": "Mock_Network", "strength": 72}

    def get_current_ssid(self):
        try:
            output = subprocess.check_output(
                ['iwgetid', '-r'], encoding='utf-8').strip()
            return output if output else None
        except Exception:
            return None
