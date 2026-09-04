import type { Sound, SoundCue } from '../ports';

const CUE: Record<SoundCue, { freq: number; dur: number; gain: number; spread?: number }> = {
  key: { freq: 660, dur: 0.05, gain: 0.06 },
  error: { freq: 180, dur: 0.12, gain: 0.06 },
  complete: { freq: 880, dur: 0.25, gain: 0.06 },
  // Quiet, lower, and pitched slightly differently every time, so a hall reads
  // as other people rather than as a metronome — and never loud enough to be
  // mistaken for the typist's own keystroke.
  hall: { freq: 420, dur: 0.035, gain: 0.012, spread: 220 },
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
    const { freq, dur, gain: level, spread = 0 } = CUE[cue];
    const osc = ac.createOscillator();
    const gain = ac.createGain();
    osc.type = 'sine';
    osc.frequency.value = freq + (spread ? Math.random() * spread : 0);
    gain.gain.setValueAtTime(level, ac.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.0001, ac.currentTime + dur);
    osc.connect(gain).connect(ac.destination);
    osc.start();
    osc.stop(ac.currentTime + dur);
  }

  vibrate(pattern: number[]): void {
    if (typeof navigator !== 'undefined' && 'vibrate' in navigator) navigator.vibrate(pattern);
  }
}
