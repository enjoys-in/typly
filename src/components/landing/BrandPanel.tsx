import { Gauge, ListChecks, ScanText, WifiOff, type LucideIcon } from 'lucide-react';
import { appConfig } from '@/config/appConfig';
import { TypingPreview } from './TypingPreview';
import { useT } from '@/i18n';

const FEATURES: { icon: LucideIcon; title: string; desc: string }[] = [
  {
    icon: ScanText,
    title: 'Any source becomes a test',
    desc: 'Photo, scanned PDF, .docx or pasted text — OCR runs on your machine.',
  },
  {
    icon: Gauge,
    title: 'Scored like the real exam',
    desc: 'SSC 35 WPM, Railway & Banking 30, Court 92% accuracy — with per-word penalties.',
  },
  {
    icon: ListChecks,
    title: 'Every mistake, categorised',
    desc: 'Wrong words, capitals, punctuation and missed characters, tracked over time.',
  },
  {
    icon: WifiOff,
    title: 'Offline, English + Hindi',
    desc: 'No account, no upload, no network. Your passages never leave the device.',
  },
];

const DEMO_PASSAGE = 'The candidate shall type the passage accurately.';
const DEMO_TYPED = 'The candidate shall typo the pas';

/** Left-hand marketing panel of the landing screen. Purely presentational. */
export function BrandPanel() {
  const t = useT();
  const Logo = appConfig.logo;

  return (
    <section className="brand-mesh brand-grid relative flex shrink-0 flex-col justify-between overflow-hidden p-8 text-white lg:h-full lg:p-10 xl:p-12">
      <div className="relative">
        <div className="flex items-center gap-3">
          <span className="flex h-11 w-11 items-center justify-center rounded-panel bg-white/15 ring-1 ring-white/25 backdrop-blur-sm">
            <Logo size={22} />
          </span>
          <div className="leading-tight">
            <p className="text-lg font-bold">{appConfig.name}</p>
            <p className="text-xs text-white/70">{t('brand.tagline')}</p>
          </div>
        </div>

        <h1 className="mt-8 max-w-md text-3xl leading-[1.1] font-bold tracking-tight lg:mt-12 lg:text-4xl xl:text-[2.75rem]">
          {t('landing.headline1')}
          <br />
          {t('landing.headline2')}
        </h1>
        <p className="mt-3.5 max-w-md text-[15px] leading-relaxed text-white/75 lg:mt-4">
          {t('landing.blurb')}
        </p>

        <ul className="mt-10 hidden max-w-md space-y-5 lg:block">
          {FEATURES.map(({ icon: Icon, title, desc }) => (
            <li key={title} className="flex gap-3.5">
              <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-control bg-white/12 ring-1 ring-white/20">
                <Icon size={16} />
              </span>
              <div>
                <p className="text-sm font-semibold">{title}</p>
                <p className="mt-0.5 text-[13px] leading-relaxed text-white/65">{desc}</p>
              </div>
            </li>
          ))}
        </ul>
      </div>

      <div className="relative mt-8 max-w-md lg:mt-10">
        <div className="hidden lg:block">
          <TypingPreview passage={DEMO_PASSAGE} typed={DEMO_TYPED} />
        </div>
        <p className="mt-4 text-xs text-white/55">
          SSC · Railway (RRB) · Banking (IBPS) · Court · Custom profiles
        </p>
      </div>
    </section>
  );
}
