import type { Sound, SoundCue } from '../ports';

const CUE: Record<SoundCue, { freq: number; dur: number }> = {
  key: { freq: 660, dur: 0.05 },
  error: { freq: 180, dur: 0.12 },
  complete: { freq: 880, dur: 0.25 },
};

// Lightweight WebAudio blips — no assets to bundle. No-ops where unsupported.
export class BrowserSound implements Sound {
  private ctx: AudioContext | null = null;

  available(): boolean {
    return typeof window !== 'undefined' && 'AudioContext' in window;
  }

  private context(): AudioContext | null {
    if (!this.available()) return null;
    if (!this.ctx) this.ctx = new AudioContext();
    if (this.ctx.state === 'suspended') void this.ctx.resume();
    return this.ctx;
  }

  play(cue: SoundCue): void {
    const ac = this.context();
    if (!ac) return;
    const { freq, dur } = CUE[cue];
    const osc = ac.createOscillator();
    const gain = ac.createGain();
    osc.type = 'sine';
    osc.frequency.value = freq;
    gain.gain.setValueAtTime(0.06, ac.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.0001, ac.currentTime + dur);
    osc.connect(gain).connect(ac.destination);
    osc.start();
    osc.stop(ac.currentTime + dur);
  }

  vibrate(pattern: number[]): void {
    if (typeof navigator !== 'undefined' && 'vibrate' in navigator) navigator.vibrate(pattern);
  }
}
