import { useState } from 'react';
import { Bug, Copy, ExternalLink, Lightbulb, MessageCircleQuestion, X } from 'lucide-react';
import { APP_VERSION, appConfig } from '@/config/appConfig';
import { isElectron, runtimeLine } from '@/platform/detect';
import { useAuthStore } from '@/store/authStore';
import { useSettingsStore } from '@/store/settingsStore';
import {
  MAX_CONTACT,
  MAX_MESSAGE,
  MAX_NAME,
  MIN_MESSAGE,
  ReportKind,
  issueBody,
  issueUrl,
  isTrimmed,
  validateReport,
  type ReportContext,
} from '@/core/report/issue';
import { Button } from '@/ui/Button';
import { Modal } from '@/ui/Modal';
import { Segmented, type SegmentedOption } from '@/ui/Segmented';
import { useT } from '@/i18n';

const TITLE_ID = 'report-panel-title';

interface Props {
  onClose: () => void;
}

/**
 * The report dialog.
 *
 * Name and message are both required, and the send action stays disabled until
 * they are filled in — a report with neither is a row nobody can act on, and
 * the person who has just hit a bug is the only one who can supply either.
 *
 * Everything else on the form is diagnostics the app already knows and the
 * reporter would otherwise be asked for in a follow-up comment.
 */
