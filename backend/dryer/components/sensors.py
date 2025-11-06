# backend/dryer/components/sensors.py
import random
import time
from datetime import datetime
from typing import Tuple

try:
    import board
    import adafruit_sht4x
    import spidev
    IS_RASPBERRY = True
except (ImportError, NotImplementedError):
    IS_RASPBERRY = False

from backend.dryer.utils import compute_absolute_humidity, compute_dew_point

class Sensors:
    def __init__(self, max6675_bus=0, max6675_device=0):
        # For Raspberry Pi, init SPI and SHT sensor; otherwise use simulation
        self.max6675_bus = max6675_bus
        self.max6675_device = max6675_device
        self.sht_available = False
        self.spi = None
        self._prev_temp = random.uniform(20, 30)
        self._prev_hum = random.uniform(30, 50)

        if IS_RASPBERRY:
            try:
                self.spi = spidev.SpiDev()
                self.spi.open(self.max6675_bus, self.max6675_device)
                self.spi.max_speed_hz = 5000000
                self.spi.mode = 0b00
            except Exception as e:
                print(f"[Sensors] SPI init failed: {e}")
                self.spi = None

            try:
                i2c = board.I2C()
                self.sht = adafruit_sht4x.SHT4x(i2c)
                self.sht.mode = adafruit_sht4x.Mode.NOHEAT_HIGHPRECISION
                self.sht_available = True
            except Exception as e:
                print(f"[Sensors] SHT init failed: {e}")
                self.sht_available = False

    def read_all(self) -> Tuple[datetime, float, float, float, float]:
        """
        Returns: (now, max6675_temp, abs_humidity, sht_temp, dew_point)
        On errors will raise exception.
        """
        now = datetime.now()
        if IS_RASPBERRY:
            # SHT
            if self.sht_available:
                sht40_temp, sht40_hum = self.sht.measurements
            else:
                sht40_temp, sht40_hum = 0.0, 0.0

            # absolute humidity & dew point
            ah = compute_absolute_humidity(sht40_temp, sht40_hum)
            dew = compute_dew_point(sht40_temp, sht40_hum)

            # MAX6675 via SPI (2 bytes)
            max6675_temp = 9999.0
            if self.spi:
                raw = self.spi.readbytes(2)
                if len(raw) == 2:
                    value = (raw[0] << 8) | raw[1]
                    if not value & 0x4:
                        max6675_temp = (value >> 3) * 0.25
            return now, max6675_temp, ah, sht40_temp, dew
        else:
            # simulation like original: random walk
            time.sleep(0)  # keep non-blocking here
            self._prev_temp += random.uniform(-0.5, 0.5)
            self._prev_temp = max(15, min(70, self._prev_temp))
            self._prev_hum += random.uniform(-1, 1)
            self._prev_hum = max(10, min(90, self._prev_hum))

            max6675_temp = self._prev_temp
            sht40_temp = self._prev_temp + random.uniform(-1, 1)
            ah = self._prev_hum
            dew = compute_dew_point(sht40_temp, (ah / 30.0) * 100.0)

            # random intermittent error (preserve original behavior probability)
            if random.random() < 0.5:
                raise OSError("Simulated sensor read error")
            return now, max6675_temp, ah, sht40_temp, dew
