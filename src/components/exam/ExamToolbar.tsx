import {
  Activity,
  Keyboard as KeyboardIcon,
  Maximize,
  Minimize,
  RotateCcw,
  SquareDot,
} from 'lucide-react';
import type { ExamConfig, ExamProfile, Series } from '@/core/types';
import { EXAM_MODE_LABEL, ExamMode, LANG_LABEL, TimingMode } from '@/core/constants';
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

const chip =
  'inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[11px] font-semibold whitespace-nowrap';

/**
 * The exam header: what is being run, the view toggles, and the clock.
 *
 * Laid out as three bands rather than one long row of chips. Real exam software
 * puts the paper on the left and the clock hard right, and that is also the
 * order a candidate needs them in — identity is checked once, the clock is read
 * every few seconds. The view toggles are the only part that is ours, so they
 * are grouped into a single recessed rail and kept out of the way of both.
 */
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
  // Same derivation ExamRun uses to choose the clock, so the caption over it
  // cannot say "time left" above a stopwatch.
  const isCountdown = config.timing === TimingMode.Countdown;

  return (
    <header className="panel-lit flex shrink-0 flex-wrap items-center justify-between gap-x-5 gap-y-3 rounded-panel border border-line bg-surface px-4 py-3 shadow-e1">
      {/* ── What is being run ─────────────────────────────────────────────── */}
      <div className="flex min-w-0 items-center gap-3">
        {/* A board tab, not a bullet: the accent bar is the only colour in the
            header, so it is what the eye lands on first. */}
        <span aria-hidden className="bg-accent h-9 w-[3px] shrink-0 rounded-full" />
        <div className="min-w-0">
          <div className="flex min-w-0 flex-wrap items-center gap-2">
            <h1 className="truncate text-[0.9375rem] leading-tight font-bold">{profile.name}</h1>
            {config.examMode !== ExamMode.Standard && (
              <span className={`${chip} bg-accent-soft text-accent-soft-fg`}>
                {EXAM_MODE_LABEL[config.examMode]}
              </span>
            )}
            {examDay && (
              <span className={`${chip} bg-danger-soft text-danger-soft-fg`}>
                {t('exam.examDay')}
              </span>
            )}
            {resumed && (
              <span className={`${chip} bg-warn-soft text-warn-soft-fg`} title={t('exam.resumedHint')}>
                <RotateCcw size={11} /> {t('exam.resumed')}
              </span>
            )}
          </div>
          {/* The paper's provenance, in the small print — a candidate wants to
              know which notification these rules came from, once. */}
          <p className="mt-0.5 flex min-w-0 items-center gap-1.5 truncate text-[11px] text-fg-muted">
            <span className="truncate">{profile.source}</span>
            <span aria-hidden className="text-fg-subtle">
              ·
            </span>
            <span className="shrink-0">{LANG_LABEL[config.lang]}</span>
            {series && (
              <>
                <span aria-hidden className="text-fg-subtle">
                  ·
                </span>
                <span className="shrink-0 font-semibold text-fg-muted tabular-nums">
                  {t('exam.testOf', { current: series.index + 1, total: series.items.length })}
                </span>
              </>
            )}
          </p>
        </div>
      </div>

      {/* ── View controls, then the clock ─────────────────────────────────── */}
      <div className="flex flex-wrap items-center gap-2">
        {/* The view controls are one group: exam-day mode puts all of them
            away, so there is nothing to fiddle with mid-test. */}
        {!examDay && <LayoutSwitcher layout={layout} onChange={onLayout} />}

        {/* One recessed rail, so three toggles read as a single view-options
            control instead of three more buttons. `p-0.5` around an h-8 chip
            makes the rail exactly h-9 — the height of every other control on
            the row. */}
        {!examDay && (
          <div className="flex items-center gap-0.5 rounded-control border border-line bg-surface-3 p-0.5">
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
              <span className="hidden lg:inline">
                {t(keyboardVisible ? 'exam.hideKeyboard' : 'exam.showKeyboard')}
              </span>
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
              <span className="hidden lg:inline">{t('exam.showKeys')}</span>
            </ToggleChip>

            <ToggleChip
              active={showStats}
              onClick={() => onShowStats(!showStats)}
              title={showStats ? 'Hide the live metrics panel' : 'Show the live metrics panel'}
            >
              <Activity size={14} />
              <span className="hidden lg:inline">
                {t(showStats ? 'exam.hideStats' : 'exam.showStats')}
              </span>
            </ToggleChip>
          </div>
        )}

        {fullscreen.supported && (
          <div className="flex items-center rounded-control border border-line bg-surface-3 p-0.5">
            <ToggleChip
              active={fullscreen.isFullscreen}
              onClick={fullscreen.toggle}
              title={fullscreen.isFullscreen ? 'Exit full screen' : 'Full screen'}
            >
              {fullscreen.isFullscreen ? <Minimize size={14} /> : <Maximize size={14} />}
            </ToggleChip>
          </div>
        )}

        {/* Boxed and hard right, where every exam client in the country puts
            it. The label is what makes a bare 9:48 unambiguous under pressure. */}
        {timer && (
          <div className="ml-1 flex items-center gap-2.5 rounded-control border border-line bg-surface-2 py-1 pr-3.5 pl-3 shadow-e1">
            <span aria-hidden className="bg-accent live-dot h-1.5 w-1.5 shrink-0 rounded-full" />
            <div className="leading-none">
              <p className="text-[9.5px] font-bold tracking-[0.11em] text-fg-muted uppercase">
                {t(isCountdown ? 'skin.timeLeft' : 'exam.elapsed')}
              </p>
              <div className="mt-1">{timer}</div>
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
