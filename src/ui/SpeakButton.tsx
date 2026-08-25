import { useEffect, useState } from 'react';
import { Volume2, VolumeX } from 'lucide-react';
import { usePlatform } from '@/platform/PlatformContext';
import type { Lang } from '@/core/constants';

// Toggle button that reads `text` aloud via the TTS port; hidden when unsupported.
export function SpeakButton({
  text,
  lang,
  label = 'Read aloud',
  className = '',
}: {
  text: string;
  lang?: Lang;
  label?: string;
  className?: string;
}) {
  const platform = usePlatform();
  const [speaking, setSpeaking] = useState(false);

  useEffect(() => () => platform.tts.stop(), [platform]);

  if (!platform.tts.available()) return null;

  function toggle() {
    if (speaking) {
      platform.tts.stop();
      setSpeaking(false);
      return;
    }
    setSpeaking(true);
    platform.tts.speak(text, lang, () => setSpeaking(false));
  }

  return (
    <button
      type="button"
      onClick={toggle}
      title={speaking ? 'Stop' : label}
      className={`inline-flex items-center gap-1.5 rounded-control border border-line px-2.5 py-1.5 text-xs font-semibold text-fg-muted transition-colors hover:bg-surface-hover ${className}`}
    >
      {speaking ? <VolumeX size={14} /> : <Volume2 size={14} />}
      {speaking ? 'Stop' : label}
    </button>
  );
}
