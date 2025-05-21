# Codice colore ANSI
GREEN = "\033[92m"
YELLOW = "\033[93m"
RED = "\033[91m"
RESET = "\033[0m"
VIOLET = "\033[95m"
BLUE = "\033[94m"

def log_info(message):
    print(f"{GREEN}INFO:{RESET} {message}")

def log_warn(message):
    print(f"{YELLOW}WARN:{RESET} {message}")

def log_error(message):
    print(f"{RED}ERROR:{RESET} {message}")

def log_debug(message):
    print(f"{YELLOW}DEBUG:{RESET} {message}")

def log_demo(message):
    print(f"{VIOLET}DEMO:{RESET} {message}")

def log_message(message):
    print(f"{BLUE}MESSAGE:{RESET} {message}")