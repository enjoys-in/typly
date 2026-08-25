// Shared contract for the AI typing coach. These types cross the network
// boundary (frontend builds `CoachInput`, backend returns `CoachFeedback`), so
// keep them free of framework/platform imports.

export interface CoachInput {
  netWpm: number;
  grossWpm: number;
  accuracy: number;
  errors: number;
  durationSec: number;
  passed: boolean;
  language: string; // human label, e.g. "English"
  exam: string; // human label, e.g. "SSC (CHSL/CGL)"
  focusChars: string[]; // most-missed characters
  weakWords: { word: string; count: number }[];
  categories: { label: string; count: number }[];
}

export interface CoachFeedback {
  summary: string;
  mainWeakness: string;
  tips: string[];
  focusKeys: string[];
  exercise: string;
  goal: string;
}

/** Providers the generic backend factory knows how to build. */
export type AiProviderId = 'nvidia' | 'openai';

/** User-configurable AI settings (entered in the UI, sent to the backend). */
export interface AiSettings {
  provider: AiProviderId;
  /** Text model for the coach + AI grammar. */
  model: string;
  /** Multimodal model used to read text from uploaded images (OCR). */
  visionModel: string;
  /** Empty means "use the server-side fallback key" (e.g. NVIDIA_API_KEY). */
  apiKey: string;
  /** Optional base-URL override; the backend falls back to a per-provider default. */
  baseUrl?: string;
}
