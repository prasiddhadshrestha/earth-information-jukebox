import React, { useEffect, useRef } from 'react';
import { EarthAudioEngine } from '../AudioEngine';

interface WaveformVisualizerProps {
  engine: EarthAudioEngine;
  isPlaying: boolean;
  distressScore: number;
}

export const WaveformVisualizer: React.FC<WaveformVisualizerProps> = ({ engine, isPlaying, distressScore }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;
    const dataArray = new Uint8Array(128);

    const render = () => {
      animId = requestAnimationFrame(render);
      const width = canvas.width;
      const height = canvas.height;

      ctx.clearRect(0, 0, width, height);

      if (!isPlaying) {
        // Idle ambient flatline
        ctx.beginPath();
        ctx.moveTo(0, height / 2);
        ctx.lineTo(width, height / 2);
        ctx.strokeStyle = 'rgba(0, 229, 255, 0.2)';
        ctx.lineWidth = 2;
        ctx.stroke();
        return;
      }

      engine.getAnalyserData(dataArray);

      // Color shifts from Cyan (healthy) to Neon Red (distress)
      const r = Math.floor(distressScore * 255);
      const g = Math.floor((1 - distressScore * 0.8) * 229);
      const b = Math.floor((1 - distressScore) * 255);

      ctx.beginPath();
      ctx.lineWidth = 2.5;
      ctx.strokeStyle = `rgb(${r}, ${g}, ${b})`;
      ctx.shadowBlur = 12;
      ctx.shadowColor = `rgb(${r}, ${g}, ${b})`;

      const sliceWidth = (width * 1.0) / dataArray.length;
      let x = 0;

      for (let i = 0; i < dataArray.length; i++) {
        const v = dataArray[i] / 128.0;
        const y = (v * height) / 2;

        if (i === 0) {
          ctx.moveTo(x, y);
        } else {
          ctx.lineTo(x, y);
        }
        x += sliceWidth;
      }

      ctx.lineTo(width, height / 2);
      ctx.stroke();
      ctx.shadowBlur = 0; // reset
    };

    render();

    return () => {
      cancelAnimationFrame(animId);
    };
  }, [engine, isPlaying, distressScore]);

  return (
    <div className="relative w-full h-24 bg-space-800/80 rounded-xl border border-slate-800 overflow-hidden backdrop-blur-md flex items-center justify-center p-2 shadow-inner">
      <div className="absolute top-2 left-3 text-[10px] uppercase tracking-wider font-mono text-slate-400">
        Live FFT Spectrum Analysis {isPlaying ? '• SYNTHESIZING' : '• STANDBY'}
      </div>
      <canvas
        ref={canvasRef}
        width={600}
        height={100}
        className="w-full h-full"
      />
    </div>
  );
};
