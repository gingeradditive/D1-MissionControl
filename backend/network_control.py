import requests

class NetworkController:
    def __init__(self):
        self.networks = []  # Placeholder for network data

    def get_networks(self):
        # Simulate fetching available networks and strengths
        return [{"ssid": "Network1", "strength": 50}, {"ssid": "Network2", "strength": 70}]

    def connect_to_network(self, ssid: str, password: str):
        # Simulate connecting to a network
        if ssid and password:
            return True
        return False

    def get_ip(self):
        # Simulate getting the device's IP address
        return "xxx.xxx.xxx.xxx"  
    
    def nerwork_has_g1os(self):
        # check if http://g1os.local is reachable
        try:
            response = requests.get("http://g1os.local", timeout=5)
            return response.status_code == 200
        except requests.RequestException:
            return False
        