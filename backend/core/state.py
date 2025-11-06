from backend.dryer.controller import DryerController
from backend.network.controller import NetworkController
from backend.update.controller import UpdateController
from backend.core.config.file_config import FileConfig
from backend.core.config.system_config import SystemConfig

config = FileConfig()

controllers = {
    "config": FileConfig(),
    "dryer": DryerController(config),
    "network": NetworkController(),
    "update": UpdateController("."),
    "system": SystemConfig(),
}
