import { Layers, Play } from 'lucide-react';
import type { PaperSection } from '@/core/types';
import type { PaperTemplate } from '@/core/exam/paper';
import { PAPER_TEMPLATES } from '@/core/exam/paper';
import { LANG_LABEL } from '@/core/constants';
import { Button } from '@/ui/Button';
import { useT } from '@/i18n';

interface Props {
  /** The passage the current draft holds, used for the first section. */
  passage: string;
  /** Passages available for the other sections, by language. */
  passageFor: (section: PaperTemplate['sections'][number]) => string | null;
  onStart: (template: PaperTemplate, sections: PaperSection[]) => void;
}

/**
 * Multi-section mock papers.
 *
 * CPCT and several state exams test English *and* Hindi in one sitting, and the
 * candidate's real difficulty is the switch — the second section starts with
 * the wrong input method still in muscle memory. Practising the halves on
 * separate days never rehearses that, so a paper chains them into one run with
 * one combined report.
 *
 * A section with no passage in its language cannot run, so the paper is offered
 * only when every section can be filled.
 */
export function PaperPicker({ passage, passageFor, onStart }: Props) {
  const t = useT();

  return (
    <div className="space-y-3 rounded-panel border border-line p-4">
      <div className="flex items-start gap-2.5">
        <Layers size={16} className="mt-0.5 shrink-0 text-fg-subtle" />
        <div>
          <p className="text-sm font-semibold">{t('paper.title')}</p>
          <p className="mt-0.5 text-xs text-fg-muted">{t('paper.hint')}</p>
        </div>
      </div>

      <ul className="space-y-2">
        {PAPER_TEMPLATES.map((template) => {
          const sections = template.sections.map((spec, index) => ({
            title: spec.title,
            // The draft in hand fills the first section; the rest are matched
            // from the library by language.
            passage: index === 0 ? passage : (passageFor(spec) ?? ''),
            lang: spec.lang,
            durationSec: spec.durationSec,
            board: spec.board,
          }));
          const ready = sections.every((section) => section.passage.trim().length > 0);

          return (
            <li
              key={template.id}
              className="flex flex-wrap items-center justify-between gap-3 rounded-inner border border-line bg-surface-2 px-3 py-2.5"
            >
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold">{template.name}</p>
                <p className="truncate text-[11px] text-fg-muted">
                  {template.sections
                    .map((s) => `${LANG_LABEL[s.lang]} · ${s.durationSec / 60}m`)
                    .join('  →  ')}
                </p>
              </div>
              <Button
                size="sm"
                variant={ready ? 'primary' : 'secondary'}
                disabled={!ready}
                title={ready ? undefined : t('paper.needPassage')}
                onClick={() => onStart(template, sections)}
              >
                <Play size={14} /> {t(ready ? 'paper.start' : 'paper.missing')}
              </Button>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
