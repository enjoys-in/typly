import type { Lint } from 'harper.js';
import type { GrammarChecker } from '../ports';
import type { GrammarIssue } from '@/core/types';
import { GrammarMode, Lang, LANG_LABEL } from '@/core/constants';
import { useLanguageToolsStore } from '@/store/languageToolsStore';
import { currentAiSettings, isAiEnabled, useAiSettingsStore } from '@/store/aiSettingsStore';
import { callAi } from './aiTransport';
import { IpcChannel } from '@/core/ipc/channels';

type HarperLinter = {
  setup(): Promise<void>;
  lint(text: string): Promise<Lint[]>;
  dispose?(): Promise<void>;
};

// Grammar via Harper (Mode 1 · on-device WASM). Loaded lazily so the multi-MB
// binary is a separate chunk fetched only when grammar is first used. English only.
export class BrowserGrammarChecker implements GrammarChecker {
  private linter: HarperLinter | null = null;
  private loading: Promise<HarperLinter | null> | null = null;

  available(): boolean {
    return useLanguageToolsStore.getState().grammarMode !== GrammarMode.Off;
  }

  // Frees the loaded WASM linter so it (and its cache) can be reclaimed / re-fetched.
  dispose(): void {
    const linter = this.linter;
    this.linter = null;
    this.loading = null;
    void linter?.dispose?.();
  }

  private load(): Promise<HarperLinter | null> {
    if (this.linter) return Promise.resolve(this.linter);
    if (!this.loading) {
      this.loading = (async () => {
        try {
          const [{ WorkerLinter }, { binary }] = await Promise.all([
            import('harper.js'),
            import('harper.js/binary'),
          ]);
          const linter = new WorkerLinter({ binary });
          await linter.setup();
          this.linter = linter;
          return linter;
        } catch {
          this.loading = null;
          return null;
        }
      })();
    }
    return this.loading;
  }

  async check(text: string, lang: Lang): Promise<GrammarIssue[]> {
    if (text.trim().length === 0) return [];
    const mode = useLanguageToolsStore.getState().grammarMode;
    if (mode === GrammarMode.Off) return [];
    // AI mode runs only when AI is enabled; otherwise fall back to on-device Harper.
    if (mode === GrammarMode.Ai && isAiEnabled()) return checkGrammarViaAi(text, lang);
    return this.checkWithHarper(text, lang);
  }

  // Harper — on-device, English only.
  private async checkWithHarper(text: string, lang: Lang): Promise<GrammarIssue[]> {
    if (lang !== Lang.En) return [];
    const linter = await this.load();
    if (!linter) return [];
    const lints = await linter.lint(text);
    return lints.map((lint) => {
      const span = lint.span();
      const replacements = lint
        .suggestions()
        .map((s) => s.get_replacement_text())
        .filter((r) => r.length > 0);
      return {
        offset: span.start,
        length: span.end - span.start,
        message: lint.message(),
        replacements,
      };
    });
  }
}

// AI grammar (Mode 2) — English + Hindi, via the backend (IPC in Electron, HTTP on web).
async function checkGrammarViaAi(text: string, lang: Lang): Promise<GrammarIssue[]> {
  const settings = currentAiSettings(useAiSettingsStore.getState());
  const data = (await callAi(IpcChannel.AiGrammar, { text, lang: LANG_LABEL[lang], settings })) as {
    issues?: GrammarIssue[];
  };
  return data.issues ?? [];
}
