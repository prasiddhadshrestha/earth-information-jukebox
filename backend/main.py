"""
main.py - FastAPI Backend for The Earth Information Jukebox
Serves normalized NASA telemetry, region metadata, and real-time DSP vector scoring.
"""

import json
from pathlib import Path
from typing import List, Optional
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field

app = FastAPI(
    title="The Earth Information Jukebox API",
    description="NASA Space Apps 2026: Multi-Sensory Earth Science Sonification Backend",
    version="1.0.0"
)

# Enable CORS for local React/Vite development and production origins
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

DATA_DIR = Path(__file__).resolve().parent.parent / "data"

class TimeSeriesPoint(BaseModel):
    year: int
    raw_val: float
    distress_score: float = Field(ge=0.0, le=1.0)
    pitch_hz: int
    harmonic_dissonance: float = Field(ge=0.0, le=1.0)
    pulse_bpm: int

class RegionCoordinates(BaseModel):
    lat: float
    lng: float

class RegionDetail(BaseModel):
    id: str
    name: str
    coordinates: RegionCoordinates
    indicator: str
    unit: str
    baseline_value: float
    time_series: List[TimeSeriesPoint]
    narrative: str

class RegionSummary(BaseModel):
    id: str
    name: str
    coordinates: RegionCoordinates
    indicator: str
    latest_distress: float

def load_dataset() -> dict:
    mock_file = DATA_DIR / "mock_regions.json"
    if not mock_file.exists():
        raise HTTPException(status_code=500, detail="Core data file mock_regions.json not found.")
    with open(mock_file, "r", encoding="utf-8") as f:
        data = json.load(f)
        
    # Check if live arctic ingestion exists and overlay it
    live_arctic = DATA_DIR / "live_arctic_ingestion.json"
    if live_arctic.exists():
        try:
            with open(live_arctic, "r", encoding="utf-8") as lf:
                live_points = json.load(lf)
                for reg in data.get("regions", []):
                    if reg["id"] == "arctic" and live_points:
                        reg["time_series"] = live_points
        except Exception:
            pass # Gracefully keep mock data on parse failure
            
    return data

@app.get("/")
def root():
    return {
        "status": "online",
        "project": "The Earth Information Jukebox",
        "docs_url": "/docs",
        "endpoints": ["/api/regions", "/api/region/{id}", "/api/sonify-vector"]
    }

@app.get("/api/regions", response_model=List[RegionSummary])
def get_regions():
    """Returns high-level summary of all active climate hotspot regions."""
    data = load_dataset()
    summaries = []
    for reg in data.get("regions", []):
        ts = reg.get("time_series", [])
        latest_distress = ts[-1]["distress_score"] if ts else 0.0
        summaries.append(
            RegionSummary(
                id=reg["id"],
                name=reg["name"],
                coordinates=reg["coordinates"],
                indicator=reg["indicator"],
                latest_distress=latest_distress
            )
        )
    return summaries

@app.get("/api/region/{region_id}", response_model=RegionDetail)
def get_region_detail(region_id: str):
    """Returns complete 2000-2026 telemetry time-series and narrative for a specific region."""
    data = load_dataset()
    for reg in data.get("regions", []):
        if reg["id"].lower() == region_id.lower():
            return reg
    raise HTTPException(status_code=404, detail=f"Region '{region_id}' not found.")

@app.get("/api/sonify-vector")
def calculate_dynamic_vector(
    region_id: str,
    year: int
):
    """
    Returns exact real-time DSP parameters for a given region and year.
    Used by the frontend timeline scrubber to modulate browser audio in real-time.
    """
    data = load_dataset()
    target_reg = None
    for reg in data.get("regions", []):
        if reg["id"].lower() == region_id.lower():
            target_reg = reg
            break
            
    if not target_reg:
        raise HTTPException(status_code=404, detail=f"Region '{region_id}' not found.")
        
    ts = target_reg.get("time_series", [])
    if not ts:
        raise HTTPException(status_code=500, detail="No time series points available.")
        
    # Find exact or closest year
    closest_point = min(ts, key=lambda p: abs(p["year"] - year))
    
    return {
        "region_id": region_id,
        "region_name": target_reg["name"],
        "requested_year": year,
        "matched_year": closest_point["year"],
        "raw_value": closest_point["raw_val"],
        "unit": target_reg["unit"],
        "dsp_parameters": {
            "pitch_hz": closest_point["pitch_hz"],
            "dissonance_ratio": closest_point["harmonic_dissonance"],
            "pulse_bpm": closest_point["pulse_bpm"],
            "distress_score": closest_point["distress_score"],
            "filter_cutoff_hz": int(300 + closest_point["distress_score"] * 3200)
        },
        "narrative": target_reg["narrative"]
    }
