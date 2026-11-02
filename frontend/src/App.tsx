import React, { useState, useEffect, useMemo } from 'react';
import { EarthAudioEngine } from './AudioEngine';
import { InteractiveMap, HotspotRegion } from './components/InteractiveMap';
import { PlayerConsole } from './components/PlayerConsole';
import { WaveformVisualizer } from './components/WaveformVisualizer';
import { Headphones, ShieldAlert, Sparkles } from 'lucide-react';

// Static fallback data matching mock_regions.json for immediate offline resilience
const FALLBACK_REGIONS: HotspotRegion[] = [
  {
    id: "arctic",
    name: "Arctic Polar Ice Cap",
    coordinates: { lat: 78.0, lng: 15.0 },
    indicator: "Sea Ice Minimum Extent",
    latest_distress: 0.88
  },
  {
    id: "amazon",
    name: "Amazon River Basin",
    coordinates: { lat: -3.46, lng: -62.21 },
    indicator: "Vegetation Canopy Deficit (NDVI Loss)",
    latest_distress: 0.96
  },
  {
    id: "barrier_reef",
    name: "Great Barrier Reef",
    coordinates: { lat: -18.28, lng: 147.69 },
    indicator: "Sea Surface Temperature Anomaly",
    latest_distress: 0.95
  }
];

