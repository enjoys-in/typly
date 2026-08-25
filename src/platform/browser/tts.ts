import type { Tts } from '../ports';
import { Lang } from '@/core/constants';

const LOCALE: Record<Lang, string> = {
  [Lang.En]: 'en-US',
  [Lang.Hi]: 'hi-IN',
};

// Text-to-speech via the Web Speech API. No-ops where unsupported.
export class BrowserTts implements Tts {
  available(): boolean {
    return typeof window !== 'undefined' && 'speechSynthesis' in window;
  }

  speak(text: string, lang: Lang = Lang.En, onEnd?: () => void): void {
    if (!this.available() || !text.trim()) return;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = LOCALE[lang];
    utterance.onend = () => onEnd?.();
    utterance.onerror = () => onEnd?.();
    window.speechSynthesis.speak(utterance);
  }

  stop(): void {
    if (this.available()) window.speechSynthesis.cancel();
  }
}
