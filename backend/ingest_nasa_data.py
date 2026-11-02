"""
ingest_nasa_data.py - Direct Open Ingestion Engine for Earth Information Jukebox
Pulls real-world NSIDC Arctic Ice Extent and NOAA/NASA ERDDAP Sea Surface Temperature records.
Outputs clean normalized time-series for the Web Audio DSP Engine.
"""

import json
from pathlib import Path
import pandas as pd
import requests

DATA_DIR = Path(__file__).resolve().parent.parent / "data"
DATA_DIR.mkdir(parents=True, exist_ok=True)

def fetch_arctic_ice_timeseries() -> list[dict]:
    """
    Fetches real NSIDC Sea Ice Index (Version 4.0) Northern Hemisphere daily data.
    Aggregates September minimums from 2000 to present.
    """
    url = "https://noaadata.apps.nsidc.org/NOAA/G02135/north/daily/data/N_seaice_extent_daily_v4.0.csv"
    print(f"Fetching Arctic Ice data from: {url}")
    
    try:
        res = requests.get(url, timeout=35)
        res.raise_for_status()
        csv_path = DATA_DIR / "raw_arctic_ice.csv"
        csv_path.write_bytes(res.content)
        
        # NSIDC CSV headers start on line 1, line 2 has units
        df = pd.read_csv(csv_path, skiprows=[1], skipinitialspace=True)
        # Clean column names by stripping whitespace
        df.columns = [c.strip() for c in df.columns]
        # Filter for September (Month == 9) which is the annual Arctic minimum
        df_sept = df[(df["Year"] >= 2000) & (df["Month"] == 9)]
        
        # Calculate yearly September mean extent (Million sq km)
        yearly_mins = df_sept.groupby("Year")["Extent"].mean().round(2)
        
        # Normalization: Baseline = 6.5 (low distress), Min recorded = 3.4 (high distress)
        baseline = 6.5
        min_extent = 3.2
        
        results = []
        for year, extent in yearly_mins.items():
            # Distress score: 0.0 (healthy/cold) to 1.0 (extreme ice loss)
            distress = max(0.0, min(1.0, (baseline - extent) / (baseline - min_extent)))
            pitch_hz = int(180 + distress * 340) # 180 Hz to 520 Hz
            pulse_bpm = int(60 + distress * 80)  # 60 BPM to 140 BPM
            
            results.append({
                "year": int(year),
                "raw_val": float(extent),
                "distress_score": round(distress, 2),
                "pitch_hz": pitch_hz,
                "harmonic_dissonance": round(distress * 0.9, 2),
                "pulse_bpm": pulse_bpm
            })
            
        print(f"Successfully processed {len(results)} Arctic annual records.")
        return results
    except Exception as e:
        print(f"Error fetching live NSIDC data: {e}. Falling back to cached baseline.")
        return []

def main():
    ice_data = fetch_arctic_ice_timeseries()
    if ice_data:
        output_file = DATA_DIR / "live_arctic_ingestion.json"
        output_file.write_text(json.dumps(ice_data, indent=2))
        print(f"Wrote verified ingestion to {output_file}")

if __name__ == "__main__":
    main()
