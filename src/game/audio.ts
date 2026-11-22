// Procedural Web Audio API synthesizer with strict DynamicsCompressor + 0.45 gain limiter

class RoyalAudioEngine {
  private ctx: AudioContext | null = null;
  private masterGain: GainNode | null = null;
  private muted = false;

  public isMuted(): boolean {
    return this.muted;
  }

  public setMuted(m: boolean): void {
    this.muted = m;
    if (this.masterGain && this.ctx) {
      this.masterGain.gain.setTargetAtTime(m ? 0 : 0.45, this.ctx.currentTime, 0.02);
    }
  }

  private ensureContext(): { ctx: AudioContext; out: AudioNode } | null {
    if (this.muted || typeof window === 'undefined') return null;
    const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!AudioCtx) return null;
    if (!this.ctx) {
      this.ctx = new AudioCtx();
      const compressor = this.ctx.createDynamicsCompressor();
      compressor.threshold.setValueAtTime(-16, this.ctx.currentTime);
      compressor.knee.setValueAtTime(18, this.ctx.currentTime);
      compressor.ratio.setValueAtTime(8, this.ctx.currentTime);
      compressor.attack.setValueAtTime(0.003, this.ctx.currentTime);
      compressor.release.setValueAtTime(0.15, this.ctx.currentTime);

      const gain = this.ctx.createGain();
      gain.gain.setValueAtTime(this.muted ? 0 : 0.45, this.ctx.currentTime); // Hard 45% limiter
      compressor.connect(gain);
      gain.connect(this.ctx.destination);
      this.masterGain = compressor as unknown as GainNode;
      // keep reference to actual gain for mute toggling
      this.masterGain = gain;
      this.compressorOut = compressor;
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }
    return this.compressorOut ? { ctx: this.ctx, out: this.compressorOut } : null;
  }

  private compressorOut: DynamicsCompressorNode | null = null;

  public playClick(): void {
    const audio = this.ensureContext();
    if (!audio) return;
    const { ctx, out } = audio;
    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const g = ctx.createGain();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(660, now);
    osc.frequency.exponentialRampToValueAtTime(340, now + 0.055);
    g.gain.setValueAtTime(0.14, now);
    g.gain.exponentialRampToValueAtTime(0.001, now + 0.06);
    osc.connect(g).connect(out);
    osc.start(now);
    osc.stop(now + 0.065);
  }

  /** Metallic triple sword clash ("clang-clang-clang") with sparkling overtones */
  public playSwordClash(): void {
    const audio = this.ensureContext();
    if (!audio) return;
    const { ctx, out } = audio;
    const offsets = [0, 0.11, 0.23];
    offsets.forEach((delay, idx) => {
      const t = ctx.currentTime + delay;
      const baseFreq = 920 + idx * 135;
      [1, 1.52, 2.38, 3.15].forEach((mult, i) => {
        const osc = ctx.createOscillator();
        const g = ctx.createGain();
        osc.type = i % 2 === 0 ? 'sawtooth' : 'triangle';
        osc.frequency.setValueAtTime(baseFreq * mult, t);
        osc.frequency.exponentialRampToValueAtTime(baseFreq * mult * 0.88, t + 0.16);
        g.gain.setValueAtTime(0.14 / (i + 1), t);
        g.gain.exponentialRampToValueAtTime(0.001, t + 0.17);
        osc.connect(g).connect(out);
        osc.start(t);
        osc.stop(t + 0.18);
      });
    });
  }

  public playAirlift(): void {
    const audio = this.ensureContext();
    if (!audio) return;
    const { ctx, out } = audio;
    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const g = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(140, now);
    osc.frequency.exponentialRampToValueAtTime(310, now + 0.32);
    g.gain.setValueAtTime(0.02, now);
    g.gain.linearRampToValueAtTime(0.16, now + 0.1);
    g.gain.exponentialRampToValueAtTime(0.001, now + 0.35);
    osc.connect(g).connect(out);
    osc.start(now);
    osc.stop(now + 0.36);
  }

  public playVictory(): void {
    const audio = this.ensureContext();
    if (!audio) return;
    const { ctx, out } = audio;
    const notes = [392, 493.88, 587.33, 783.99];
    notes.forEach((freq, i) => {
      const t = ctx.currentTime + i * 0.11;
      const osc = ctx.createOscillator();
      const g = ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, t);
      g.gain.setValueAtTime(0.18, t);
      g.gain.exponentialRampToValueAtTime(0.001, t + 0.42);
      osc.connect(g).connect(out);
      osc.start(t);
      osc.stop(t + 0.44);
    });
  }
}

export const royalAudio = new RoyalAudioEngine();
