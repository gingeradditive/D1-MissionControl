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

    def restart_services(self):
        services = [
            "dryer-frontend.service",
            "getty@tty1.service",
            "dryer-backend.service"
        ]

        for service in services:
            print(f"🔁 Riavvio del servizio: {service}")
            self.run_command(f"sudo systemctl restart {service}")


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
        self.restart_services()
        return True


    def get_current_version(self) -> dict:
        """Ritorna info sul commit attuale."""
        commit_hash = self.run_command("git rev-parse HEAD", cwd=self.project_path)
        commit_msg = self.run_command("git log -1 --pretty=%B", cwd=self.project_path)
        commit_date = self.run_command("git log -1 --date=iso --pretty=format:%cd", cwd=self.project_path)
        
        return {
            "commit": commit_hash.strip()[:7],
            "message": commit_msg.strip(),
            "date": commit_date.strip(),
        }


    def is_update_available(self) -> bool:
        """Controlla se ci sono aggiornamenti disponibili (senza applicarli)."""
        self.mark_directory_safe()
        self.run_command("git fetch", cwd=self.project_path)
        local = self.run_command("git rev-parse HEAD", cwd=self.project_path)
        remote = self.run_command("git rev-parse @{u}", cwd=self.project_path)
        return local != remote
