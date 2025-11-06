from pathlib import Path
from backend.update.git_manager import git_pull, get_current_version, is_update_available
from backend.update.dependencies import install_backend_dependencies
from backend.update.frontend_builder import build_frontend
from backend.update.system_control import reboot_device


class UpdateController:
    def __init__(self, project_path: str):
        self.project_path = Path(project_path)

    def full_update(self) -> bool:
        """Esegue git pull, aggiorna backend, builda frontend e riavvia"""
        print("🔄 Eseguo git pull...")
        output = git_pull(self.project_path)

        if "Already up to date." in output or "Già aggiornato" in output:
            print("✅ Nessun aggiornamento trovato.")
            return False

        print("📦 Aggiorno dipendenze backend...")
        install_backend_dependencies(self.project_path)

        print("🧱 Ricostruisco il frontend...")
        build_frontend(self.project_path)

        print("🔁 Riavvio necessario, lo eseguo ora...")
        reboot_device()

        return True

    def get_current_version(self) -> dict:
        return get_current_version(self.project_path)

    def is_update_available(self) -> bool:
        return is_update_available(self.project_path)
