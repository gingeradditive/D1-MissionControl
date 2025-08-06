import json
import os
from typing import TypeVar, Type, Any

CONFIG_FILE = "config.json"

T = TypeVar("T")

class ConfigController:
    def get_config_param(self, key: str, default: T, cast_type: Type[T] = str) -> T:
        config = {}

        if os.path.exists(CONFIG_FILE):
            try:
                with open(CONFIG_FILE, "r") as f:
                    config = json.load(f)
            except Exception as e:
                print(f"Errore nella lettura del file di configurazione: {e}")
        else:
            print("File di configurazione non trovato, verrà creato.")

        # Aggiunge chiave mancante
        if key not in config:
            print(f"Chiave '{key}' mancante, verrà aggiunta con default: {default}")
            config[key] = default
            try:
                with open(CONFIG_FILE, "w") as f:
                    json.dump(config, f, indent=4)
            except Exception as e:
                print(f"Errore nel salvataggio del file di configurazione: {e}")

        value = config[key]

        # Prova a convertire il valore nel tipo richiesto
        try:
            return cast_type(value)
        except (ValueError, TypeError) as e:
            print(f"Impossibile convertire '{value}' in {cast_type.__name__}, ritorno default: {default}")
            return default
        

    def set_config_param(self, key, value):
        config = {}
        try:
            if os.path.exists(CONFIG_FILE):
                with open(CONFIG_FILE, "r") as f:
                    config = json.load(f)
        except Exception as e:
            print(f"Errore nel caricamento della configurazione esistente: {e}")

        config[key] = value
        try:
            with open(CONFIG_FILE, "w") as f:
                json.dump(config, f, indent=4)
        except Exception as e:
            print(f"Errore nel salvataggio della configurazione: {e}")


    def get_all_config(self):
        config = {}
        if os.path.exists(CONFIG_FILE):
            try:
                with open(CONFIG_FILE, "r") as f:
                    config = json.load(f)
            except Exception as e:
                print(f"Errore nella lettura del file di configurazione: {e}")
        else:
            print("File di configurazione non trovato.")
        return config
