import type { SpeakOptions, Tts } from '../ports';
import { Lang } from '@/core/constants';

const LOCALE: Record<Lang, string> = {
  [Lang.En]: 'en-US',
  [Lang.Hi]: 'hi-IN',
  [Lang.Mr]: 'mr-IN',
  [Lang.Bn]: 'bn-IN',
  [Lang.Ta]: 'ta-IN',
  [Lang.Gu]: 'gu-IN',
};

/** The two call shapes, normalised to one. */
function optionsFrom(langOrOptions?: Lang | SpeakOptions, onEnd?: () => void): SpeakOptions {
  if (typeof langOrOptions === 'object' && langOrOptions !== null) return langOrOptions;
  return { lang: langOrOptions, ...(onEnd ? { onEnd } : {}) };
}

// Text-to-speech via the Web Speech API. No-ops where unsupported.
export class BrowserTts implements Tts {
  available(): boolean {
    return typeof window !== 'undefined' && 'speechSynthesis' in window;
  }

  speaking(): boolean {
    return this.available() && window.speechSynthesis.speaking;
  }

  /**
   * Reads `text` aloud. A dictation passes a rate, which is why this takes an
   * options object as well as the plain `(text, lang)` form the rest of the app
   * uses — the older shape is kept so no call site had to change.
   */
  speak(text: string, langOrOptions?: Lang | SpeakOptions, onEnd?: () => void): void {
    if (!this.available() || !text.trim()) return;
    const { lang = Lang.En, rate, onEnd: end, onError } = optionsFrom(langOrOptions, onEnd);
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = LOCALE[lang];
    if (rate !== undefined) utterance.rate = rate;
    utterance.onend = () => end?.();
    // A failed utterance must still release whatever was waiting on it, or a
    // dictation queue stalls on a chunk the voice could not say.
    utterance.onerror = () => {
      onError?.();
      end?.();
    };
    window.speechSynthesis.speak(utterance);
  }

  stop(): void {
    if (this.available()) window.speechSynthesis.cancel();
  }
}
