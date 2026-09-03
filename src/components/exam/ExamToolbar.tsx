import {
  Activity,
  Keyboard as KeyboardIcon,
  Maximize,
  Minimize,
  RotateCcw,
  SquareDot,
} from 'lucide-react';
import type { ExamConfig, ExamProfile, Series } from '@/core/types';
import { EXAM_MODE_LABEL, ExamMode } from '@/core/constants';
import { ToggleChip } from '@/ui/ToggleChip';
import { useT } from '@/i18n';
import { LayoutSwitcher, type ExamLayout } from './LayoutSwitcher';

interface Props {
  /** Exam-day mode: the view controls are put away for the run. */
  examDay?: boolean;
  config: ExamConfig;
  profile: ExamProfile;
  series: Series | null;
  /** Set when this run picked up an interrupted attempt. */
  resumed: boolean;
  layout: ExamLayout;
  onLayout: (layout: ExamLayout) => void;
  keyboardVisible: boolean;
  showKeyboard: boolean;
  onShowKeyboard: (v: boolean) => void;
  showKeys: boolean;
  onShowKeys: (v: boolean) => void;
  showStats: boolean;
  onShowStats: (v: boolean) => void;
  fullscreen: { supported: boolean; isFullscreen: boolean; toggle: () => void };
  timer: React.ReactNode;
}

const chip = 'rounded-full px-2.5 py-1 text-xs font-semibold';

/** The exam header: what is being run, the view toggles, and the clock. */
export function ExamToolbar({
  examDay = false,
  config,
  profile,
  series,
  resumed,
  layout,
  onLayout,
  keyboardVisible,
  showKeyboard,
  onShowKeyboard,
  showKeys,
  onShowKeys,
  showStats,
  onShowStats,
  fullscreen,
  timer,
}: Props) {
  const t = useT();
  const isSplit = layout === 'split';

  return (
    <div className="flex items-center justify-between">
      <div className="flex flex-wrap items-center gap-3">
        <h1 className="text-lg font-semibold">{profile.name}</h1>
        {series && (
          <span className={`${chip} bg-surface-3 text-fg-muted`}>
            {t('exam.testOf', { current: series.index + 1, total: series.items.length })}
          </span>
        )}
        {config.examMode !== ExamMode.Standard && (
          <span className={`${chip} bg-accent-soft text-accent-soft-fg`}>
            {EXAM_MODE_LABEL[config.examMode]}
          </span>
        )}
        {resumed && (
          <span
            className={`${chip} inline-flex items-center gap-1.5 bg-surface-3 text-fg-muted`}
            title="Restored from where you left off"
          >
            <RotateCcw size={12} /> {t('exam.resumed')}
          </span>
        )}
        {examDay ? (
          <span className={`${chip} bg-danger-soft text-danger-soft-fg`}>{t('exam.examDay')}</span>
        ) : (
          <LayoutSwitcher layout={layout} onChange={onLayout} />
        )}

        {/* The view controls are one group: exam-day mode puts all of them
            away, so there is nothing to fiddle with mid-test. */}
        {!examDay && (
          <>
            {/* Hiding the keyboard hands its ~300px to the passage. */}
            <ToggleChip
              active={keyboardVisible}
              disabled={!isSplit}
              onClick={() => onShowKeyboard(!showKeyboard)}
              title={
                !isSplit
                  ? 'The keyboard is off in Stacked so the passage keeps the height'
                  : showKeyboard
                    ? 'Hide the on-screen keyboard'
                    : 'Show the on-screen keyboard'
              }
            >
              <KeyboardIcon size={14} />
              {t(keyboardVisible ? 'exam.hideKeyboard' : 'exam.showKeyboard')}
            </ToggleChip>

            {/* Redundant while the full keyboard is up, so it is disabled there. */}
            <ToggleChip
              active={!keyboardVisible && showKeys}
              disabled={keyboardVisible}
              onClick={() => onShowKeys(!showKeys)}
              title={
                keyboardVisible
                  ? 'Hide the keyboard first — the full keyboard already shows keys'
                  : showKeys
                    ? 'Stop showing the pressed key'
                    : 'Show only the key you press'
              }
            >
              <SquareDot size={14} />
              {t('exam.showKeys')}
            </ToggleChip>

            <ToggleChip
              active={showStats}
              onClick={() => onShowStats(!showStats)}
              title={showStats ? 'Hide the live metrics panel' : 'Show the live metrics panel'}
            >
              <Activity size={14} />
              {t(showStats ? 'exam.hideStats' : 'exam.showStats')}
            </ToggleChip>
          </>
        )}

        {fullscreen.supported && (
          <ToggleChip
            active={fullscreen.isFullscreen}
            onClick={fullscreen.toggle}
            title={fullscreen.isFullscreen ? 'Exit full screen' : 'Full screen'}
          >
            {fullscreen.isFullscreen ? <Minimize size={14} /> : <Maximize size={14} />}
          </ToggleChip>
        )}
      </div>
      {timer}
    </div>
  );
}
