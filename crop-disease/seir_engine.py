import numpy as np
from datetime import datetime, timedelta

def calculate_farm_outbreak_risks(
    source_lat: float, 
    source_lon: float, 
    nearby_farms: list[dict], 
    wind_direction_deg: float, 
    wind_speed_kmh: float
) -> list[dict]:
    """
    Simulates a 96-hour SEIR spread projection for neighboring farms 
    factoring in distance decay and wind alignment.
    
    nearby_farms format:
    [{"farm_id": "F1", "lat": 28.5, "lon": 79.4, "crop": "Tomato", "distance_km": 3.2}, ...]
    """
    predictions = []
    
    # Convert wind direction to radians
    wind_rad = np.radians(wind_direction_deg)
    wind_vector = np.array([np.cos(wind_rad), np.sin(wind_rad)])
    
    for farm in nearby_farms:
        d_lat = farm["lat"] - source_lat
        d_lon = farm["lon"] - source_lon
        
        # Spatial vector to target farm
        farm_vector = np.array([d_lat, d_lon])
        norm = np.linalg.norm(farm_vector)
        
        if norm == 0:
            alignment = 1.0
        else:
            unit_farm = farm_vector / norm
            # Dot product measures wind alignment with the target farm (-1 to 1)
            alignment = float(np.dot(wind_vector, unit_farm))
            alignment = max(0.1, alignment) # Minimum baseline drift

        distance_km = farm.get("distance_km", max(0.5, norm * 111)) # approx degrees to km
        
        # Modified SEIR transmission formula with distance decay & wind velocity factor
        beta = 0.65 * (wind_speed_kmh / 10.0)  # Transmission rate coefficient
        decay_factor = 1.0 / (1.0 + 0.4 * (distance_km ** 1.5))
        
        # Probability calculation over 96 hours (4 days)
        infection_probability = 1.0 - np.exp(-beta * alignment * decay_factor * 4.0)
        infection_probability = min(0.98, max(0.02, infection_probability))
        
        target_time = datetime.now() + timedelta(hours=96)
        
        predictions.append({
            "farm_id": farm["farm_id"],
            "crop": farm.get("crop", "Tomato"),
            "distance_km": round(distance_km, 2),
            "infection_probability_96h": round(infection_probability * 100, 1),
            "projected_risk_window": target_time.strftime("%Y-%m-%d %H:%M"),
            "status": "HIGH RISK" if infection_probability > 0.6 else "MONITOR"
        })
        
    # Sort by highest infection risk probability
    predictions.sort(key=lambda x: x["infection_probability_96h"], reverse=True)
    return predictions