import requests

def has_g1os() -> bool:
    try:
        r = requests.get("http://g1os.local", timeout=5)
        return r.status_code == 200
    except requests.RequestException:
        return False
