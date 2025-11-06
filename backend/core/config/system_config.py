import subprocess

class SystemConfig:
    """Gestione impostazioni di sistema come timezone"""

    def set_timezone(self, timezone: str):
        try:
            subprocess.run(["sudo", "timedatectl", "set-timezone", timezone], check=True)
            print(f"[SystemConfig] Timezone impostato su: {timezone}")
            return True
        except subprocess.CalledProcessError as e:
            print(f"[SystemConfig] Errore nell'impostare timezone: {e}")
            return False
        except Exception as e:
            print(f"[SystemConfig] Errore sconosciuto: {e}")
            return False

    def get_timezone(self) -> str:
        try:
            result = subprocess.run(
                ["timedatectl", "show", "-p", "Timezone", "--value"],
                capture_output=True, text=True, check=True
            )
            return result.stdout.strip()
        except Exception as e:
            print(f"[SystemConfig] Errore nel recupero timezone: {e}")
            return "Sconosciuto"
