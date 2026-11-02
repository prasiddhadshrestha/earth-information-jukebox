import React from 'react';
import { Play, Square, Activity, Globe } from 'lucide-react';

interface PlayerConsoleProps {
  isPlaying: boolean;
  onTogglePlay: () => void;
  year: number;
  onYearChange: (newYear: number) => void;
  regionName: string;
  indicator: string;
  distressScore: number;
  pitchHz: number;
  pulseBpm: number;
  narrative: string;
  availableYears: number[];
}

export const PlayerConsole: React.FC<PlayerConsoleProps> = ({
  isPlaying,
  onTogglePlay,
  year,
  onYearChange,
  regionName,
  indicator,
  distressScore,
  pitchHz,
  pulseBpm,
  narrative,
  availableYears
}) => {
  const minYear = availableYears.length > 0 ? availableYears[0] : 2000;
  const maxYear = availableYears.length > 0 ? availableYears[availableYears.length - 1] : 2026;

  return (
    <div className="w-full bg-space-800/90 border border-slate-800 rounded-2xl p-6 backdrop-blur-xl shadow-2xl flex flex-col gap-6">
      {/* Top Header: Region Title & Telemetry Pillars */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800/80 pb-4">
        <div>
          <div className="flex items-center gap-2 text-nasa-cyan text-xs font-mono tracking-widest uppercase">
            <Globe className="w-3.5 h-3.5" />
            Selected Target Acoustic Zone
          </div>
          <h2 className="text-2xl font-bold text-white tracking-tight mt-0.5">{regionName}</h2>
          <div className="text-slate-400 text-xs mt-0.5 font-mono">{indicator}</div>
        </div>

        {/* Real-time DSP Readouts */}
        <div className="flex items-center gap-4 text-xs font-mono">
          <div className="bg-space-900/80 border border-slate-800 rounded-lg px-3 py-2 text-center">
            <div className="text-slate-400 text-[10px] uppercase">Base Pitch</div>
            <div className="text-nasa-cyan font-bold text-sm">{pitchHz} Hz</div>
          </div>
          <div className="bg-space-900/80 border border-slate-800 rounded-lg px-3 py-2 text-center">
            <div className="text-slate-400 text-[10px] uppercase">Heartbeat</div>
            <div className="text-amber-400 font-bold text-sm">{pulseBpm} BPM</div>
          </div>
          <div className="bg-space-900/80 border border-slate-800 rounded-lg px-3 py-2 text-center">
            <div className="text-slate-400 text-[10px] uppercase">Distress Anomaly</div>
            <div className={`font-bold text-sm ${distressScore > 0.6 ? 'text-nasa-red' : 'text-emerald-400'}`}>
              {(distressScore * 100).toFixed(0)}%
            </div>
          </div>
        </div>
      </div>

      {/* Middle Scrubber Controls */}
      <div className="flex flex-col gap-2">
        <div className="flex items-center justify-between text-xs font-mono text-slate-400">
          <span>TIMELINE SCRUBBER: {minYear}</span>
          <span className="text-nasa-cyan font-bold text-base px-2 py-0.5 bg-space-900 border border-slate-800 rounded">
            YEAR {year}
          </span>
          <span>{maxYear}</span>
        </div>

        <input
          type="range"
          min={minYear}
          max={maxYear}
          step={1}
          value={year}
          onChange={(e) => onYearChange(Number(e.target.value))}
          className="w-full h-2.5 bg-space-900 rounded-lg appearance-none cursor-pointer accent-nasa-cyan"
        />
      </div>

      {/* Narrative & Story Box */}
      <div className="bg-space-900/60 border border-slate-800/80 rounded-xl p-3 text-xs text-slate-300 leading-relaxed font-sans">
        <span className="text-nasa-cyan font-semibold mr-1.5 font-mono uppercase text-[10px]">Acoustic Diagnostic:</span>
        {narrative}
      </div>

      {/* Bottom Master Actions Bar */}
      <div className="flex items-center justify-between pt-2">
        <button
          onClick={onTogglePlay}
          className={`flex items-center gap-2 px-6 py-3 rounded-xl font-mono text-sm font-bold tracking-wide transition-all shadow-lg ${
            isPlaying
              ? 'bg-nasa-red text-white hover:bg-red-600 shadow-red-950/40'
              : 'bg-nasa-cyan text-space-900 hover:bg-cyan-300 shadow-cyan-950/40'
          }`}
        >
          {isPlaying ? (
            <>
              <Square className="w-4 h-4 fill-current" />
              MUTE SONIFICATION
            </>
          ) : (
            <>
              <Play className="w-4 h-4 fill-current" />
              PLAY REAL-TIME SONIFICATION
            </>
          )}
        </button>

        <div className="flex items-center gap-2 text-slate-500 text-xs font-mono">
          <Activity className="w-4 h-4 text-nasa-cyan" />
          <span>Web Audio API Dual Sine/Triangle Matrix Active</span>
        </div>
      </div>
    </div>
  );
};
