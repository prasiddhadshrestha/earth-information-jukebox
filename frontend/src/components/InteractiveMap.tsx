import React from 'react';

export interface HotspotRegion {
  id: string;
  name: string;
  coordinates: { lat: number; lng: number };
  indicator: string;
  latest_distress: number;
}

interface InteractiveMapProps {
  regions: HotspotRegion[];
  selectedRegionId: string;
  onSelectRegion: (id: string) => void;
  distressScore: number;
}

export const InteractiveMap: React.FC<InteractiveMapProps> = ({
  regions,
  selectedRegionId,
  onSelectRegion,
  distressScore
}) => {
  // SVG projection approximate Mercator coordinates
  const project = (lat: number, lng: number) => {
    const x = ((lng + 180) / 360) * 800;
    const y = ((90 - lat) / 180) * 450;
    return { x, y };
  };

  return (
    <div className="relative w-full aspect-[16/9] max-h-[460px] bg-space-800 rounded-2xl border border-slate-800 overflow-hidden shadow-2xl flex items-center justify-center">
      {/* Background World Map Vector Grid */}
      <svg
        viewBox="0 0 800 450"
        className="w-full h-full object-cover opacity-60 select-none"
      >
        <defs>
          <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
            <path d="M 40 0 L 0 0 0 40" fill="none" stroke="rgba(255, 255, 255, 0.05)" strokeWidth="1" />
          </pattern>
          <radialGradient id="oceanGlow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#0b3d91" stopOpacity="0.3" />
            <stop offset="100%" stopColor="#05070f" stopOpacity="0.8" />
          </radialGradient>
        </defs>

        <rect width="800" height="450" fill="url(#oceanGlow)" />
        <rect width="800" height="450" fill="url(#grid)" />

        {/* Continental Silhouettes (Simplified SVG Paths) */}
        <path
          d="M 120,80 Q 200,60 260,110 T 210,180 T 140,160 Z"
          fill="rgba(255, 255, 255, 0.08)"
          stroke="rgba(255, 255, 255, 0.15)"
        />
        <path
          d="M 230,220 Q 300,240 270,360 T 210,310 Z"
          fill="rgba(255, 255, 255, 0.08)"
          stroke="rgba(255, 255, 255, 0.15)"
        />
        <path
          d="M 420,90 Q 560,70 650,130 T 580,240 T 430,170 Z"
          fill="rgba(255, 255, 255, 0.08)"
          stroke="rgba(255, 255, 255, 0.15)"
        />
        <path
          d="M 440,200 Q 500,220 480,330 T 420,290 Z"
          fill="rgba(255, 255, 255, 0.08)"
          stroke="rgba(255, 255, 255, 0.15)"
        />
        <path
          d="M 640,290 Q 720,280 730,360 T 630,350 Z"
          fill="rgba(255, 255, 255, 0.08)"
          stroke="rgba(255, 255, 255, 0.15)"
        />

        {/* Hotspot Markers */}
        {regions.map((reg) => {
          const { x, y } = project(reg.coordinates.lat, reg.coordinates.lng);
          const isSelected = reg.id === selectedRegionId;
          const score = isSelected ? distressScore : reg.latest_distress;
          const glowColor = score > 0.6 ? '#fc3d21' : '#00e5ff';

          return (
            <g
              key={reg.id}
              onClick={() => onSelectRegion(reg.id)}
              className="cursor-pointer group"
            >
              {/* Pulsing Target Ring */}
              <circle
                cx={x}
                cy={y}
                r={isSelected ? 18 : 10}
                fill="none"
                stroke={glowColor}
                strokeWidth={isSelected ? 2.5 : 1.5}
                className={isSelected ? "animate-ping opacity-75" : "group-hover:opacity-100 opacity-60"}
              />
              {/* Inner Core */}
              <circle
                cx={x}
                cy={y}
                r={isSelected ? 7 : 5}
                fill={glowColor}
                className="drop-shadow-lg"
              />
              {/* Tag Label */}
              <text
                x={x + 12}
                y={y + 4}
                fill={isSelected ? '#ffffff' : '#94a3b8'}
                fontSize="11"
                fontFamily="monospace"
                fontWeight={isSelected ? 'bold' : 'normal'}
                className="select-none pointer-events-none drop-shadow"
              >
                {reg.name.toUpperCase()}
              </text>
            </g>
          );
        })}
      </svg>

      {/* Top Left Telemetry HUD Badge */}
      <div className="absolute top-4 left-4 bg-space-900/90 border border-slate-800 rounded-lg px-3 py-2 text-xs font-mono backdrop-blur-md">
        <div className="text-slate-400">PLANETARY HARMONIC RADAR</div>
        <div className="text-nasa-cyan font-bold">NASA-EIC DUAL TELEMETRY ACTIVE</div>
      </div>
    </div>
  );
};
