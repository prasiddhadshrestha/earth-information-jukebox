/**
 * AudioEngine.ts - Web Audio API Synthesis Engine for Earth Information Jukebox
 * Native browser DSP: Zero external heavyweight audio dependencies.
 */

export interface ClimateAudioState {
  pitchHz: number;
  dissonance: number; // 0.0 (pure consonance) to 1.0 (harsh tritone/minor 2nd)
  pulseBpm: number;
  distressScore: number;
}

export class EarthAudioEngine {
  private ctx: AudioContext | null = null;
  private primaryOsc: OscillatorNode | null = null;
  private secondaryOsc: OscillatorNode | null = null;
  private filterNode: BiquadFilterNode | null = null;
  private masterGain: GainNode | null = null;
  private analyser: AnalyserNode | null = null;
  private isPlaying: boolean = false;

  public init(): void {
    if (this.ctx) return;
    const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    this.ctx = new AudioContextClass();

    this.analyser = this.ctx.createAnalyser();
    this.analyser.fftSize = 256;

    this.filterNode = this.ctx.createBiquadFilter();
    this.filterNode.type = 'lowpass';
    this.filterNode.frequency.setValueAtTime(450, this.ctx.currentTime);
    this.filterNode.Q.setValueAtTime(3.0, this.ctx.currentTime);

    this.masterGain = this.ctx.createGain();
    this.masterGain.gain.setValueAtTime(0.0, this.ctx.currentTime);

    this.filterNode.connect(this.masterGain);
    this.masterGain.connect(this.analyser);
    this.analyser.connect(this.ctx.destination);
  }

  public start(): void {
    if (!this.ctx) this.init();
    if (!this.ctx) return;

    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }

    if (this.isPlaying) return;

    const t = this.ctx.currentTime;

    // Primary Oscillator: Warm root tone
    this.primaryOsc = this.ctx.createOscillator();
    this.primaryOsc.type = 'sine';
    this.primaryOsc.frequency.setValueAtTime(180, t);

    // Secondary Oscillator: Detuned overtone for harmonic dissonance
    this.secondaryOsc = this.ctx.createOscillator();
    this.secondaryOsc.type = 'triangle';
    this.secondaryOsc.frequency.setValueAtTime(180 * 1.5, t); // Perfect fifth baseline

    this.primaryOsc.connect(this.filterNode!);
    this.secondaryOsc.connect(this.filterNode!);

    this.primaryOsc.start(t);
    this.secondaryOsc.start(t);

    // Fade in
    this.masterGain!.gain.cancelScheduledValues(t);
    this.masterGain!.gain.linearRampToValueAtTime(0.35, t + 0.2);

    this.isPlaying = true;
  }

  public updateState(state: ClimateAudioState): void {
    if (!this.ctx || !this.isPlaying || !this.primaryOsc || !this.secondaryOsc || !this.filterNode) return;

    const t = this.ctx.currentTime;
    const rampTime = 0.12;

    // 1. Fundamental Pitch
    this.primaryOsc.frequency.cancelScheduledValues(t);
    this.primaryOsc.frequency.linearRampToValueAtTime(state.pitchHz, t + rampTime);

    // 2. Harmonic Detuning: Consonant Fifth (1.5x) morphs into Dissonant Tritone (1.414x) or Minor Second (1.059x)
    const ratio = state.dissonance > 0.6 ? 1.059 : (1.5 - state.dissonance * 0.086);
    this.secondaryOsc.frequency.cancelScheduledValues(t);
    this.secondaryOsc.frequency.linearRampToValueAtTime(state.pitchHz * ratio, t + rampTime);

    // 3. Filter Sweeps: Opens up high-frequency static as distress increases
    const cutoff = 300 + state.distressScore * 3200;
    this.filterNode.frequency.cancelScheduledValues(t);
    this.filterNode.frequency.linearRampToValueAtTime(cutoff, t + rampTime);
  }

  public stop(): void {
    if (!this.ctx || !this.isPlaying) return;
    const t = this.ctx.currentTime;
    this.masterGain!.gain.cancelScheduledValues(t);
    this.masterGain!.gain.linearRampToValueAtTime(0.0, t + 0.15);

    setTimeout(() => {
      this.primaryOsc?.stop();
      this.secondaryOsc?.stop();
      this.primaryOsc?.disconnect();
      this.secondaryOsc?.disconnect();
      this.isPlaying = false;
    }, 160);
  }

  public getAnalyserData(dataArray: Uint8Array): void {
    if (this.analyser) {
      // Cast dataArray to any to satisfy TS compiler across Web Audio ArrayBuffer definitions
      (this.analyser as any).getByteFrequencyData(dataArray);
    }
  }
}
