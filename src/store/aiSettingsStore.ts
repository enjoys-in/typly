import { create } from 'zustand';
import type { AiProviderId, AiSettings } from '@/core/coach/types';

// AI settings are user-provided (bring-your-own-key) and persist locally so the
// key isn't re-entered each session. The key is sent only to our own backend
// endpoint, never embedded in the built bundle.
const STORAGE_KEY = 'typly.ai.settings';

export interface AiProviderPreset {
  id: AiProviderId;
  label: string;
  defaultModel: string;
  defaultVisionModel: string;
  textModels: string[];
  visionModels: string[];
}

// Curated, known-good models per provider. NVIDIA NIM (build.nvidia.com) serves
// these free; users can still enter any other id via the "Custom…" option.
const NVIDIA_PRESET: AiProviderPreset = {
  id: 'nvidia',
  label: 'NVIDIA NIM',
  defaultModel: 'openai/gpt-oss-120b',
  defaultVisionModel: 'meta/llama-3.2-90b-vision-instruct',
  textModels: [
    'openai/gpt-oss-120b',
    'openai/gpt-oss-20b',
    'meta/llama-3.3-70b-instruct',
    'deepseek-ai/deepseek-r1',
    'nvidia/llama-3.1-nemotron-70b-instruct',
  ],
  visionModels: [
    'meta/llama-3.2-90b-vision-instruct',
    'meta/llama-3.2-11b-vision-instruct',
    'microsoft/phi-3.5-vision-instruct',
  ],
};

const OPENAI_PRESET: AiProviderPreset = {
  id: 'openai',
  label: 'OpenAI',
  defaultModel: 'gpt-4o-mini',
  defaultVisionModel: 'gpt-4o-mini',
  textModels: ['gpt-4o-mini', 'gpt-4o', 'gpt-4.1-mini'],
  visionModels: ['gpt-4o-mini', 'gpt-4o'],
};

export const AI_PROVIDERS: AiProviderPreset[] = [NVIDIA_PRESET, OPENAI_PRESET];

/** Preset (models + defaults) for a provider; falls back to the NVIDIA preset. */
export function providerPreset(id: AiProviderId): AiProviderPreset {
  return AI_PROVIDERS.find((p) => p.id === id) ?? NVIDIA_PRESET;
}

const DEFAULTS: AiSettings = {
  provider: 'nvidia',
  model: 'openai/gpt-oss-120b',
  visionModel: 'meta/llama-3.2-90b-vision-instruct',
  apiKey: '',
  baseUrl: '',
};

type StoredSettings = AiSettings & { enabled: boolean };

function load(): StoredSettings {
  const base: StoredSettings = { ...DEFAULTS, enabled: true };
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return base;
    return { ...base, ...(JSON.parse(raw) as Partial<StoredSettings>) };
  } catch {
    return base;
  }
}

function persist(settings: StoredSettings): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
  } catch {
    // Ignore quota/availability errors — settings simply won't persist.
  }
}

interface AiSettingsState extends AiSettings {
  enabled: boolean;
  configured: boolean;
  update: (patch: Partial<StoredSettings>) => void;
}

export const useAiSettingsStore = create<AiSettingsState>((set, get) => ({
  ...load(),
  configured: load().apiKey.trim().length > 0,
  update: (patch) => {
    const next: StoredSettings = {
      provider: patch.provider ?? get().provider,
      model: patch.model ?? get().model,
      visionModel: patch.visionModel ?? get().visionModel,
      apiKey: patch.apiKey ?? get().apiKey,
      baseUrl: patch.baseUrl ?? get().baseUrl,
      enabled: patch.enabled ?? get().enabled,
    };
    persist(next);
    set({ ...next, configured: next.apiKey.trim().length > 0 });
  },
}));

export function currentAiSettings(state: AiSettingsState): AiSettings {
  return {
    provider: state.provider,
    model: state.model,
    visionModel: state.visionModel,
    apiKey: state.apiKey,
    baseUrl: state.baseUrl,
  };
}

/** Master switch: when false the app uses only the built-in offline pipeline. */
export function isAiEnabled(): boolean {
  return useAiSettingsStore.getState().enabled;
}
