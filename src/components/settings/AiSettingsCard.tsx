import { useState } from 'react';
import { KeyRound } from 'lucide-react';
import { AI_PROVIDERS, providerPreset, useAiSettingsStore } from '@/store/aiSettingsStore';
import type { AiProviderId } from '@/core/coach/types';
import { Card } from '@/ui/Card';
import { Toggle } from '@/ui/Toggle';
import { useT } from '@/i18n';

const CUSTOM = '__custom';

// Lets the user bring their own AI key. Stored locally and sent only to our
// backend endpoint (see server/), never bundled into the client build.
export function AiSettingsCard() {
  const t = useT();
  const { provider, model, visionModel, apiKey, baseUrl, configured, enabled, update } =
    useAiSettingsStore();
  const [reveal, setReveal] = useState(false);
  const preset = providerPreset(provider);

  function onProviderChange(next: AiProviderId) {
    const p = providerPreset(next);
    update({ provider: next, model: p.defaultModel, visionModel: p.defaultVisionModel });
  }

  return (
    <Card className="space-y-5">
      <div className="flex items-center gap-2">
        <KeyRound size={18} className="text-accent-text" />
        <h2 className="font-semibold">{t('ai.title')}</h2>
        <span
          className={`ml-auto rounded-full px-2.5 py-0.5 text-xs font-semibold ${
            enabled && configured
              ? 'bg-accent-soft text-accent-soft-fg'
              : 'bg-surface-3 text-fg-muted'
          }`}
        >
          {!enabled ? 'Off' : configured ? 'Key set' : 'Not configured'}
        </span>
      </div>

      <Toggle
        checked={enabled}
        onChange={(v) => update({ enabled: v })}
        label={t('ai.enable')}
        hint={t('ai.enableHint')}
      />

      {enabled && (
        <>
          <label className="flex flex-col gap-2">
            <span className="text-sm font-medium">{t('ai.provider')}</span>
            <select
          value={provider}
          onChange={(e) => onProviderChange(e.target.value as AiProviderId)}
          className="select"
        >
          {AI_PROVIDERS.map((p) => (
            <option key={p.id} value={p.id}>
              {p.label}
            </option>
          ))}
        </select>
      </label>

      <label className="flex flex-col gap-2">
        <span className="text-sm font-medium">{t('ai.model')}</span>
        <ModelPicker
          key={`${provider}-text`}
          value={model}
          options={preset.textModels}
          placeholder="openai/gpt-oss-120b"
          onChange={(v) => update({ model: v })}
        />
      </label>

      <label className="flex flex-col gap-2">
        <span className="text-sm font-medium">{t('ai.visionModel')}</span>
        <ModelPicker
          key={`${provider}-vision`}
          value={visionModel}
          options={preset.visionModels}
          placeholder="meta/llama-3.2-90b-vision-instruct"
          onChange={(v) => update({ visionModel: v })}
        />
        <span className="text-xs text-fg-muted">
          {t('ai.visionHint')}
        </span>
      </label>

      <label className="flex flex-col gap-2">
        <span className="text-sm font-medium">{t('ai.apiKey')}</span>
        <div className="flex gap-2">
          <input
            value={apiKey}
            onChange={(e) => update({ apiKey: e.target.value })}
            type={reveal ? 'text' : 'password'}
            autoComplete="off"
            spellCheck={false}
            className="select flex-1"
            placeholder="nvapi-…"
          />
          <button
            type="button"
            onClick={() => setReveal((r) => !r)}
            className="rounded-control border border-edge px-3 text-sm font-medium"
          >
            {t(reveal ? 'ai.hide' : 'ai.show')}
          </button>
        </div>
        <span className="text-xs text-fg-muted">
          {t('ai.keyHint')}
        </span>
      </label>

      <label className="flex flex-col gap-2">
        <span className="text-sm font-medium">{t('ai.baseUrl')}</span>
        <input
          value={baseUrl ?? ''}
          onChange={(e) => update({ baseUrl: e.target.value })}
          spellCheck={false}
          className="select"
          placeholder={t('ai.providerDefault')}
        />
      </label>
        </>
      )}
    </Card>
  );
}

// Dropdown of curated model ids with a "Custom…" escape hatch for any other id.
function ModelPicker({
  value,
  options,
  placeholder,
  onChange,
}: {
  value: string;
  options: string[];
  placeholder: string;
  onChange: (next: string) => void;
}) {
  const [custom, setCustom] = useState(value.length > 0 && !options.includes(value));

  return (
    <>
      <select
        value={custom ? CUSTOM : value}
        onChange={(e) => {
          if (e.target.value === CUSTOM) {
            setCustom(true);
          } else {
            setCustom(false);
            onChange(e.target.value);
          }
        }}
        className="select"
      >
        {options.map((m) => (
          <option key={m} value={m}>
            {m}
          </option>
        ))}
        <option value={CUSTOM}>Custom…</option>
      </select>
      {custom && (
        <input
          value={value}
          onChange={(e) => onChange(e.target.value)}
          spellCheck={false}
          className="select"
          placeholder={placeholder}
        />
      )}
    </>
  );
}
