import { useCallback, useMemo, useRef, useState } from 'react';
import { CircleCheck, KeyboardOff, RotateCcw, TriangleAlert } from 'lucide-react';
import {
  healthReport,
  healthKeys,
  healthy,
  type KeyHealth,
  type PressEvent,
} from '@/core/keyboard/health';
import { keyIdForChar } from '@/core/keyboard/layout';
import { KEY_ROWS } from '@/core/keyboard/layout';
import { Button } from '@/ui/Button';
import { Card } from '@/ui/Card';
import { ProgressBar } from '@/ui/ProgressBar';
import { useT } from '@/i18n';

/** Colour per verdict. Faults are loud; an untested key is simply cold. */
const TONE: Record<KeyHealth, string> = {
  untested: 'bg-surface-2 text-fg-subtle',
  ok: 'bg-accent-soft text-accent-soft-fg',
  sticky: 'bg-amber-500 text-white',
  ghosting: 'bg-danger text-danger-fg',
};

/**
 * Press every key once; the app says which ones are broken.
 *
 * Typly's users often practise on shared lab and cyber-café machines, and
 * discovering a half-dead `e` two minutes into a mock is a wasted session. All
 * three faults it can find — dead, sticky, ghosting — are visible in the timing
 * and shape of ordinary key events, which is all a browser ever gets.
 */
export function KeyboardHealthCheck() {
  const t = useT();
  const [running, setRunning] = useState(false);
  const [presses, setPresses] = useState<PressEvent[]>([]);
  const startedAt = useRef(0);
  // Keys currently held, so a key that reports itself down while another is
  // being pressed can be recognised as a phantom.
  const held = useRef(new Set<string>());

  const report = useMemo(() => healthReport(presses), [presses]);
  const total = healthKeys().length;

  const start = useCallback(() => {
    startedAt.current = Date.now();
    held.current.clear();
    setPresses([]);
    setRunning(true);
  }, []);

  const onKeyDown = useCallback(
    (event: React.KeyboardEvent) => {
      // The check *is* keyboard input, so nothing may be allowed to escape it —
      // not Tab, not a browser shortcut, not the space bar scrolling the page.
      event.preventDefault();
      if (event.key === 'Escape') {
        setRunning(false);
        return;
      }
      const id = event.key === ' ' ? ' ' : keyIdForChar(event.key);
      if (!id) return;
      // Anything already down that the user did not press is a ghost.
      const phantom = [...held.current].filter((other) => other !== id);
      held.current.add(id);
      setPresses((list) => [
        ...list,
        { id, t: Date.now() - startedAt.current, repeat: event.repeat, phantom },
      ]);
    },
    [],
  );

  const onKeyUp = useCallback((event: React.KeyboardEvent) => {
    event.preventDefault();
    held.current.delete(event.key === ' ' ? ' ' : keyIdForChar(event.key));
  }, []);

  const clean = healthy(report);

  return (
    <Card className="space-y-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="font-semibold">{t('health.title')}</h2>
          <p className="mt-0.5 text-sm text-fg-muted">{t('health.hint')}</p>
        </div>
        <Button variant={running ? 'secondary' : 'primary'} onClick={start}>
          <RotateCcw size={15} /> {t(running ? 'health.restart' : 'health.start')}
        </Button>
      </div>

      {/* The whole board is one focusable region rather than an input per key:
          key events carry the key, and a real text field would fight the
          layout being tested. */}
      <div
        role="application"
        aria-label={t('health.regionAria')}
        tabIndex={0}
        onKeyDown={running ? onKeyDown : undefined}
        onKeyUp={running ? onKeyUp : undefined}
        className={`space-y-1.5 rounded-panel border p-3 outline-none ${
          running
            ? 'border-accent bg-surface ring-4 ring-accent-ring'
            : 'border-line bg-surface-2 opacity-70'
        }`}
      >
        {KEY_ROWS.map((row, r) => (
          <div key={r} className="flex justify-center gap-1.5">
            {row.map((key) => {
              const verdict = report.keys.find((k) => k.id === key.id);
              const health = verdict?.health ?? 'untested';
              return (
                <span
                  key={key.id}
                  title={t(`health.${health}` as never)}
                  style={{ flexGrow: key.width, flexBasis: 0 }}
                  className={`flex h-9 items-center justify-center rounded-inner text-xs font-semibold shadow-e1 ring-1 ring-black/5 transition-colors ring-inset ${TONE[health]}`}
                >
                  {key.label}
                </span>
              );
            })}
          </div>
        ))}
      </div>

      <div className="space-y-2">
        <div className="flex items-baseline justify-between text-xs">
          <span className="font-medium tracking-wide text-fg-muted uppercase">
            {t('health.tested')}
          </span>
          <span className="tabular-nums text-fg-subtle">
            {report.tested}/{total}
          </span>
        </div>
        <ProgressBar value={(report.tested / total) * 100} />
      </div>

      {report.tested === 0 ? (
        <p className="text-sm text-fg-muted">
          {t(running ? 'health.pressKeys' : 'health.notStarted')}
        </p>
      ) : (
        <div className="space-y-2 border-t border-line pt-4 text-sm">
          {clean && report.complete && (
            <p className="flex items-center gap-2 font-semibold text-accent-text">
              <CircleCheck size={16} className="shrink-0" /> {t('health.allGood')}
            </p>
          )}
          {report.sticky.length > 0 && (
            <Finding icon={TriangleAlert} tone="text-amber-600 dark:text-amber-400">
              {t('health.stickyFound', { keys: report.sticky.map((k) => k.label).join(' ') })}
            </Finding>
          )}
          {report.ghosting.length > 0 && (
            <Finding icon={KeyboardOff} tone="text-danger-text">
              {t('health.ghostingFound', {
                keys: report.ghosting.map((k) => k.label).join(' '),
              })}
            </Finding>
          )}
          {!report.complete && (
            <p className="text-xs text-fg-muted">
              {t('health.remaining', { count: total - report.tested })}
            </p>
          )}
        </div>
      )}
    </Card>
  );
}

function Finding({
  icon: Icon,
  tone,
  children,
}: {
  icon: typeof TriangleAlert;
  tone: string;
  children: React.ReactNode;
}) {
  return (
    <p className={`flex items-start gap-2 ${tone}`}>
      <Icon size={16} className="mt-0.5 shrink-0" />
      <span>{children}</span>
    </p>
  );
}
