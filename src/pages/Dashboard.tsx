import { useNavigate } from 'react-router-dom';
import { ArrowRight, History as HistoryIcon, PlusCircle, type LucideIcon } from 'lucide-react';
import { appConfig } from '@/config/appConfig';

export function Dashboard() {
  const navigate = useNavigate();
  const Logo = appConfig.logo;

  return (
    <div className="space-y-7">
      {/* Home hero — same brand mesh as the landing screen, contained as a card. */}
      <section className="brand-mesh-band brand-grid relative overflow-hidden rounded-panel p-7 text-white shadow-sm sm:p-8">
        <div className="relative flex items-center gap-2.5">
          <span className="flex h-9 w-9 items-center justify-center rounded-control bg-white/15 ring-1 ring-white/25 backdrop-blur-sm">
            <Logo size={18} />
          </span>
          <span className="text-[11px] font-semibold tracking-[0.14em] text-white/70 uppercase">
            {appConfig.name}
          </span>
        </div>
        <h1 className="relative mt-6 text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="relative mt-1.5 max-w-sm text-sm leading-relaxed text-white/75">
          Turn any image, PDF, or paragraph into a typing exam.
        </p>
      </section>

      <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
        <ActionCard
          icon={PlusCircle}
          tone="primary"
          title="Start a new test"
          desc="Paste text or upload an image / PDF / document."
          onClick={() => navigate('/app/new')}
        />
        <ActionCard
          icon={HistoryIcon}
          tone="accent"
          title="Review history"
          desc="See your past results, WPM, and accuracy."
          onClick={() => navigate('/app/history')}
        />
      </div>

      <FlowStrip />
    </div>
  );
}

/* Static walkthrough of the existing flow — presentation only, nothing wired. */
const STEPS = [
  { title: 'Add a passage', desc: 'Paste text, or drop an image, PDF or .docx.' },
  { title: 'Pick the exam', desc: 'Choose the board, duration and language.' },
  { title: 'Type & review', desc: 'WPM, accuracy, and every mistake categorised.' },
];

function FlowStrip() {
  return (
    <section className="rounded-panel border border-line bg-surface p-6">
      <p className="text-[11px] font-semibold tracking-[0.14em] text-fg-subtle uppercase">
        How it works
      </p>
      <ol className="mt-5 grid gap-6 sm:grid-cols-3">
        {STEPS.map((step, i) => (
          <li key={step.title} className="flex gap-3">
            <span className="brand-gradient-text mt-px text-sm font-bold tabular-nums">
              {String(i + 1).padStart(2, '0')}
            </span>
            <div>
              <p className="text-sm font-semibold">{step.title}</p>
              <p className="mt-1 text-[13px] leading-relaxed text-fg-muted">{step.desc}</p>
            </div>
          </li>
        ))}
      </ol>
    </section>
  );
}

const TONE = {
  primary: { border: 'tile-primary', glow: 'tile-glow-primary', icon: 'brand-gradient' },
  accent: { border: 'tile-accent', glow: 'tile-glow-accent', icon: 'brand-accent-gradient' },
};

function ActionCard({
  icon: Icon,
  tone,
  title,
  desc,
  onClick,
}: {
  icon: LucideIcon;
  tone: keyof typeof TONE;
  title: string;
  desc: string;
  onClick: () => void;
}) {
  const t = TONE[tone];
  return (
    <button
      onClick={onClick}
      className={`group relative flex cursor-pointer flex-col items-start overflow-hidden rounded-panel border border-line bg-surface p-6 text-left transition-colors duration-150 hover:bg-surface-2 ${t.border}`}
    >
      <span
        aria-hidden
        className={`pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100 ${t.glow}`}
      />
      <div className="relative flex w-full items-start justify-between">
        <span
          className={`flex h-12 w-12 items-center justify-center rounded-control text-white ${t.icon}`}
        >
          <Icon size={22} />
        </span>
        <ArrowRight
          size={18}
          className="mt-1 shrink-0 text-fg-subtle transition-colors duration-150 group-hover:text-fg-muted"
        />
      </div>
      <h2 className="relative mt-4 text-base font-semibold">{title}</h2>
      <p className="relative mt-1 text-sm leading-relaxed text-fg-muted">{desc}</p>
    </button>
  );
}
