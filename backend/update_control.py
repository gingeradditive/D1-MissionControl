import subprocess
from pathlib import Path

class UpdateController:
    def __init__(self, project_path: str):
        self.project_path = Path(project_path)
        self.services = ["dryer-frontend.service", "dryer-backend.service"]

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

    def restart_services(self):
        for service in self.services:
            self.run_command(f"sudo systemctl restart {service}")

    def check_and_update(self) -> bool:
        output = self.git_pull()
        if "Already up to date." in output or "Già aggiornato" in output:
            return False  # No update
        else:
            self.restart_services()
            return True  # Update was applied
