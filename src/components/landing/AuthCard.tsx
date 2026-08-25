import { ArrowRight, Mail, ShieldCheck } from 'lucide-react';
import { Button } from '@/ui/Button';

const META = ['English + हिन्दी', 'Image · PDF · DOCX · Text', 'macOS desktop & web'];

interface Props {
  onGuest: () => void;
  busy?: boolean;
}

/** Right-hand sign-in column. Guest-first; email sign-in lands with the backend. */
export function AuthCard({ onGuest, busy = false }: Props) {
  return (
    <section className="flex flex-col items-center justify-center gap-10 p-6 sm:p-10">
      <div className="rise-in w-full max-w-sm">
        <h2 className="text-2xl font-bold tracking-tight">Get started</h2>
        <p className="mt-2 text-sm leading-relaxed text-fg-muted">
          No sign-up, no setup. Every feature is unlocked and your results stay on this device.
        </p>

        <Button size="lg" className="mt-7 w-full" onClick={onGuest} disabled={busy}>
          {busy ? 'Opening…' : 'Continue as guest'}
          {!busy && <ArrowRight size={16} />}
        </Button>

        <div className="my-6 flex items-center gap-3">
          <span className="h-px flex-1 bg-line" />
          <span className="text-[11px] font-medium tracking-wide text-fg-subtle uppercase">or</span>
          <span className="h-px flex-1 bg-line" />
        </div>

        <button
          type="button"
          disabled
          className="flex w-full cursor-not-allowed items-center justify-center gap-2 rounded-control border border-line bg-surface px-4 py-2.5 text-sm font-semibold text-fg-subtle"
        >
          <Mail size={16} />
          Sign in with email
          <span className="ml-1 rounded-full bg-surface-3 px-2 py-0.5 text-[10px] font-bold tracking-wide text-fg-muted uppercase">
            Soon
          </span>
        </button>

        <p className="mt-8 flex items-start gap-2 text-xs leading-relaxed text-fg-subtle">
          <ShieldCheck size={14} className="mt-px shrink-0" />
          Accounts, cloud sync and subscriptions arrive with the backend. Nothing is uploaded today.
        </p>
      </div>

      <div className="flex w-full max-w-sm flex-col gap-2.5">
        <ul className="flex flex-wrap items-center gap-x-2 gap-y-1 text-[11px] text-fg-subtle">
          {META.map((item, i) => (
            <li key={item} className="flex items-center gap-2">
              {i > 0 && <span className="text-fg-subtle">·</span>}
              {item}
            </li>
          ))}
        </ul>

        <a
          href="https://github.com/enjoys-in"
          target="_blank"
          rel="noreferrer noopener"
          className="flex w-fit items-center gap-1.5 text-[11px] font-medium text-fg-subtle transition-colors hover:text-fg-muted"
        >
          <GithubMark />
          Built by enjoys
        </a>
      </div>
    </section>
  );
}

/** GitHub mark — lucide v1 dropped brand icons, so it lives here inline. */
function GithubMark() {
  return (
    <svg viewBox="0 0 16 16" width={12} height={12} fill="currentColor" aria-hidden="true">
      <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.07-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82a7.4 7.4 0 0 1 2-.27c.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A7.995 7.995 0 0 0 16 8c0-4.42-3.58-8-8-8Z" />
    </svg>
  );
}
