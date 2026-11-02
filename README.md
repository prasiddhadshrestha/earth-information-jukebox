# The Earth Information Jukebox 🌍🎵
> **NASA Space Apps Challenge 2026: Multi-Sensory Earth Science Sonification Engine.**

## Team "First Person"
- **Prasiddha Das Shrestha:** Systems Architect, Data Normalization Pipelines & DSP Engine.
- **Aoi:** Frontend Architect, Interactive Map UI, Dynamic Canvas Waveform & UX Storytelling.

---

## ⚡ Git Collaboration & Branching Protocol

To ensure seamless pairing without merge conflicts:
1. `main`: Production-ready, deployed on Vercel. Only pull-requests with verified builds merge here.
2. `feat/frontend-map-ui` (Aoi's Branch): Map components, React timeline slider, HUD player console, and canvas audio visualizer.
3. `feat/audio-dsp-pipeline` (Pras's Branch): Python normalization pipelines, FastAPI endpoints, Web Audio synthesis transfer functions.

### Conventional Commit Standard
- `feat(map):` new map hotspot interaction
- `feat(audio):` pitch modulation transfer function
- `fix(ui):` canvas resizing fix
- `docs(rfc):` update architecture documentation

---

## 🏛️ System Architecture

```mermaid
flowchart TD
    subgraph DataPipeline ["Data & Normalization (Pras)"]
        NASA["NASA EIC & Earthdata (GeoTIFF / NetCDF)"] --> Slicer["Python Array Slicer (Xarray/NumPy)"]
        Slicer --> Normalizer["Vector Distress Scoring [0.0 - 1.0]"]
        Normalizer --> API["FastAPI / Static JSON API"]
    end

    subgraph Client ["Interactive Client (Aoi + Pras)"]
        API --> MapUI["React Leaflet / SVG Map (Aoi)"]
        MapUI --> Scrubber["20-Year Timeline Scrubber (Aoi)"]
        Scrubber --> AudioEngine["Web Audio DSP Synthesizer (Pras)"]
        AudioEngine --> CanvasVis["AnalyserNode Waveform Canvas (Aoi)"]
        AudioEngine --> Speakers["User Headphones / Stereo Sound"]
    end
```

---

## 🚀 Quickstart for Development

### 1. Frontend Setup
```bash
cd projects/earth_jukebox/frontend
# Install dependencies (React + Tailwind + Lucide)
npm install
npm run dev
```

### 2. Using Mock Data
The frontend can run 100% offline using `../data/mock_regions.json` while the backend data ingestion runs in parallel.