export function ReportPanel({ onClose }: Props) {
  const t = useT();
  const account = useAuthStore((s) => s.account);
  const uiLang = useSettingsStore((s) => s.uiLang);
  const [kind, setKind] = useState<ReportKind>(ReportKind.Bug);
  const [name, setName] = useState(account?.name ?? '');
  const [contact, setContact] = useState(account?.email ?? '');
  const [message, setMessage] = useState('');
  const [note, setNote] = useState<string | null>(null);
  // Set once the form has been submitted, so the required fields can go red
  // then rather than while they are still being typed into.
  const [tried, setTried] = useState(false);

  const repo = appConfig.about.repo.url;
  const input = { kind, name, message, contact };
  const valid = validateReport(input);
  const context: ReportContext = {
    appVersion: APP_VERSION,
    build: isElectron() ? 'Desktop' : 'Web',
    runtime: runtimeLine(),
    uiLang,
    userAgent: typeof navigator === 'undefined' ? undefined : navigator.userAgent,
  };

  const kinds: SegmentedOption<ReportKind>[] = [
    { value: ReportKind.Bug, label: t('report.kindBug'), icon: Bug },
    { value: ReportKind.Idea, label: t('report.kindIdea'), icon: Lightbulb },
    { value: ReportKind.Question, label: t('report.kindQuestion'), icon: MessageCircleQuestion },
  ];

  /** The whole report as text, for the clipboard. */
  async function copyReport(): Promise<boolean> {
    try {
      await navigator.clipboard.writeText(issueBody(input, context));
      return true;
    } catch {
      return false;
    }
  }

  async function copyOnly() {
    if (!ready()) return;
    setNote(t((await copyReport()) ? 'report.copied' : 'report.copyFailed'));
  }

  function ready(): boolean {
    setTried(true);
    if (!valid.ready) {
      setNote(t('report.needBoth'));
      return false;
    }
    setNote(null);
    return true;
  }

  /**
   * Hand GitHub the pre-filled form. The report is copied first when it had to
   * be trimmed to fit the URL, so nothing the reporter wrote is lost between
   * here and the comment box.
   */
  async function openOnGithub() {
    if (!ready()) return;
    const trimmed = isTrimmed(input, context);
    if (trimmed) await copyReport();
    const opened = window.open(issueUrl(repo, input, context), '_blank', 'noopener,noreferrer');
    if (!opened) {
      setNote(t((await copyReport()) ? 'report.blockedCopied' : 'report.blocked'));
      return;
    }
    setNote(t(trimmed ? 'report.openedTrimmed' : 'report.opened'));
  }

  return (
    <Modal onClose={onClose} labelledBy={TITLE_ID} size="lg">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 id={TITLE_ID} className="text-lg font-bold">
            {t('report.title')}
          </h2>
          <p className="mt-1 text-sm text-fg-muted">{t('report.lead')}</p>
        </div>
        <button
          type="button"
          onClick={onClose}
          aria-label={t('report.close')}
          className="cursor-pointer rounded-control p-1 text-fg-muted transition-colors hover:bg-surface-hover hover:text-fg"
        >
          <X size={18} />
        </button>
      </div>

      <div className="mt-5 space-y-4">
        <Segmented options={kinds} value={kind} onChange={setKind} ariaLabel={t('report.kind')} />

        <label className="flex flex-col gap-1.5">
          <span className="text-sm font-medium">
            {t('report.name')} <Required label={t('report.required')} />
          </span>
          <input
            value={name}
            maxLength={MAX_NAME}
            onChange={(e) => setName(e.target.value)}
            placeholder={t('report.namePlaceholder')}
            aria-invalid={tried && !valid.name}
            className="select max-w-sm"
          />
        </label>

        <label className="flex flex-col gap-1.5">
          <span className="text-sm font-medium">
            {t('report.message')} <Required label={t('report.required')} />
          </span>
          <textarea
            value={message}
            maxLength={MAX_MESSAGE}
            onChange={(e) => setMessage(e.target.value)}
            placeholder={t('report.messagePlaceholder')}
            aria-invalid={tried && !valid.message}
            aria-describedby="report-message-hint"
            className="scroll-area h-40 w-full resize-none rounded-control border border-edge bg-field p-3 text-sm outline-none transition-colors focus:border-accent focus:ring-4 focus:ring-accent-ring"
          />
          <span id="report-message-hint" className="text-xs text-fg-subtle">
            {valid.message
              ? t('report.messageCount', { count: MAX_MESSAGE - message.length })
              : t('report.messageMin', { count: MIN_MESSAGE })}
          </span>
        </label>

        <label className="flex flex-col gap-1.5">
          <span className="flex items-center gap-2 text-sm font-medium">
            {t('report.contact')}
            <span className="rounded-full bg-surface-3 px-2 py-0.5 text-[10px] font-bold tracking-wide text-fg-muted uppercase">
              {t('landing.optional')}
            </span>
          </span>
          <input
            value={contact}
            maxLength={MAX_CONTACT}
            onChange={(e) => setContact(e.target.value)}
            placeholder={t('report.contactPlaceholder')}
            className="select max-w-sm"
          />
        </label>

        {/* What travels with the report, spelled out rather than implied. This
            app keeps everything on the device, so anything leaving it is shown
            before it goes — and the issue is public once submitted. */}
        <div className="space-y-1 rounded-panel border border-line bg-surface-2 p-3 text-xs text-fg-muted">
          <p className="font-semibold text-fg">{t('report.attached')}</p>
          <p>
            {t('report.attachedLine', {
              version: context.appVersion,
              build: context.build,
              lang: context.uiLang,
            })}
          </p>
          <p>{t('report.publicWarning')}</p>
        </div>
      </div>

      <div className="mt-5 flex flex-wrap items-center gap-3 border-t border-line pt-5">
        {/* Enabled even when the form is incomplete: a dead button explains
            nothing, and clicking it is how the missing fields get named. */}
        {repo ? (
          <Button onClick={() => void openOnGithub()}>
            <ExternalLink size={16} /> {t('report.open')}
          </Button>
        ) : null}
        <Button variant="secondary" onClick={() => void copyOnly()}>
          <Copy size={16} /> {t('report.copy')}
        </Button>
        <Button variant="ghost" onClick={onClose}>
          {t('report.close')}
        </Button>
        {note && <span className="text-xs text-fg-muted">{note}</span>}
      </div>
    </Modal>
  );
}

function Required({ label }: { label: string }) {
  return (
    <span className="text-danger-text" title={label}>
      *<span className="sr-only"> {label}</span>
    </span>
  );
}
