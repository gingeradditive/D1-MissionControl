import subprocess
from pathlib import Path

try:
    import RPi.GPIO as GPIO
    IS_RASPBERRY = True
except (ImportError, NotImplementedError):
    IS_RASPBERRY = False


def run_command(command: str, cwd: Path = None) -> str:
    """Esegue un comando shell e ritorna l'output o solleva un'eccezione"""
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


def reboot_device():
    """Riavvia il Raspberry (o salta in ambiente non-RPi)"""
    if IS_RASPBERRY:
        print("Riavvio del Raspberry Pi...")
        run_command("sudo reboot")
    else:
        print("[DEBUG] Reboot skipped (non-Raspberry environment)")