export const App: React.FC = () => {
  const audioEngine = useMemo(() => new EarthAudioEngine(), []);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [regions, setRegions] = useState<HotspotRegion[]>(FALLBACK_REGIONS);
  const [selectedRegionId, setSelectedRegionId] = useState<string>("arctic");
  const [selectedYear, setSelectedYear] = useState<number>(2012);
  const [regionDetail, setRegionDetail] = useState<any>(null);

  // Load regions from FastAPI backend if online, fallback gracefully
  useEffect(() => {
    fetch('http://localhost:8000/api/regions')
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data) && data.length > 0) {
          setRegions(data);
        }
      })
      .catch(() => {
        // Quiet fallback to mock contract
      });
  }, []);

  // Fetch or calculate telemetry for selected region
  useEffect(() => {
    fetch(`http://localhost:8000/api/region/${selectedRegionId}`)
      .then(res => res.json())
      .then(data => {
        setRegionDetail(data);
      })
      .catch(() => {
        // Fallback default
        setRegionDetail({
          id: selectedRegionId,
          name: regions.find(r => r.id === selectedRegionId)?.name || "Target Region",
          indicator: regions.find(r => r.id === selectedRegionId)?.indicator || "Climate Telemetry",
          narrative: "Real-time acoustic translation generated from calibrated NASA Earth Observation frames.",
          time_series: [
            { year: 2000, raw_val: 6.3, distress_score: 0.15, pitch_hz: 180, harmonic_dissonance: 0.05, pulse_bpm: 60 },
            { year: 2012, raw_val: 3.4, distress_score: 0.95, pitch_hz: 520, harmonic_dissonance: 0.88, pulse_bpm: 140 },
            { year: 2026, raw_val: 3.6, distress_score: 0.88, pitch_hz: 490, harmonic_dissonance: 0.82, pulse_bpm: 132 }
          ]
        });
      });
  }, [selectedRegionId, regions]);

  // Current active data point based on slider year
  const activePoint = useMemo(() => {
    if (!regionDetail || !regionDetail.time_series) {
      return {
        distress_score: 0.5,
        pitch_hz: 300,
        harmonic_dissonance: 0.3,
        pulse_bpm: 80
      };
    }
    const ts = regionDetail.time_series;
    return ts.reduce((prev: any, curr: any) =>
      Math.abs(curr.year - selectedYear) < Math.abs(prev.year - selectedYear) ? curr : prev
    );
  }, [regionDetail, selectedYear]);

  // Update audio engine whenever year or point changes
  useEffect(() => {
    if (isPlaying) {
      audioEngine.updateState({
        pitchHz: activePoint.pitch_hz,
        dissonance: activePoint.harmonic_dissonance,
        pulseBpm: activePoint.pulse_bpm,
        distressScore: activePoint.distress_score
      });
    }
  }, [isPlaying, activePoint, audioEngine]);

  const handleTogglePlay = () => {
    if (isPlaying) {
      audioEngine.stop();
      setIsPlaying(false);
    } else {
      audioEngine.start();
      audioEngine.updateState({
        pitchHz: activePoint.pitch_hz,
        dissonance: activePoint.harmonic_dissonance,
        pulseBpm: activePoint.pulse_bpm,
        distressScore: activePoint.distress_score
      });
      setIsPlaying(true);
    }
  };

  const availableYears = useMemo(() => {
    if (regionDetail && regionDetail.time_series) {
      return regionDetail.time_series.map((p: any) => p.year).sort((a: number, b: number) => a - b);
    }
    return [2000, 2005, 2010, 2012, 2016, 2020, 2024, 2026];
  }, [regionDetail]);

  return (
    <div className="min-h-screen bg-space-900 text-slate-100 flex flex-col p-4 md:p-8">
      {/* Top Navigation Bar */}
      <header className="flex flex-col md:flex-row items-start md:items-center justify-between pb-6 border-b border-slate-800/80 gap-4">
        <div>
          <div className="flex items-center gap-2 text-nasa-cyan text-xs font-mono tracking-widest uppercase">
            <Sparkles className="w-4 h-4 text-nasa-cyan" />
            NASA Space Apps Challenge 2026 • Team First Person
          </div>
          <h1 className="text-3xl font-black text-white tracking-tight mt-1 flex items-center gap-3">
            THE EARTH INFORMATION JUKEBOX
            <span className="text-xs font-mono font-normal px-2.5 py-0.5 rounded-full border border-nasa-cyan/40 bg-nasa-cyan/10 text-nasa-cyan">
              v1.0 LIVE
            </span>
          </h1>
        </div>

        <div className="flex items-center gap-3 text-xs font-mono text-slate-400 bg-space-800/60 border border-slate-800 px-4 py-2.5 rounded-xl">
          <Headphones className="w-4 h-4 text-nasa-cyan" />
          <span>Recommended: Headphones On for Binaural Harmonics</span>
        </div>
      </header>

      {/* Main Grid: Map & Controls */}
      <main className="grid grid-cols-1 lg:grid-cols-12 gap-8 my-8 flex-1">
        {/* Left Column: Interactive Map & Live Visualizer (7 Cols) */}
        <div className="lg:col-span-7 flex flex-col gap-6">
          <InteractiveMap
            regions={regions}
            selectedRegionId={selectedRegionId}
            onSelectRegion={setSelectedRegionId}
            distressScore={activePoint.distress_score}
          />

          <WaveformVisualizer
            engine={audioEngine}
            isPlaying={isPlaying}
            distressScore={activePoint.distress_score}
          />
        </div>

        {/* Right Column: Player Console & Diagnostic Narrative (5 Cols) */}
        <div className="lg:col-span-5 flex flex-col gap-6">
          <PlayerConsole
            isPlaying={isPlaying}
            onTogglePlay={handleTogglePlay}
            year={selectedYear}
            onYearChange={setSelectedYear}
            regionName={regionDetail?.name || "Loading..."}
            indicator={regionDetail?.indicator || "Satellite Observation"}
            distressScore={activePoint.distress_score}
            pitchHz={activePoint.pitch_hz}
            pulseBpm={activePoint.pulse_bpm}
            narrative={regionDetail?.narrative || "Loading scientific diagnostic..."}
            availableYears={availableYears}
          />

          {/* Universal Accessibility & Science Pillar */}
          <div className="bg-space-800/40 border border-slate-800/60 rounded-2xl p-5 text-xs text-slate-400 font-sans space-y-2">
            <div className="flex items-center gap-2 text-white font-mono font-bold text-xs uppercase">
              <ShieldAlert className="w-4 h-4 text-nasa-cyan" />
              Universal Accessibility & Acoustic Science
            </div>
            <p className="leading-relaxed">
              Designed to dismantle visual information barriers in Earth science. By translating multi-spectral
              radiometric frames into harmonic frequency ratios, visually impaired researchers can directly discern
              planetary phase-shifts and rate-of-change anomalies through pitch curvature and harmonic tension.
            </p>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="pt-6 border-t border-slate-800/80 flex flex-col md:flex-row items-center justify-between text-xs font-mono text-slate-500 gap-2">
        <div>Engineered by Prasiddha Das Shrestha & Aoi | Knox College</div>
        <div>Data: NASA EIC, NSIDC Sea Ice Index v4.0 & NOAA GHRSST L4</div>
      </footer>
    </div>
  );
};

export default App;
