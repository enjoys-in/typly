import type { ReactNode } from 'react';
import { User } from 'lucide-react';
import type { ExamConfig, ExamProfile } from '@/core/types';
import { LANG_LABEL } from '@/core/constants';
import { useT } from '@/i18n';

interface Props {
  config: ExamConfig;
  profile: ExamProfile;
  /** Candidate name, from the profile — the header of a real client shows it. */
  candidate: string;
  /** The live countdown, placed where the real client puts it. */
  timer: ReactNode;
  children: ReactNode;
}

/**
 * The government exam client, imitated.
 *
 * Typly's profiles already model the *rules* exactly. What candidates panic
 * over on the day is the *interface*: a grey banded header with their name and
 * roll number, the passage in a boxed pane above a plain undecorated input, and
 * the countdown in the top right rather than wherever a nice app would put it.
 *
 * So this is deliberately ugly. The fixed slate palette is not a theming
 * oversight — the real client looks the same on every machine in every centre,
 * and a skin that followed the user's accent colour would defeat the purpose.
 */
export function ExamClientChrome({ config, profile, candidate, timer, children }: Props) {
  const t = useT();
  // A stable stand-in roll number: derived from the profile so it is the same
  // every run, and obviously synthetic so nobody mistakes it for a real one.
  const roll = `TY${String(profile.board.length * 137).padStart(4, '0')}2026`;

  return (
    <div className="flex min-h-0 flex-1 flex-col overflow-hidden rounded-md border border-slate-400 bg-slate-100 text-slate-900">
      <header className="flex flex-wrap items-center justify-between gap-3 border-b-2 border-slate-400 bg-slate-300 px-4 py-2">
        <div className="min-w-0">
          <p className="truncate text-sm font-bold">{profile.name}</p>
          <p className="truncate text-[11px] text-slate-700">
            {t('skin.section')} · {LANG_LABEL[config.lang]}
          </p>
        </div>
        <div className="flex items-center gap-4">
          <div className="hidden items-center gap-2 sm:flex">
            <span className="flex h-8 w-8 items-center justify-center rounded-sm border border-slate-500 bg-slate-200">
              <User size={15} className="text-slate-600" />
            </span>
            <div className="leading-tight">
              <p className="text-xs font-bold">{candidate || t('skin.candidate')}</p>
              <p className="text-[10px] text-slate-700 tabular-nums">{roll}</p>
            </div>
          </div>
          {/* Where it really sits: boxed, top right, impossible to ignore. */}
          <div className="rounded-sm border border-slate-500 bg-white px-3 py-1 text-center">
            <p className="text-[9px] font-bold tracking-wide text-slate-600 uppercase">
              {t('skin.timeLeft')}
            </p>
            <span className="text-slate-900">{timer}</span>
          </div>
        </div>
      </header>

      <div className="flex min-h-0 flex-1 flex-col gap-3 p-3">{children}</div>

      <footer className="border-t border-slate-400 bg-slate-200 px-4 py-1.5 text-[10px] text-slate-600">
        {t('skin.footer')}
      </footer>
    </div>
  );
}
