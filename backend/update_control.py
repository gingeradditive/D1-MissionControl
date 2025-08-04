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
        self.frontend_path = self.project_path / "frontend"
        self.venv_path = self.project_path / "venv"

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
        self.mark_directory_safe()
        return self.run_command("git pull", cwd=self.project_path)

    def mark_directory_safe(self):
        self.run_command(f"git config --global --add safe.directory {self.project_path}")

    def install_backend_dependencies(self):
        self.run_command("./venv/bin/pip install -r requirements.txt", cwd=self.project_path)

    def build_frontend(self):
        self.run_command("npm install", cwd=self.frontend_path)
        self.run_command("npm run build", cwd=self.frontend_path)

    def reboot_device(self):
        if IS_RASPBERRY:
            print("Riavvio del Raspberry Pi...")
            self.run_command("sudo reboot")
        else:
            print("[DEBUG] Reboot skipped (non-Raspberry environment)")

    def full_update(self) -> bool:
        print("🔄 Eseguo git pull...")
        output = self.git_pull()
        if "Already up to date." in output or "Già aggiornato" in output:
            print("✅ Nessun aggiornamento trovato.")
            return False

        print("📦 Aggiorno dipendenze backend...")
        self.install_backend_dependencies()

        print("🧱 Ricostruisco il frontend...")
        self.build_frontend()

        print("🔁 Riavvio necessario, lo eseguo ora...")
        self.reboot_device()
        return True
