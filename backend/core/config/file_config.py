import json
import os
from typing import TypeVar, Type, Any

CONFIG_FILE = "config.json"
T = TypeVar("T")


class FileConfig:
    """Gestione del file config.json"""

    def __init__(self, path: str = CONFIG_FILE):
        self.path = path
        # Crea il file se non esiste
        if not os.path.exists(self.path):
            with open(self.path, "w") as f:
                json.dump({}, f, indent=4)

    def _read(self) -> dict[str, Any]:
        try:
            with open(self.path, "r") as f:
                return json.load(f)
        except (json.JSONDecodeError, FileNotFoundError):
            return {}
        except Exception as e:
            print(f"[Config] Errore nel leggere {self.path}: {e}")
            return {}

    def _write(self, data: dict[str, Any]) -> None:
        try:
            with open(self.path, "w") as f:
                json.dump(data, f, indent=4)
        except Exception as e:
            print(f"[Config] Errore nel salvare {self.path}: {e}")

    def get(self, key: str, default: T, cast_type: Type[T] = str) -> T:
        data = self._read()
        if key not in data:
            data[key] = default
            self._write(data)
            return default

        value = data[key]
        try:
            return cast_type(value)
        except (ValueError, TypeError):
            print(f"[Config] Conversione fallita per {key}, ritorno default: {default}")
            return default

    def set(self, key: str, value: Any) -> None:
        data = self._read()
        data[key] = value
        self._write(data)

    def all(self) -> dict[str, Any]:
        return self._read()
