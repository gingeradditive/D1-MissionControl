import subprocess
from pathlib import Path

try:
    import board
    import RPi.GPIO as GPIO
    IS_RASPBERRY = True
except (ImportError, NotImplementedError):
    IS_RASPBERRY = False

class UpdateController:
    def __init__(self, project_path: str):
        self.project_path = Path(project_path)

    def run_command(self, command: str, cwd: Path = None) -> str:
        try:
            result = subprocess.run(
                command,
                shell=True,
                cwd=cwd,
                capture_output=True,
                text=True
            )
            if result.returncode != 0:
                raise RuntimeError(result.stderr.strip())
            return result.stdout.strip()
        except Exception as e:
            raise RuntimeError(f"Command '{command}' failed: {e}")

    def git_pull(self) -> str:
        return self.run_command("git pull", cwd=self.project_path)

    def reboot_device(self):
        if IS_RASPBERRY:
            print("Riavvio del Raspberry Pi...")
            self.run_command("sudo reboot")
        else:
            print("[DEBUG] Reboot required, but not in development environment ... No action taken.")

    def check_and_update(self) -> bool:
        output = self.git_pull()
        if "Already up to date." in output or "Già aggiornato" in output:
            return False  # Nessun aggiornamento
        else:
            self.reboot_device()
            return True  # Aggiornamento trovato, riavvio richiesto
