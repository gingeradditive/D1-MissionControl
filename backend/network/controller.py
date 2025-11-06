from backend.network.scanner import get_networks
from backend.network.connection import connect, forget
from backend.network.status import get_status
from backend.network.g1os_check import has_g1os


class NetworkController:
    def __init__(self):
        self.networks = []

    def get_networks(self):
        self.networks = get_networks()
        return self.networks

    def connect_to_network(self, ssid: str, password: str):
        return connect(ssid, password)

    def forget_current_connection(self):
        return forget()

    def get_connection_status(self):
        return get_status()

    def network_has_g1os(self):
        return has_g1os()
