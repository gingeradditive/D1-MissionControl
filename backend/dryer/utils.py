# backend/dryer/utils.py
import math

def compute_absolute_humidity(temp_c: float, rh_percent: float) -> float:
    # p_sat in hPa
    p_sat = 6.112 * math.exp((17.67 * temp_c) / (temp_c + 243.5))
    p_vapor = p_sat * (rh_percent / 100.0)
    ah = (2.1674 * p_vapor) / (273.15 + temp_c) * 1000
    return ah

def compute_dew_point(temp_c: float, rh_percent: float) -> float:
    a = 17.27
    b = 237.7
    if rh_percent <= 0 or temp_c < -100 or temp_c > 150:
        return 0.0
    try:
        alpha = ((a * temp_c) / (b + temp_c)) + math.log(rh_percent / 100.0)
        dew_point = (b * alpha) / (a - alpha)
        return dew_point
    except Exception:
        return 0.0
    